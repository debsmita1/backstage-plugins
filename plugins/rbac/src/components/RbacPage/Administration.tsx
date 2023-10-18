/*
 * Copyright 2020 The Backstage Authors
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

import React from 'react';
import { useAsync } from 'react-use';

import { SidebarItem } from '@backstage/core-components';
import { IconComponent, useApi } from '@backstage/core-plugin-api';

import SupervisorAccount from '@material-ui/icons/SupervisorAccount';

import { rbacApiRef } from '../../api/RBACBackendClient';

/** @public */
export const Administration = (props: { icon?: IconComponent }) => {
  const rbacApi = useApi(rbacApiRef);
  const { loading: isUserLoading, value: result } = useAsync(
    async () => await rbacApi.getUserAuthorization(),
    [],
  );

  if (!isUserLoading) {
    const Icon = props.icon ? props.icon : SupervisorAccount;
    return result?.status === 'Authorized' ? (
      <SidebarItem text="Administration" to="rbac" icon={Icon} />
    ) : null;
  }
  return null;
};
