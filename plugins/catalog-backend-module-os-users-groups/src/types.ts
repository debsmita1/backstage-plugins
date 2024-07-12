import { GroupEntity, UserEntity } from '@backstage/catalog-model';

import { V1ObjectMeta } from '@kubernetes/client-node';

export type UserV1 = {
  kind: string;
  apiVersion: string;
  fullName?: string;
  metadata: V1ObjectMeta;
  identities?: string[];
};

export type GroupV1 = {
  apiVersion: string;
  kind: string;
  metadata: V1ObjectMeta;
  users: string[];
};

export interface GroupRepresentationWithParent extends GroupV1 {
  parent?: string;
}

export interface GroupRepresentationWithParentAndEntity
  extends GroupRepresentationWithParent {
  entity: GroupEntity;
}

export interface UserRepresentationWithEntity extends UserV1 {
  entity: UserEntity;
}
/**
 * Customize the ingested User entity
 *
 * @public
 *
 * @param {UserEntity} entity The output of the default parser
 * @param {UserV1} user Openshift user
 * @param {GroupRepresentationWithParentAndEntity[]} groups Data about available groups (can be used to create additional relationships)
 *
 * @returns {Promise<UserEntity | undefined>} Resolve to a modified `UserEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type UserTransformer = (
  entity: UserEntity,
  user: UserV1,
  groups: GroupRepresentationWithParentAndEntity[],
) => Promise<UserEntity | undefined>;

/**
 * Customize the ingested Group entity
 *
 * @public
 *
 * @param {GroupEntity} entity The output of the default parser
 * @param {GroupV1} group Keycloak group representation
 *
 * @returns {Promise<GroupEntity | undefined>} Resolve to a modified `GroupEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type GroupTransformer = (
  entity: GroupEntity,
  group: GroupV1,
) => Promise<GroupEntity | undefined>;
