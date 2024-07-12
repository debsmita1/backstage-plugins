import { LoggerService } from '@backstage/backend-plugin-api';
import { GroupEntity, UserEntity } from '@backstage/catalog-model';

import {
  GroupRepresentationWithParent,
  GroupRepresentationWithParentAndEntity,
  GroupTransformer,
  UserTransformer,
  UserV1,
} from '../types';

export const fallbackGroupTransformer: GroupTransformer = async entity =>
  entity;

export const fallbackUserTransformer: UserTransformer = async entity => entity;

export interface OpenshiftClientBasedFetcherOptions {
  logger: LoggerService;
}

export const parseGroup = async (
  openshiftGroup: GroupRepresentationWithParent,
  groupTransformer?: GroupTransformer,
): Promise<GroupEntity | undefined> => {
  const transformer = groupTransformer ?? fallbackGroupTransformer;
  const entity: GroupEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: openshiftGroup.metadata.name!,
      annotations: {},
      namespace: 'default',
    },
    spec: {
      type: 'team',
      profile: {
        displayName: openshiftGroup.metadata.name!,
      },
      // children, parent and members are updated again after all group and user transformers applied.
      children: [], // Openshift groups donot have sub-groups
      parent: '',
      members: openshiftGroup.users,
    },
  };

  return await transformer(entity, openshiftGroup);
};

export const parseUser = async (
  user: UserV1,
  openshiftGroups: GroupRepresentationWithParentAndEntity[],
  userTransformer?: UserTransformer,
): Promise<UserEntity | undefined> => {
  const transformer = userTransformer ?? fallbackUserTransformer;
  const entity: UserEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: user.metadata.name!,
      annotations: {},
      namespace: 'default',
    },
    spec: {
      profile: { displayName: user.fullName ?? user.metadata.name },
      memberOf: openshiftGroups
        .filter(g => g.users?.includes(user.metadata.name!))
        .map(g => g.entity.metadata.name),
    },
  };

  return await transformer(entity, user, openshiftGroups);
};
