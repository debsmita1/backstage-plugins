import React from 'react';

import { Progress } from '@backstage/core-components';

import { useFormikContext } from 'formik';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  RepositorySelection,
} from '../../types';
import { getImportStatus } from '../../utils/repository-utils';
import { PreviewFile } from '../PreviewFile/PreviewFile';

export const CatalogInfoStatus = ({
  data,
  isItemSelected,
  alreadyAdded,
  isLoading,
  isDrawer,
}: {
  data: AddRepositoriesData;
  isLoading?: boolean;
  alreadyAdded?: number;
  isItemSelected?: boolean;
  isDrawer?: boolean;
}) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();

  const isSelected =
    isItemSelected ||
    (data.selectedRepositories && data.selectedRepositories.length > 0);
  const allSelected =
    values.repositoryType === RepositorySelection.Organization
      ? (data.selectedRepositories?.length || 0) + (alreadyAdded || 0) ===
        data.repositories?.length
      : !!isItemSelected;

  if (!isDrawer && (isSelected || allSelected)) {
    return <PreviewFile data={data} repositoryType={values.repositoryType} />;
  }

  if (!isDrawer && isLoading) {
    return <Progress />;
  }

  if (
    values?.repositories?.[data.repoName as string]?.catalogInfoYaml?.status
  ) {
    return (
      <span style={{ color: 'grey' }}>
        {getImportStatus(
          values?.repositories?.[data.repoName as string]?.catalogInfoYaml
            ?.status as string,
        )}
      </span>
    );
  }

  if (isDrawer) {
    return null;
  }

  return <span>Not Generated</span>;
};
