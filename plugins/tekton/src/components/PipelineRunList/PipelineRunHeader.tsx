import React from 'react';
import { chart_color_green_400 as tektonGroupColor } from '@patternfly/react-tokens/dist/js/chart_color_green_400';
import { Timestamp } from '@patternfly/react-core';
import { TableColumn } from '@backstage/core-components';
import ResourceBadge from './ResourceBadge';
import PlrStatus from './PlrStatus';
import LinkedPipelineRunTaskStatus from './LinkedPipelineRunTaskStatus';
import { pipelineRunDuration } from '../../utils/tekton-utils';
import { PipelineRunKind } from '../../types/pipelineRun';

import './PipelineRunHeader.css';
import { SortByDirection } from '../../hooks/useTableData';

export const PipelineRunHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'NAME',
    field: 'metadata.name',
    type: 'string',
    render: (row): React.ReactNode => (
      <ResourceBadge
        color={tektonGroupColor.value}
        abbr="PLR"
        name={(row as PipelineRunKind)?.metadata?.name || ''}
      />
    ),
  },
  {
    id: 'status',
    title: 'STATUS',
    field: 'status.conditions[0].reason',
    type: 'string',
    render: (row): React.ReactNode => (
      <PlrStatus obj={row as PipelineRunKind} />
    ),
  },
  {
    id: 'task-status',
    title: 'TASK STATUS',
    field: 'status.conditions[0].reason',
    type: 'string',
    render: (row): React.ReactNode => (
      <LinkedPipelineRunTaskStatus pipelineRun={row as PipelineRunKind} />
    ),
  },
  {
    id: 'start-time',
    title: 'STARTED',
    field: 'status.startTime',
    type: 'string',
    defaultSort: SortByDirection.desc,
    render: (row): React.ReactNode => {
      const startTime =
        (row as PipelineRunKind)?.status?.startTime &&
        new Date((row as PipelineRunKind)?.status?.startTime || '');
      return startTime ? (
        <Timestamp className="bs-tkn-timestamp" date={startTime} />
      ) : (
        '-'
      );
    },
  },
  {
    id: 'duration',
    title: 'DURATION',
    field: 'status.completionTime',
    type: 'string',
    render: (row): React.ReactNode =>
      pipelineRunDuration(row as PipelineRunKind),
  },
];
