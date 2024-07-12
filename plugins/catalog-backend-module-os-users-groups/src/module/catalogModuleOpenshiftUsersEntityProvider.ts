import {
  coreServices,
  createBackendModule,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

import { OpenshiftEntityProvider } from '../providers/OpenshiftEntityProvider';
import { GroupTransformer, UserTransformer } from '../types';

export interface OpenshiftTransformersExtensionPoint {
  /**
   * Set the function that transforms a user in Openshift to an entity.
   */
  setUserTransformer(transformer: UserTransformer): void;

  /**
   * Set the function that transforms a group in Openshift to an entity.
   */
  setGroupTransformer(transformer: GroupTransformer): void;
}

/**
 * Extension point used to customize the transforms used by the module.
 *
 * @alpha
 */
export const openshiftTransformersExtensionPoint =
  createExtensionPoint<OpenshiftTransformersExtensionPoint>({
    id: 'openshift.transformer',
  });

/**
 * The os-users-groups backend module for the catalog plugin.
 *
 * @alpha
 */
export const catalogModuleOpenshiftUsersEntityProvider = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'catalog-backend-module-openshift',
  register(reg) {
    let userTransformer: UserTransformer | undefined;
    let groupTransformer: GroupTransformer | undefined;
    reg.registerExtensionPoint(openshiftTransformersExtensionPoint, {
      setUserTransformer(transformer) {
        if (userTransformer) {
          throw new Error('User transformer may only be set once');
        }
        userTransformer = transformer;
      },
      setGroupTransformer(transformer) {
        if (groupTransformer) {
          throw new Error('Group transformer may only be set once');
        }
        groupTransformer = transformer;
      },
    });
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, config, logger, scheduler }) {
        catalog.addEntityProvider(
          OpenshiftEntityProvider.fromConfig(config, {
            id: 'development',
            logger,
            scheduler,
            userTransformer: userTransformer,
            groupTransformer: groupTransformer,
          }),
        );
      },
    });
  },
});
