import React, { useState } from 'react';

import { useApi } from '@backstage/core-plugin-api';

import Delete from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { AddRepositoriesData } from '../../types';
import DeleteRepositoryDialog from './DeleteRepositoryDialog';

type DeleteRepositoryProps = {
  data: AddRepositoriesData;
};

const DeleteRepository = ({ data }: DeleteRepositoryProps) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = React.useState<string>('');
  const bulkImportApi = useApi(bulkImportApiRef);
  const handleClickRemove = async () => {
    const value = await bulkImportApi.removeRepository(
      data.repoUrl as string,
      data.defaultBranch,
    );
    console.log('!!!!deletevalue ', value);
    if (value?.error) {
      setError(`Unable to remove repository. ${value?.error.message}`);
    } else {
      setOpen(false);
    }
  };

  return (
    <>
      <Tooltip title="Remove">
        <span data-testid="delete-repository">
          <IconButton
            color="inherit"
            onClick={() => setOpen(true)}
            aria-label="Delete"
          >
            <Delete />
          </IconButton>
        </span>
      </Tooltip>
      {open && (
        <DeleteRepositoryDialog
          open={open}
          repository={data}
          error={error}
          closeDialog={() => setOpen(false)}
          removeRepository={handleClickRemove}
        />
      )}
    </>
  );
};

export default DeleteRepository;
