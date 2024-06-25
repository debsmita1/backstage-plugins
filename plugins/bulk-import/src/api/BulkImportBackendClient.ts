import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { ImportJobResponse, ImportJobStatus } from './response-types';

// @public
export type BulkImportAPI = {
  getRepositories: () => Promise<any | Response>;
  getRepositoriesFromOrg: (orgName: string) => Promise<any | Response>;
  getOrganizations: () => Promise<any | Response>;
  getImportJobs: () => Promise<any | Response>;
  createImportJobs: (
    importRepositories: any[],
    dryRun?: boolean,
  ) => Promise<ImportJobResponse[]>;
  checkImportStatus: (
    repo: string,
    defaultBranch: string,
  ) => Promise<ImportJobStatus>;
  removeRepository: (
    repo: string,
    defaultBranch: string,
  ) => Promise<any | Response>;
};

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

// @public
export const bulkImportApiRef = createApiRef<BulkImportAPI>({
  id: 'plugin.bulk-import.service',
});

export class BulkImportBackendClient implements BulkImportAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  // private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    // this.identityApi = options.identityApi;
  }

  async getRepositories() {
    // const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/repositories`,
      {
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }

  async getOrganizations() {
    // const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/organizations`,
      {
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }

  async getRepositoriesFromOrg(orgName: string) {
    // const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/organizations/${orgName}/repositories`,
      {
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }

  async createImportJobs(importRepositories: any[], dryRun?: boolean) {
    // const { token: idToken } = await this.identityApi.getCredentials();

    // const body: any = [
    //   {
    //     approvalTool: 'GIT',
    //     repository: {
    //       url: 'https://github.com/che-electron/client',
    //       name: 'client',
    //       organization: 'che-electron',
    //       defaultBranch: 'master',
    //     },
    //     catalogInfoContent: yaml.stringify(
    //       defaultCatalogInfoYaml('client', 'che-electron'),
    //       null,
    //       2,
    //     ),
    //     github: {
    //       pullRequest: {
    //         title: 'Test creation of catalog-info.yaml',
    //         body: 'This is to check if catalog-info.yaml is created',
    //       },
    //     },
    //   },
    // ];

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      dryRun
        ? `${backendUrl}/api/bulk-import-backend/imports?dryRun=true`
        : `${backendUrl}/api/bulk-import-backend/imports`,
      {
        method: 'POST',
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importRepositories),
      },
    );
    return jsonResponse.json();
  }

  async getImportJobs() {
    // const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/imports`,
      {
        method: 'GET',
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }

  async checkImportStatus(repo: string, defaultBranch: string) {
    // const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/import/by-repo?repo=${repo}&defaultBranch=${defaultBranch}`,
      {
        method: 'GET',
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );

    return jsonResponse.json();
  }

  async removeRepository(repo: string, defaultBranch: string) {
    // const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/import/by-repo?repo=${repo}&defaultBranch=${defaultBranch}`,
      {
        method: 'DELETE',
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }
}
