import React from 'react';

import { useFormikContext } from 'formik';

import { AddRepositoriesData, AddRepositoriesFormValues } from '../../types';
import { PreviewFile } from '../PreviewFile/PreviewFile';

export const CatalogInfoStatus = ({
  data,
  isItemSelected,
  alreadyAdded,
  isDrawer,
}: {
  data: AddRepositoriesData;
  alreadyAdded?: number;
  isItemSelected?: boolean;
  isDrawer?: boolean;
}) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  if (data.catalogInfoYaml?.status === 'Exists') {
    return <span style={{ color: 'grey' }}>Repository already added</span>;
  }
  if (isDrawer) {
    return null;
  }
  const isSelected =
    isItemSelected ||
    (data.selectedRepositories && data.selectedRepositories.length > 0);
  const allSelected =
    values.repositoryType === 'organization'
      ? (data.selectedRepositories?.length || 0) + (alreadyAdded || 0) ===
        data.repositories?.length
      : isItemSelected
      ? true
      : false;

  if (isSelected || allSelected) {
    return <PreviewFile data={data} repositoryType={values.repositoryType} />;
  }

  return <span>Not generated</span>;
};
