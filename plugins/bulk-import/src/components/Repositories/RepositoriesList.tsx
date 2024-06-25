import React from 'react';
import { useAsync } from 'react-use';

import { ErrorPage, Table } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { makeStyles } from '@material-ui/core';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { useAddedRepositories } from '../../hooks/useAddedRepositories';
import { columns } from './RepositoriesListColumns';
import { RepositoriesListToolbar } from './RepositoriesListToolbar';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const RepositoriesList = () => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  // const bulkImportApi = useApi(bulkImportApiRef);
  // const {
  //   value: createJobs,
  //   error: err,
  //   loading: lo,
  // } = useAsync(async () => await bulkImportApi.dryRunCreateImportJobs());

  const {
    data: importJobs,
    error: errJobs,
    loading: loadingJobs,
  } = useAddedRepositories();

  // console.log('!!!!!jobs ', createJobs);
  // console.log('!!!!err ', err);
  // console.log('!!!!loading ', lo);
  // const { value: user } = useAsync(async () => {
  //   const identityRef = await identityApi.getBackstageIdentity();
  //   return identityRef.userEntityRef;
  // });

  // useEffect(() => {
  //   if (user) {
  //     const fetchedData = getDataForRepositories(user || '').filter(
  //       (data: AddRepositoriesData) =>
  //         data.catalogInfoYaml?.status === RepositoryStatus.ADDED,
  //     );
  //     const repositories: { [key: string]: AddRepositoriesData } = {};
  //     fetchedData.forEach(repo => {
  //       repositories[repo.repoName || ''] = repo;
  //     });
  //     setFieldValue('repositories', repositories);
  //   }
  // }, [user, setFieldValue]);

  if (errJobs) {
    return <ErrorPage status={errJobs.name} statusMessage={errJobs.message} />;
  }

  return (
    <>
      <RepositoriesListToolbar />
      <Table
        title={
          loadingJobs || !importJobs
            ? 'Added repositories'
            : `Added repositories (${importJobs.length})`
        }
        options={{ padding: 'default', search: true, paging: true }}
        data={importJobs ?? []}
        isLoading={loadingJobs}
        columns={columns}
        emptyContent={
          <div
            data-testid="added-repositories-table-empty"
            className={classes.empty}
          >
            No records found
          </div>
        }
      />
    </>
  );
};
