import React from 'react';
import { useAsync } from 'react-use';

import { Content, Header, InfoCard, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Grid, Typography } from '@material-ui/core';

import { rbacApiRef } from '../../api/RBACBackendClient';

export const RbacPage = () => {
  const rbacApi = useApi(rbacApiRef);
  const { value: roles } = useAsync(async () => await rbacApi.getRoles(), []);
  console.log('Roles ', roles);

  const { value: role } = useAsync(async () => await rbacApi.createRole(), []);
  console.log('createRole ', role);

  const { value: getrole } = useAsync(async () => await rbacApi.getRole(), []);
  console.log('getRole ', getrole);

  const { value: policies } = useAsync(
    async () => await rbacApi.listPermissions(),
    [],
  );
  console.log('policies ', policies);

  const { value: update } = useAsync(
    async () => await rbacApi.updateRole(),
    [],
  );
  console.log('updateRole ', update);

  const { value: newroles } = useAsync(
    async () => await rbacApi.getRoles(),
    [],
  );
  console.log('NEwRoles ', newroles);

  const { value: createPolicy } = useAsync(
    async () => await rbacApi.createPolicy(),
    [],
  );
  console.log('CreatePolicy ', createPolicy);

  const { value: deleteGRPRole } = useAsync(
    async () => await rbacApi.deleteUserOrGroupFromRole(),
    [],
  );
  console.log('DeleteGRPROle ', deleteGRPRole);
  const { value: newRoles1 } = useAsync(
    async () => await rbacApi.getRoles(),
    [],
  );
  console.log('Roles111 ', newRoles1);

  const { value: deleteRole } = useAsync(
    async () => await rbacApi.deleteRole(),
    [],
  );
  console.log('Deleterole ', deleteRole);
  const { value: newRoles2 } = useAsync(
    async () => await rbacApi.getRoles(),
    [],
  );
  console.log('Roles222 ', newRoles2);

  return (
    <Page themeId="tool">
      <Header title="Administration" />
      <Content>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard title="Information card">
              <Typography variant="body1">
                All content should be wrapped in a card like this.
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
