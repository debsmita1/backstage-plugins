import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { IconButton, Tooltip } from '@material-ui/core';
import SyncIcon from '@mui/icons-material/Sync';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { AddRepositoriesData, AddRepositoriesFormValues } from '../../types';

type SyncRepositoryProps = {
  data: AddRepositoriesData;
};

const SyncRepository = ({ data }: SyncRepositoryProps) => {
  const bulkImportApi = useApi(bulkImportApiRef);
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();

  const handleClick = async () => {
    const value = await bulkImportApi.checkImportStatus(
      data.repoUrl as string,
      data.defaultBranch,
    );
    setFieldValue(
      `repositories.[${value.repository.name}].catalogInfoYaml.status`,
      value.status,
    );
    setFieldValue(
      `repositories.[${value.repository.name}].catalogInfoYaml.lastUpdated`,
      value.lastUpdate,
    );
  };

  return (
    <Tooltip title="Refresh">
      <span data-testid="refresh-repository">
        <IconButton
          color="inherit"
          onClick={() => handleClick()}
          aria-label="Refresh"
        >
          <SyncIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default SyncRepository;
