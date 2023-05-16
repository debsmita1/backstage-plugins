import React from 'react';
import { findIndex } from 'lodash';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { TableColumn } from '@backstage/core-components';
import {
  Table as MUITable,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  TableSortLabel,
} from '@material-ui/core';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import { BackstageTheme } from '@backstage/theme';
import { SortByDirection, useTableData } from '../../hooks/useTableData';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  header: {
    color: theme.palette.text.primary,
  },
}));
type TableProps<D = any> = Partial<D> & {
  tableData: any[];
  columns: TableColumn[];
  title?: string;
  subTitle?: string;
  defaultSortOrder: SortByDirection;
  defaultSortField: string;
};

export const Table = ({
  tableData,
  columns,
  defaultSortOrder = SortByDirection.asc,
  defaultSortField = 'metadata.name',
}: TableProps) => {
  const getColumnField = React.useCallback(
    (id: string | undefined) =>
      id
        ? columns[
            findIndex(columns, {
              id,
            })
          ].field
        : null,
    [columns],
  );
  const getColumnFieldId = (field: string | undefined) =>
    field
      ? columns[
          findIndex(columns, {
            field,
          })
        ].id
      : null;
  const classes = useStyles();
  const [fieldActive, setFieldActive] = React.useState(false);
  const [currentSortField, setCurrentSortField] =
    React.useState(defaultSortField);
  const [currentSortFieldId, setCurrentSortFieldId] = React.useState(
    getColumnFieldId(defaultSortField),
  );
  const [currentSortOrder, setCurrentSortOrder] =
    React.useState(defaultSortOrder);

  const { data } = useTableData({
    propData: tableData,
    sortField: getColumnField(currentSortFieldId as string) ?? currentSortField,
    sortOrder: currentSortOrder,
  });

  const applySort = React.useCallback(
    (sortFieldId, direction) => {
      setCurrentSortField?.(getColumnField(sortFieldId) || '');
      setCurrentSortOrder?.(direction);
      setCurrentSortFieldId?.(sortFieldId);
      setFieldActive?.(true);
    },
    [
      setCurrentSortField,
      setCurrentSortOrder,
      setCurrentSortFieldId,
      setFieldActive,
      getColumnField,
    ],
  );

  const onSort = React.useCallback(
    (event, id) => {
      event.preventDefault();
      const orderBy =
        currentSortOrder === SortByDirection.asc
          ? SortByDirection.desc
          : SortByDirection.asc;
      applySort(id, orderBy);
    },
    [applySort, currentSortOrder],
  );

  const VirtuosoTableComponents: TableComponents = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: props => {
      return (
        <MUITable
          {...props}
          style={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
        />
      );
    },
    TableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => {
      return <TableBody {...props} ref={ref} />;
    }),
  };
  const fixedHeaderContent = React.useCallback(
    (props: any) => {
      const { onRequestSort } = props;
      const createSortHandler =
        (property: any) => (event: React.MouseEvent<unknown>) => {
          onRequestSort(event, property);
        };
      return (
        <TableRow>
          {columns.map(column => (
            <TableCell
              className={classes.header}
              key={
                (column?.id as React.Key) || `${column.field}-${column.title}}`
              }
              variant="head"
              align="left"
              style={{ width: column.width }}
              sortDirection={currentSortOrder}
            >
              <TableSortLabel
                active={fieldActive && currentSortFieldId === column.id}
                direction={currentSortOrder}
                onClick={createSortHandler(column.id)}
              >
                {column.title}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      );
    },
    [
      columns,
      currentSortOrder,
      currentSortFieldId,
      classes.header,
      fieldActive,
    ],
  );

  type RowFunctionArgs = {
    obj: any;
  };

  const RowMemo = React.memo<
    RowFunctionArgs & { row: React.FC<RowFunctionArgs> | null }
  >(({ row, ...props }) => {
    return row ? row(props.obj) : null;
  });

  /* const rowContent = React.useCallback(
    (_index: number, row: any) => {
      return (
        <>
          {columns.map(column => {
            return (
              <TableCell
                key={
                  (column?.id as React.Key) ??
                  `${column.field}-${column.title}}`
                }
                align="left"
              >
                {column?.render?.(row, 'row') ?? '-'}
              </TableCell>
            );
          })}
        </>
      );
    },
    [columns],
  ); */

  const rowContent = React.useCallback(
    (_index: number, row: any) => {
      return (
        <RowMemo
          row={obj => (
            <>
              {columns.map(column => {
                return (
                  <TableCell
                    key={
                      (column?.id as React.Key) ??
                      `${column.field}-${column.title}}`
                    }
                    align="left"
                  >
                    {column?.render?.(obj, 'row') ?? '-'}
                  </TableCell>
                );
              })}
            </>
          )}
          obj={row}
        />
      );
    },
    [columns, RowMemo],
  );

  return (
    <Paper style={{ height: 500 }}>
      <TableVirtuoso
        overscan={10}
        data={data}
        components={VirtuosoTableComponents}
        fixedHeaderContent={() => fixedHeaderContent({ onRequestSort: onSort })}
        itemContent={rowContent}
      />
    </Paper>
  );
};
