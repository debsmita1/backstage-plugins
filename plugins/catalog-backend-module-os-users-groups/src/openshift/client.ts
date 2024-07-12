import { LoggerService } from '@backstage/backend-plugin-api';
import { KubernetesFetchError } from '@backstage/plugin-kubernetes-common';
import {
  ClusterDetails,
  KubernetesCredential,
} from '@backstage/plugin-kubernetes-node';
import { JsonObject } from '@backstage/types';

import { Cluster, KubeConfig } from '@kubernetes/client-node';
import fs from 'fs-extra';
import fetch, { RequestInit, Response } from 'node-fetch';

import * as https from 'https';

import {
  GroupRepresentationWithParentAndEntity,
  GroupTransformer,
  GroupV1,
  UserRepresentationWithEntity,
  UserTransformer,
  UserV1,
} from '../types';
import { parseGroup, parseUser } from '../utils/defaultUsertransformers';
import { statusCodeToErrorType } from '../utils/statusCode';
import { OpenshiftProviderConfig } from './config';

export interface OpenshiftClientBasedFetcherOptions {
  logger: LoggerService;
}

// eslint-disable-next-line consistent-return
// export function* traverseGroups(
//   group: GroupV1,
// ): IterableIterator<GroupRepresentationWithParent> {
//   yield group;
//   for (const g of group.users ?? []) {
//     (g as GroupRepresentationWithParent).parent = group.name!;
//     yield* traverseGroups(g);
//   }
// }

export class OpenshiftClient {
  static create(
    config: OpenshiftProviderConfig,
    logger: LoggerService,
  ): OpenshiftClient {
    return new OpenshiftClient(
      config.url,
      config.name,
      config.serviceAccountToken,
      logger,
    );
  }

  /**
   * @param baseUrl - baseUrl of Openshift cluster
   * @param clusterName - unique name of the Openshift cluster
   * @param tokenCredential - token for making API calls
   *
   */
  constructor(
    private readonly baseUrl: string,
    private readonly clusterName: string,
    private readonly tokenCredential: string, // TokenCredential,
    private readonly logger: LoggerService,
  ) {}

  private async handleUnsuccessfulResponse(
    clusterName: string,
    res: Response,
  ): Promise<KubernetesFetchError> {
    const resourcePath = new URL(res.url).pathname;
    this.logger.warn(
      `Received ${
        res.status
      } status when fetching "${resourcePath}" from cluster "${clusterName}"; body=[${await res.text()}]`,
    );
    return {
      errorType: statusCodeToErrorType(res.status),
      statusCode: res.status,
      resourcePath,
    };
  }

  private fetchResource(
    clusterDetails: ClusterDetails,
    credential: KubernetesCredential,
    group: string,
    apiVersion: string,
    plural: string,
    namespace?: string,
    labelSelector?: string,
  ): Promise<Response> {
    const encode = (s: string) => encodeURIComponent(s);
    let resourcePath = group
      ? `/apis/${encode(group)}/${encode(apiVersion)}`
      : `/api/${encode(apiVersion)}`;
    if (namespace) {
      resourcePath += `/namespaces/${encode(namespace)}`;
    }
    resourcePath += `/${encode(plural)}`;

    let url: URL;
    let requestInit: RequestInit;
    const authProvider =
      clusterDetails.authMetadata['kubernetes.io/auth-provider'];

    if (this.isServiceAccountAuthentication(authProvider, clusterDetails)) {
      [url, requestInit] = this.fetchArgsInCluster(credential);
    } else if (!this.isCredentialMissing(authProvider, credential)) {
      [url, requestInit] = this.fetchArgs(clusterDetails, credential);
    } else {
      return Promise.reject(
        new Error(`no bearer token for cluster '${clusterDetails.name}' found`),
      );
    }

    if (url.pathname === '/') {
      url.pathname = resourcePath;
    } else {
      url.pathname += resourcePath;
    }

    if (labelSelector) {
      url.search = `labelSelector=${encode(labelSelector)}`;
    }

    return fetch(url, requestInit);
  }

  private isCredentialMissing(
    authProvider: string,
    credential: KubernetesCredential,
  ) {
    return (
      authProvider !== 'localKubectlProxy' && credential.type === 'anonymous'
    );
  }

  private isServiceAccountAuthentication(
    authProvider: string,
    clusterDetails: ClusterDetails,
  ) {
    return (
      authProvider === 'serviceAccount' &&
      !clusterDetails.authMetadata.serviceAccountToken
      // && fs.pathExistsSync(Config.SERVICEACCOUNT_CA_PATH)
    );
  }

  private fetchArgsInCluster(
    credential: KubernetesCredential,
  ): [URL, RequestInit] {
    const requestInit: RequestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(credential.type === 'bearer token' && {
          Authorization: `Bearer ${credential.token}`,
        }),
      },
    };

    const kc = new KubeConfig();
    kc.loadFromCluster();
    // loadFromCluster is guaranteed to populate the cluster/user/context
    const cluster = kc.getCurrentCluster() as Cluster;

    const url = new URL(cluster.server);
    if (url.protocol === 'https:') {
      requestInit.agent = new https.Agent({
        ca: fs.readFileSync(cluster.caFile as string),
      });
    }
    return [url, requestInit];
  }

  private fetchArgs(
    clusterDetails: ClusterDetails,
    credential: KubernetesCredential,
  ): [URL, RequestInit] {
    const requestInit: RequestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(credential.type === 'bearer token' && {
          Authorization: `Bearer ${credential.token}`,
        }),
      },
    };

    const url: URL = new URL(clusterDetails.url);
    if (url.protocol === 'https:') {
      requestInit.agent = new https.Agent({
        ca: undefined,
        //   bufferFromFileOrString(
        //     clusterDetails.caFile,
        //     clusterDetails.caData,
        //   ) ?? undefined,
        rejectUnauthorized: false, // !clusterDetails.skipTLSVerify,
        ...(credential.type === 'x509 client certificate' && {
          cert: credential.cert,
          key: credential.key,
        }),
      });
    }
    return [url, requestInit];
  }

  /**
   * Get a collection of users and groups from Openshift cluster and
   * return an `AsyncIterable` of that resource
   *
   * @public
   * @param url - Resource in Microsoft Graph
   * @param credential -
   */
  async getOpenshiftUsersAndGroups(options?: {
    userTransformer?: UserTransformer;
    groupTransformer?: GroupTransformer;
    logger?: LoggerService;
  }) {
    const openshiftUsers = await this.fetchResource(
      { url: this.baseUrl, name: this.clusterName, authMetadata: {} },
      { type: 'bearer token', token: this.tokenCredential },
      'user.openshift.io',
      'v1',
      'users',
    ).then((r: Response): Promise<UserV1[]> => {
      return r.ok
        ? r.json().then(({ kind, items }) => {
            return items.map((item: JsonObject) => {
              return {
                ...item,
                kind: kind.replace(/(List)$/, ''),
                apiVersion: 'user.openshift.io/v1',
              };
            });
          })
        : this.handleUnsuccessfulResponse(this.clusterName, r);
    });

    const openshiftGroups = await this.fetchResource(
      { url: this.baseUrl, name: this.clusterName, authMetadata: {} },
      { type: 'bearer token', token: this.tokenCredential },
      'user.openshift.io',
      'v1',
      'groups',
    ).then((r: Response): Promise<GroupV1[]> => {
      return r.ok
        ? r.json().then(({ kind, items }) => {
            return items.map((item: JsonObject) => {
              return {
                ...item,
                kind: kind.replace(/(List)$/, ''),
                apiVersion: 'user.openshift.io/v1',
              };
            });
          })
        : this.handleUnsuccessfulResponse(this.clusterName, r);
    });

    const parsedGroups = await openshiftGroups.reduce(
      async (promise, g) => {
        const partial = await promise;
        const entity = await parseGroup(g, options?.groupTransformer);
        if (entity) {
          const group = {
            ...g,
            entity,
          } as GroupRepresentationWithParentAndEntity;
          partial.push(group);
        }
        return partial;
      },
      Promise.resolve([] as GroupRepresentationWithParentAndEntity[]),
    );

    const parsedUsers = await openshiftUsers.reduce(
      async (promise, u) => {
        const partial = await promise;
        const entity = await parseUser(
          u,
          parsedGroups,
          options?.userTransformer,
        );
        if (entity) {
          const user = { ...u, entity } as UserRepresentationWithEntity;
          partial.push(user);
        }
        return partial;
      },
      Promise.resolve([] as UserRepresentationWithEntity[]),
    );

    const groups = parsedGroups.map(g => {
      const entity = g.entity;
      entity.spec.members = g.entity.spec.members;
      // g.entity.spec.members?.map(
      //   m =>
      //     parsedUsers.find(p => p.metadata.name === m)?.entity.metadata.name!,
      // ) ?? [];
      entity.spec.children =
        g.entity.spec.children?.map(
          c =>
            parsedGroups.find(p => p.metadata.name === c)?.entity.metadata
              .name!,
        ) ?? [];
      entity.spec.parent = parsedGroups.find(
        p => p.metadata.name === entity.spec.parent,
      )?.entity.metadata.name;
      return entity;
    });

    return { users: parsedUsers.map(u => u.entity), groups };
  }
}
