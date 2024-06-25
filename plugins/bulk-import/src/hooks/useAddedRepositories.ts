import React from 'react';
import { useAsync, useAsyncRetry, useInterval } from 'react-use';

import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import { AddRepositoriesData, RepositoryStatus } from '../types';
import { getPRTemplate } from '../utils/repository-utils';

export const useAddedRepositories = (
  pollInterval?: number,
): {
  loading: boolean;
  data: AddRepositoriesData[];
  error: any;
} => {
  const [addedRepositoriesData, setAddedRepositoriesData] = React.useState<
    AddRepositoriesData[]
  >([]);
  const identityApi = useApi(identityApiRef);
  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });
  const bulkImportApi = useApi(bulkImportApiRef);
  const {
    value: addedRepositories,
    error,
    loading,
    // retry,
  } = useAsync(async () => await bulkImportApi.getImportJobs());
  React.useEffect(() => {
    const prepareDataForAddedRepositories = () => {
      const repoData: AddRepositoriesData[] = addedRepositories?.map(
        (val: any) => ({
          id: val.id,
          repoName: val.repository.name,
          defaultBranch: val.repository.defaultBranch,
          orgName: val.repository.organization,
          repoUrl: val.repository.url,
          organizationUrl: val.repository.url.substring(
            0,
            val.repository.url.indexOf(val.repository.name) - 1,
          ),
          catalogInfoYaml: {
            status: val.status
              ? RepositoryStatus[val.status as RepositoryStatus]
              : RepositoryStatus.NotGenerated,
            prTemplate: getPRTemplate(
              val.name,
              val.organization,
              user as string,
            ),
            pullRequest: val?.github?.pullRequest?.url || '',
            lastUpdated: val.lastUpdate,
          },
        }),
      );
      setAddedRepositoriesData(repoData);
    };
    prepareDataForAddedRepositories();
  }, [addedRepositories, user]);

  // useInterval(
  //   () => {
  //     retry();
  //   },
  //   loading ? null : pollInterval || 10000,
  // );

  return {
    loading,
    data: addedRepositoriesData,
    error,
  };
};
