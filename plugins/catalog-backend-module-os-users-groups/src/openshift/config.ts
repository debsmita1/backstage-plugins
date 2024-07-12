import {
  readTaskScheduleDefinitionFromConfig,
  TaskScheduleDefinition,
} from '@backstage/backend-tasks';
import { Config } from '@backstage/config';

import { trimEnd } from 'lodash';

/**
 * The configuration parameters for a single Openshift provider.
 *
 * @public
 */
export type OpenshiftProviderConfig = {
  name: string;
  url: string;
  authProvider?: string;
  skipTLSVerify?: boolean;
  skipMetricsLookup?: boolean;
  serviceAccountToken: string;
  schedule?: TaskScheduleDefinition;
};

/**
 * Parses configured providers.
 *
 * @param config - The root of the openshift config hierarchy
 *
 * @public
 */
export function readProviderConfigs(config: Config): OpenshiftProviderConfig[] {
  const providersConfig = config.getOptionalConfig(
    'catalog.providers.openshift',
  );
  if (!providersConfig) {
    return [];
  }

  if (providersConfig.has('url')) {
    // simple/single config variant
    return [readProviderConfig(providersConfig)];
  }

  return [];

  // enable this to read from multiple clusters

  // return providersConfig.keys().map(id => {
  //   const providerConfig = providersConfig.getConfig(id);

  //   return readProviderConfig(id, providerConfig);
  // });
}

/**
 * Parses a single configured provider by url.
 *
 * @param config - The root of the openshift config hierarchy
 *
 * @public
 */
export function readProviderConfig(config: Config): OpenshiftProviderConfig {
  const target = trimEnd(config.getOptionalString('url'), '/');
  const token = config.getOptionalString('serviceAccountToken');

  if (target && !token) {
    throw new Error(
      `serviceAccountToken must be provided when url is defined.`,
    );
  }

  const schedule = config.has('schedule')
    ? readTaskScheduleDefinitionFromConfig(config.getConfig('schedule'))
    : undefined;

  return {
    url: target,
    name: config.getOptionalString('name') || '',
    authProvider: config.getOptionalString('authProvider') || 'serviceAccount',
    serviceAccountToken: token || '',
    schedule,
  };
}
