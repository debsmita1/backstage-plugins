import * as React from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import ReadyIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  PullRequestPreviewData,
} from '../../types';
import { PreviewPullRequest } from './PreviewPullRequest';
import { PreviewPullRequests } from './PreviewPullRequests';

const useDrawerStyles = makeStyles(() => ({
  paper: {
    width: '40%',
    gap: '3%',
  },
}));

const useDrawerContentStyles = makeStyles(theme => ({
  createButton: {
    marginRight: theme.spacing(1),
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: theme.spacing(2.5),
  },
  body: {
    padding: theme.spacing(2.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: '14px',
    paddingTop: theme.spacing(2.5),
  },
}));

const PreviewFileSidebar = ({
  open,
  onClose,
  repositoryType,
  data,
}: {
  open: boolean;
  data: AddRepositoriesData;
  repositoryType: 'organization' | 'repository';
  onClose: () => void;
}) => {
  const classes = useDrawerStyles();
  const [formErrors, setFormErrors] = React.useState<PullRequestPreviewData>();
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();
  const [pullRequest, setPullRequest] = React.useState<PullRequestPreviewData>(
    {},
  );
  const contentClasses = useDrawerContentStyles();
  const initializePullRequest = () => {
    Object.keys(values?.repositories || {}).forEach(repo => {
      setPullRequest(prev => {
        return {
          ...prev,
          [repo]: values?.repositories?.[repo].catalogInfoYaml?.prTemplate,
        } as PullRequestPreviewData;
      });
    });
  };

  React.useEffect(() => {
    initializePullRequest();
  }, [values?.repositories]);

  const handleSave = (_event: any) => {
    Object.keys(pullRequest).forEach(pr => {
      setFieldValue(
        `repositories.${pr}.catalogInfoYaml.prTemplate`,
        pullRequest[pr],
      );
    });

    onClose();
  };

  const handleCancel = (_event: any) => {
    initializePullRequest();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      data-testid="preview-file-sidebar"
      classes={{
        paper: classes.paper,
      }}
    >
      <Box>
        <Box className={contentClasses.header}>
          <div>
            {repositoryType === 'repository' ? (
              <>
                <Typography variant="h5">
                  {`${data.orgName || data.organizationUrl}/${data.repoName}`}
                </Typography>
                <Link to={data.repoUrl as string}>{data.repoUrl}</Link>
              </>
            ) : (
              <>
                <Typography variant="h5">{`${data.orgName}`}</Typography>
                <Link to={data.repoUrl as string}>{data.organizationUrl}</Link>
              </>
            )}
          </div>

          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onClose}
            color="inherit"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className={contentClasses.body}>
          {repositoryType === 'repository' &&
            data.catalogInfoYaml?.prTemplate && (
              <PreviewPullRequest
                repoUrl={data.repoUrl as string}
                repoName={data.repoName as string}
                pullRequest={pullRequest}
                setPullRequest={setPullRequest}
                formErrors={formErrors as PullRequestPreviewData}
                setFormErrors={
                  setFormErrors as React.Dispatch<
                    React.SetStateAction<PullRequestPreviewData>
                  >
                }
              />
            )}
          {repositoryType === 'organization' && (
            <PreviewPullRequests
              repositories={data.selectedRepositories as AddRepositoriesData[]}
              pullRequest={pullRequest}
              formErrors={formErrors as PullRequestPreviewData}
              setFormErrors={
                setFormErrors as React.Dispatch<
                  React.SetStateAction<PullRequestPreviewData>
                >
              }
              setPullRequest={setPullRequest}
            />
          )}

          <div className={contentClasses.footer}>
            <Button
              variant="contained"
              onClick={handleSave}
              className={contentClasses.createButton}
              disabled={
                !!formErrors &&
                Object.values(formErrors).every(
                  fe => !!fe && Object.values(fe).length > 0,
                )
              }
            >
              Save
            </Button>
            <Link to="" variant="button" onClick={handleCancel}>
              <Button variant="outlined">Cancel</Button>
            </Link>
          </div>
        </Box>
      </Box>
    </Drawer>
  );
};

export const PreviewFile = ({
  data,
  repositoryType,
}: {
  data: AddRepositoriesData;
  repositoryType: 'organization' | 'repository';
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  return (
    <>
      <span>
        <ReadyIcon
          color="success"
          style={{ verticalAlign: 'sub', paddingTop: '7px' }}
        />
        Ready{' '}
        <Link to="" onClick={() => setSidebarOpen(true)}>
          Preview file
        </Link>
      </span>
      <PreviewFileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        data={data}
        repositoryType={repositoryType}
      />
    </>
  );
};
