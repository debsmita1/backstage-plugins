import * as React from 'react';
import { useEffect } from 'react';

import { makeStyles } from '@material-ui/core';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { AddRepositoriesData, Order } from '../../types';
import {
  filterSelectedForActiveDrawer,
  getComparator,
} from '../../utils/repository-utils';
import { RepositoriesColumnHeader } from './RepositoriesColumnHeader';
import { RepositoriesHeader } from './RepositoriesHeader';
import { RepositoryTableRow } from './RepositoryTableRow';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const OrganizationRepositoriesTable = ({
  searchString,
  selectedRepos,
  activeOrganization,
  updateSelectedRepos: parentCallback,
}: {
  searchString: string;
  selectedRepos: number[];
  activeOrganization: AddRepositoriesData;
  updateSelectedRepos: (ids: number[]) => void;
}) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('name');
  const [selected, setSelected] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const reposData = React.useMemo(() => {
    return (
      activeOrganization?.repositories?.map(repository => ({
        id: repository.id,
        name: repository.name,
        url: repository.url,
        organization: repository.organization,
        selectedRepositories: 0,
        catalogInfoYaml: repository.catalogInfoYaml,
      })) || []
    );
  }, [activeOrganization?.repositories]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // when load drawer, set selected rows with checked repos from its parent, the values come from form values
  useEffect(() => {
    setSelected(selectedRepos);
  }, [selectedRepos]);

  const filteredData = React.useMemo(() => {
    let filteredRows = reposData;

    if (searchString) {
      const f = searchString.toUpperCase();
      filteredRows = filteredRows.filter((addRepoData: AddRepositoriesData) => {
        const n = addRepoData.name?.toUpperCase();
        return n?.includes(f);
      });
    }
    filteredRows = [...filteredRows].sort(getComparator(order, orderBy));

    return filteredRows;
  }, [reposData, searchString, order, orderBy]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // When checked, select all repos that don't have the status 'Exists'
      const allReposFromOrg = filteredData.reduce<number[]>((acc, repo) => {
        if (repo.catalogInfoYaml?.status !== 'Exists') {
          acc.push(repo.id);
        } else {
          acc.push(-1);
        }
        return acc;
      }, []);

      const newSelected = Array.from(
        new Set([...selected, ...allReposFromOrg]),
      );
      setSelected(newSelected);
      parentCallback(newSelected);
    } else {
      // When unchecked, remove all filteredData IDs from the selected array
      const filteredIds = new Set(filteredData.map(repo => repo.id));
      const newSelected = selected.filter(id => !filteredIds.has(id));

      setSelected(newSelected);
      parentCallback(newSelected);
    }
  };

  const handleClick = (_event: React.MouseEvent, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    // update selected repos id in this drawer
    setSelected(newSelected);

    // update checked repos of its parent so header selected repos count changes
    parentCallback(newSelected);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reposData.length) : 0;

  const visibleRows = React.useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredData, page, rowsPerPage]);

  const selectedForActiveDrawer = React.useMemo(
    () =>
      filterSelectedForActiveDrawer(
        activeOrganization?.repositories || [],
        selected,
      ),
    [activeOrganization?.repositories, selected],
  );

  return (
    <>
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="drawer-repositories-table"
          size="medium"
        >
          <RepositoriesHeader
            numSelected={selectedForActiveDrawer.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={
              reposData.filter(r => r.catalogInfoYaml?.status !== 'Exists')
                .length
            }
            showOrganizations={false}
            isRepoSelectDrawer
          />
          {visibleRows?.length > 0 ? (
            <TableBody>
              {visibleRows.map(row => {
                const isItemSelected = isSelected(row.id);
                return (
                  <RepositoryTableRow
                    key={row.id}
                    handleClick={handleClick}
                    isItemSelected={isItemSelected}
                    data={row}
                    selectedRepositoryStatus={row.catalogInfoYaml?.status || ''}
                    isDrawer
                  />
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 55 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={RepositoriesColumnHeader.length}>
                  <div
                    data-testid="no-repositories-found"
                    className={classes.empty}
                  >
                    No records found
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[
          { value: 5, label: '5 rows' },
          { value: 10, label: '10 rows' },
          { value: 15, label: '15 rows' },
        ]}
        component="div"
        count={reposData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={null}
      />
    </>
  );
};
