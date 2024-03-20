import React from 'react';

import { Content, Header, Page } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

import { AddRepositoriesFormValues } from '../../types';
import { AddRepositoriesForm } from './AddRepositoriesForm';
import { Illustrations } from './Illustrations';

const useStyles = makeStyles(() => ({
  illustration: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-around',
    overflow: 'scroll',
  },
}));

export const AddRepositoriesPage = () => {
  const styles = useStyles();
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: 'repository',
    repositories: [],
    organizations: [],
    approvalTool: 'git',
  };

  return (
    <Page themeId="tool">
      <Header title="Add repositories" type="Bulk import" typeLink=".." />
      <Content>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            id="add-repository-summary"
          >
            <Typography variant="h5">
              Add repositories to Red Hat Developer Hub in 5 steps
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            id="add-repository-illustrations"
            className={styles.illustration}
          >
            <Illustrations
              iconClassname="icon-approval-tool"
              iconText="Choose approval tool (git/ServiceNow) for PR/ticket creation"
            />
            <Illustrations
              iconClassname="icon-choose-repositories"
              iconText="Choose repositories you want to add"
            />
            <Illustrations
              iconClassname="icon-generate-cataloginfo"
              iconText="Generate a catalog-info.yaml file for each repository"
            />
            <Illustrations
              iconClassname="icon-edit-pullrequest"
              iconText="Edit the pull request details if needed"
            />
            <Illustrations
              iconClassname="icon-track-status"
              iconText="Track the approval status"
            />
          </AccordionDetails>
        </Accordion>
        <br />
        <AddRepositoriesForm initialValues={initialValues} />
      </Content>
    </Page>
  );
};
