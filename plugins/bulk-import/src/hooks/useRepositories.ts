import React from 'react';
import { useAsync } from 'react-use';

import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import { AddRepositoriesData, RepositoryStatus } from '../types';
import {
  createOrganizationData,
  getPRTemplate,
} from '../utils/repository-utils';

export const useRepositories = (
  pollInterval?: number,
): {
  loading: boolean;
  data: {
    repositoriesData: AddRepositoriesData[];
    organizationsData: AddRepositoriesData[];
  };
  error: any;
  // retry: () => void;
} => {
  const [repositoriesData, setRepositoriesData] = React.useState<
    AddRepositoriesData[]
  >([]);
  const [organizationsData, setOrganizationsData] = React.useState<
    AddRepositoriesData[]
  >([]);
  const identityApi = useApi(identityApiRef);
  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });
  const rbacApi = useApi(bulkImportApiRef);
  const {
    value: repositories,
    error,
    loading,
  } = useAsync(async () => await rbacApi.getRepositories());

  React.useEffect(() => {
    const prepareDataForRepositories = () => {
      const repoData = repositories?.repositories?.map((val: any) => ({
        id: val.id,
        repoName: val.name,
        orgName: val.organization,
        repoUrl: val.url,
        organizationUrl: val.url.substring(0, val.url.indexOf(val.name) - 1),
        catalogInfoYaml: {
          status: val.importStatus
            ? RepositoryStatus[val.importStatus as RepositoryStatus]
            : RepositoryStatus.NotGenerated,
          prTemplate: getPRTemplate(val.name, user as string),
        },
      }));
      setRepositoriesData(repoData);
      setOrganizationsData(createOrganizationData(repoData));
    };
    prepareDataForRepositories();
  }, [repositories?.repositories, user]);

  return {
    loading,
    data: {
      repositoriesData,
      organizationsData,
    },
    error,
  };
};
