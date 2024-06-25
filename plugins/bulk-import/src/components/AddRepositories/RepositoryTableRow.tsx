import * as React from 'react';
import { useAsync } from 'react-use';

import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  RepositoryStatus,
  SelectedRepository,
} from '../../types';
import { urlHelper } from '../../utils/repository-utils';
import { CatalogInfoStatus } from './CatalogInfoStatus';

export const RepositoryTableRow = ({
  handleClick,
  isItemSelected,
  data,
  // selectedRepositoryStatus,
  isDrawer = false,
}: {
  handleClick: (_event: React.MouseEvent, id: SelectedRepository) => void;
  isItemSelected: boolean;
  data: AddRepositoriesData;
  // selectedRepositoryStatus: string;
  isDrawer?: boolean;
}) => {
  const { values, setFieldValue } =
    useFormikContext<AddRepositoriesFormValues>();
  const tableCellStyle = {
    lineHeight: '1.5rem',
    fontSize: '0.875rem',
    padding: '15px 16px 15px 6px',
  };

  const bulkImportApi = useApi(bulkImportApiRef);
  const { value, loading } = useAsync(async () => {
    const result = await bulkImportApi.checkImportStatus(
      data.repoUrl as string,
      data.defaultBranch,
    );
    setFieldValue(
      `repositories.[${data.repoName}].catalogInfoYaml.status`,
      result.status,
    );
    return result.status;
  });

  // console.log("!!!!dataa ", data.repoName, ' ',data.id , ' ', isItemSelected);

  return (
    <TableRow
      hover
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={data.id}
      selected={isItemSelected}
    >
      <TableCell component="th" scope="row" padding="none" sx={tableCellStyle}>
        <Checkbox
          disableRipple
          color="primary"
          checked={
            value === RepositoryStatus.ADDED ||
            values?.repositories?.[data.repoName as string]?.catalogInfoYaml
              ?.status === RepositoryStatus.ADDED ||
            values?.repositories?.[data.repoName as string]?.catalogInfoYaml
              ?.status === RepositoryStatus.WAIT_PR_APPROVAL ||
            value === RepositoryStatus.WAIT_PR_APPROVAL
              ? true
              : isItemSelected
          }
          disabled={
            value === RepositoryStatus.ADDED ||
            values?.repositories?.[data.repoName as string]?.catalogInfoYaml
              ?.status === RepositoryStatus.ADDED ||
            values?.repositories?.[data.repoName as string]?.catalogInfoYaml
              ?.status === RepositoryStatus.WAIT_PR_APPROVAL ||
            value === RepositoryStatus.WAIT_PR_APPROVAL
          }
          onClick={event =>
            handleClick(event, {
              repoId: data.id,
              orgName: data.orgName as string,
            })
          }
          style={{ padding: '0 12px' }}
        />
        {data.repoName}
      </TableCell>
      <TableCell align="left" sx={tableCellStyle}>
        <Link to={data.repoUrl || ''}>
          <>
            {urlHelper(data?.repoUrl || '')}
            <OpenInNewIcon
              style={{ verticalAlign: 'sub', paddingTop: '7px' }}
            />
          </>
        </Link>
      </TableCell>
      {!isDrawer && (
        <TableCell align="left" sx={tableCellStyle}>
          <Link to={data?.organizationUrl || ''}>
            <>
              {urlHelper(data?.organizationUrl || '')}
              <OpenInNewIcon
                style={{ verticalAlign: 'sub', paddingTop: '7px' }}
              />
            </>
          </Link>
        </TableCell>
      )}

      <TableCell align="left" sx={tableCellStyle}>
        <CatalogInfoStatus
          data={data}
          isLoading={loading}
          isItemSelected={isItemSelected}
          isDrawer={isDrawer}
        />
      </TableCell>
    </TableRow>
  );
};
