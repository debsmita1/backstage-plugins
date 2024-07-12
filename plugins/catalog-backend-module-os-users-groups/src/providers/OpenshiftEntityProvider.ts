/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LoggerService } from '@backstage/backend-plugin-api';
import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';

import { merge } from 'lodash';
import * as uuid from 'uuid';

import { OpenshiftClient } from '../openshift/client';
import {
  OpenshiftProviderConfig,
  readProviderConfigs,
} from '../openshift/config';
import { GroupTransformer, UserTransformer } from '../types';

/**
 * Options for {@link OpenshiftEntityProvider}.
 *
 * @public
 */
export type OpenshiftEntityProviderOptions = {
  /**
   * A unique, stable identifier for this provider.
   *
   * @example "production"
   */
  id: string;
  /**
   * The logger to use.
   */
  logger: LoggerService;

  /**
   * The refresh schedule to use.
   *
   * @remarks
   *
   * If you pass in 'manual', you are responsible for calling the `read` method
   * manually at some interval.
   *
   * But more commonly you will pass in the result of
   * {@link @backstage/backend-tasks#PluginTaskScheduler.createScheduledTaskRunner}
   * to enable automatic scheduling of tasks.
   */
  schedule?: 'manual' | TaskRunner;

  /**
   * Scheduler used to schedule refreshes based on
   * the schedule config.
   */
  scheduler?: PluginTaskScheduler;

  /**
   * The function that transforms a user in Openshift to an entity.
   */
  userTransformer?: UserTransformer | Record<string, UserTransformer>;

  /**
   * The function that transforms a group in Openshift to an entity.
   */
  groupTransformer?: GroupTransformer | Record<string, GroupTransformer>;
};

// Makes sure that emitted entities have a proper location based on their uuid
export function withLocations(providerUrl: string, entity: Entity): Entity {
  const kind = entity.kind === 'Group' ? 'groups' : 'users';
  const location = `url:${providerUrl}/apis/user.openshift.io/v1/${kind}`; // re-check this location
  return merge(
    {
      metadata: {
        annotations: {
          [ANNOTATION_LOCATION]: location,
          [ANNOTATION_ORIGIN_LOCATION]: location,
        },
      },
    },
    entity,
  ) as Entity;
}

/**
 * Reads users and groups in Openshift cluster, and provides them as
 * User and Group entities for the catalog.
 *
 * @public
 */
export class OpenshiftEntityProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private scheduleFn?: () => Promise<void>;

  static fromConfig(
    configRoot: Config,
    options: OpenshiftEntityProviderOptions,
  ): OpenshiftEntityProvider[] {
    if (!options.schedule && !options.scheduler) {
      throw new Error('Either schedule or scheduler must be provided.');
    }

    function getTransformer<T extends Function>(
      name: string,
      transformers?: T | Record<string, T>,
    ): T | undefined {
      if (['undefined', 'function'].includes(typeof transformers)) {
        return transformers as T;
      }

      return (transformers as Record<string, T>)[name];
    }

    return readProviderConfigs(configRoot).map(providerConfig => {
      if (!options.schedule && !providerConfig.schedule) {
        throw new Error(
          `No schedule provided neither via code nor config for OpenshiftEntityProvider:${providerConfig.name}.`,
        );
      }

      let taskRunner;
      if (options.scheduler && providerConfig.schedule) {
        // Create a scheduled task runner using the provided scheduler and schedule configuration
        taskRunner = options.scheduler.createScheduledTaskRunner(
          providerConfig.schedule,
        );
      } else if (options.schedule) {
        // Use the provided schedule directly
        taskRunner = options.schedule;
      } else {
        throw new Error(
          `No schedule provided neither via code nor config for OpenshiftEntityProvider:${providerConfig.name}.`,
        );
      }

      const provider = new OpenshiftEntityProvider({
        provider: providerConfig,
        logger: options.logger,
        userTransformer: getTransformer(
          providerConfig.name,
          options.userTransformer,
        ),
        groupTransformer: getTransformer(
          providerConfig.url,
          options.groupTransformer,
        ),
      });

      if (taskRunner !== 'manual') {
        provider.schedule(taskRunner);
      }

      // provider.read({logger: options.logger})

      return provider;
    });
  }

  constructor(
    private options: {
      provider: OpenshiftProviderConfig;
      logger: LoggerService;
      userTransformer?: UserTransformer;
      groupTransformer?: GroupTransformer;
    },
  ) {}

  getProviderName() {
    return `OpenshiftEntityProvider:${this.options.provider.name}`;
  }

  async connect(connection: EntityProviderConnection) {
    this.connection = connection;
    await this.scheduleFn?.();
  }

  /**
   * Runs one complete ingestion loop. Call this method regularly at some
   * appropriate cadence.
   */
  async read(options?: { logger?: LoggerService }) {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const logger = options?.logger ?? this.options.logger;
    const { markReadComplete } = trackProgress(logger);
    const client = OpenshiftClient.create(this.options.provider, logger);
    const { users, groups } = await client.getOpenshiftUsersAndGroups({
      groupTransformer: this.options.groupTransformer,
      userTransformer: this.options.userTransformer,
      logger,
    });

    const { markCommitComplete } = markReadComplete({ users, groups });
    const en = [...users, ...groups].map(entity => ({
      locationKey: this.getProviderName(),
      entity: withLocations(this.options.provider.url, entity),
    }));

    await this.connection.applyMutation({
      type: 'full',
      entities: en,
    });
    markCommitComplete();
  }

  /**
   * Creates a function that can be used to schedule a refresh of the catalog.
   *
   * @param taskRunner - The instance of {@link TaskRunner}.
   *
   * @private
   */

  private schedule(taskRunner: TaskRunner) {
    this.scheduleFn = async () => {
      const id = `${this.getProviderName()}:refresh`;
      await taskRunner.run({
        id,
        fn: async () => {
          const logger = this.options.logger.child({
            class: OpenshiftEntityProvider.prototype.constructor.name,
            taskId: id,
            taskInstanceId: uuid.v4(),
          });

          try {
            await this.read({ logger });
          } catch (error: any) {
            logger.error('Error while syncing Openshift users and groups', {
              name: error.name,
              message: error.message,
              stack: error.stack,
              status: error.response?.status,
            });
          }
        },
      });
    };
  }
}

// Helps wrap the timing and logging behaviors
function trackProgress(logger: LoggerService) {
  let timestamp = Date.now();
  let summary: string;

  logger.info('Reading Openshift users and groups');

  function markReadComplete(read: { users: unknown[]; groups: unknown[] }) {
    summary = `${read.users.length} Openshift users and ${read.groups.length} Openshift groups`;
    const readDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    timestamp = Date.now();
    logger.info(`Read ${summary} in ${readDuration} seconds. Committing...`);
    return { markCommitComplete };
  }

  function markCommitComplete() {
    const commitDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    logger.info(`Committed ${summary} in ${commitDuration} seconds.`);
  }

  return { markReadComplete };
}
