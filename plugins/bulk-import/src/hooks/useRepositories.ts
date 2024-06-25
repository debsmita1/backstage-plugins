import React from 'react';
import { useAsync } from 'react-use';

import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import { AddRepositoriesData } from '../types';
import { getPRTemplate } from '../utils/repository-utils';

export const useRepositories = (
  showOrganizations: boolean,
  orgName?: string,
  pollInterval?: number,
): {
  loading: boolean;
  data: {
    repositories: AddRepositoriesData[];
    organizations: AddRepositoriesData[];
    totalRepositories: number;
    totalOrganizations: number;
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
  const bulkImportApi = useApi(bulkImportApiRef);

  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });
  const { value, error, loading } = useAsync(async () => {
    if (orgName) {
      return await bulkImportApi.getRepositoriesFromOrg(orgName);
    }
    if (showOrganizations) {
      return await bulkImportApi.getOrganizations();
    }
    return await bulkImportApi.getRepositories();
  }, [orgName, showOrganizations]);

  React.useEffect(() => {
    const prepareDataForRepositories = () => {
      const repoData: AddRepositoriesData[] =
        value?.repositories?.map((val: any) => ({
          id: val.id,
          repoName: val.name,
          defaultBranch: val.defaultBranch,
          orgName: val.organization,
          repoUrl: val.url,
          organizationUrl: val.url.substring(0, val.url.indexOf(val.name) - 1),
          catalogInfoYaml: {
            // status: importStatuses[val.name],
            prTemplate: getPRTemplate(
              val.name,
              val.organization,
              user as string,
            ),
          },
        })) || [];
      setRepositoriesData(repoData);
    };
    const prepareDataForOrganizations = () => {
      const orgData: AddRepositoriesData[] =
        value?.organizations?.map((val: any) => ({
          id: val.id,
          orgName: val.name,
          organizationUrl: val.url.replace('api.', ''),
        })) || [];
      setOrganizationsData(orgData);
    };
    if (showOrganizations) {
      prepareDataForOrganizations();
    } else {
      prepareDataForRepositories();
    }
  }, [value, user, showOrganizations]);

  return {
    loading,
    data: {
      repositories: repositoriesData,
      organizations: organizationsData,
      totalOrganizations: showOrganizations ? value?.totalCount : 0,
      totalRepositories: showOrganizations ? 0 : value?.totalCount,
    },
    error,
  };
};
