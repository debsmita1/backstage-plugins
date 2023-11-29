import React from 'react';

import { IconButton } from '@material-ui/core';
import DownloadIcon from '@material-ui/icons/GetApp';

import { downloadLogFile } from '@janus-idp/shared-react';

type TaskLogsDownloadProps = {
  logText: string;
  fileName: string;
  label: string;
};

export const TaskLogsDownload = ({
  logText,
  fileName,
  label,
}: TaskLogsDownloadProps) => {
  return logText ? (
    <IconButton
      aria-label={label.toLowerCase()}
      onClick={() => downloadLogFile(logText, `${fileName}.log`)}
      size="small"
      color="primary"
      style={{ justifyContent: 'right' }}
    >
      <DownloadIcon fontSize="small" />
      {label}
    </IconButton>
  ) : null;
};
