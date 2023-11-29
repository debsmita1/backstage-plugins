import React from 'react';

import { DismissableBanner, LogViewer } from '@backstage/core-components';

import { V1Container, V1Pod } from '@kubernetes/client-node';
import { Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { usePodLogsOfPipelineRun } from '../../hooks/usePodLogsOfPipelineRun';
import { TaskLogsDownload } from './PipelineRunLogsDownload';

type PipelineRunLogViewerProps = {
  pod: V1Pod;
  taskName: string;
  pipelineRun: string;
};

const getTaskLog = (
  containersList: V1Container[],
  value: { text: string }[],
) => {
  const text = containersList.reduce(
    (acc: string, container: V1Container, idx: number) => {
      if (container?.name && value?.[idx]?.text) {
        return acc
          .concat(`${container.name.toUpperCase()}\n${value[idx].text}`)
          .concat(idx === containersList.length - 1 ? '' : '\n');
      }
      return acc;
    },
    '',
  );
  return text;
};

export const PipelineRunLogViewer = ({
  pod,
  taskName,
  pipelineRun,
}: PipelineRunLogViewerProps) => {
  const { value, error, loading } = usePodLogsOfPipelineRun({
    pod,
  });

  let text = '';

  const taskLog = getTaskLog(
    pod?.spec?.containers || [],
    value as { text: string }[],
  );

  return (
    <>
      {error && (
        <DismissableBanner
          message={error?.message}
          variant="error"
          fixed={false}
          id="pod-logs"
        />
      )}
      <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {text && (
          <TaskLogsDownload
            fileName={taskName}
            logText={text}
            label="Download"
          />
        )}
        {text && (
          <TaskLogsDownload
            fileName={pipelineRun}
            logText={text}
            label="Download all task logs"
          />
        )}
      </span>
      <Paper
        elevation={1}
        style={{ height: '100%', width: '100%', minHeight: '30rem' }}
      >
        {loading && (
          <Skeleton
            data-testid="logs-skeleton"
            variant="rect"
            width="100%"
            height="100%"
          />
        )}
        {pod && !loading && <LogViewer text={taskLog || 'No Logs found'} />}
      </Paper>
    </>
  );
};
