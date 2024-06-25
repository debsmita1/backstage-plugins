import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { useTheme } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { Formik, FormikHelpers } from 'formik';
import * as yaml from 'yaml';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { ImportJobResponse } from '../../api/response-types';
import {
  AddRepositoriesFormValues,
  ApprovalTool,
  RepositorySelection,
} from '../../types';
import { AddRepositoriesForm } from './AddRepositoriesForm';
import { Illustrations } from './Illustrations';

export const AddRepositoriesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: RepositorySelection.Repository,
    repositories: {},
    approvalTool: ApprovalTool.Git,
  };

  const bulkImportApi = useApi(bulkImportApiRef);

  const handleSubmit = async (
    values: AddRepositoriesFormValues,
    formikHelpers: FormikHelpers<AddRepositoriesFormValues>,
  ) => {
    console.log('!!!!values  ', values);
    const importRepositories = Object.values(values.repositories).reduce(
      (acc: any[], repo) => {
        acc.push({
          approvalTool: values.approvalTool.toLocaleUpperCase(),
          catalogEntityName: repo.catalogInfoYaml?.prTemplate.componentName,
          repository: {
            url: repo.repoUrl,
            name: repo.repoName,
            organization: repo.orgName,
            defaultBranch: repo.defaultBranch,
          },
          catalogInfoContent: yaml.stringify(
            repo.catalogInfoYaml?.prTemplate.yaml,
            null,
            2,
          ),
          github: {
            pullRequest: {
              title: repo.catalogInfoYaml?.prTemplate.prTitle,
              body: repo.catalogInfoYaml?.prTemplate.prDescription,
            },
          },
        });
        return acc;
      },
      [],
    );

    bulkImportApi
      .createImportJobs(importRepositories, true)
      .then(async (response: ImportJobResponse[]) => {
        await bulkImportApi.createImportJobs(importRepositories);
        // if (response.errors.length > 0 === 'Successful') {
        //   formikHelpers.setSubmitting(true);
        //   await bulkImportApi.createImportJobs(importRepositories);
        //   navigate(`../bulk-import/repositories`);
        // }
      })
      .catch(err => {
        console.log('!!!!!!err ', err);
      });
  };

  return (
    <Page themeId="tool">
      <Header title="Add repositories" type="Bulk import" typeLink=".." />
      <Content noPadding>
        <div style={{ padding: '24px' }}>
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
              sx={{
                flexDirection: 'row',
                display: 'flex',
                justifyContent: 'space-around',
                overflow: 'auto',
              }}
            >
              <Illustrations
                iconClassname={
                  theme.palette.type === 'dark'
                    ? 'icon-approval-tool-white'
                    : 'icon-approval-tool-black'
                }
                iconText="Choose approval tool (git/ServiceNow) for PR/ticket creation"
              />
              <Illustrations
                iconClassname={
                  theme.palette.type === 'dark'
                    ? 'icon-choose-repositories-white'
                    : 'icon-choose-repositories-black'
                }
                iconText="Choose repositories you want to add"
              />
              <Illustrations
                iconClassname={
                  theme.palette.type === 'dark'
                    ? 'icon-generate-cataloginfo-white'
                    : 'icon-generate-cataloginfo-black'
                }
                iconText="Generate a catalog-info.yaml file for each repository"
              />
              <Illustrations
                iconClassname={
                  theme.palette.type === 'dark'
                    ? 'icon-edit-pullrequest-white'
                    : 'icon-edit-pullrequest-black'
                }
                iconText="Edit the pull request details if needed"
              />
              <Illustrations
                iconClassname={
                  theme.palette.type === 'dark'
                    ? 'icon-track-status-white'
                    : 'icon-track-status-black'
                }
                iconText="Track the approval status"
              />
            </AccordionDetails>
          </Accordion>
        </div>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          <AddRepositoriesForm />
        </Formik>
      </Content>
    </Page>
  );
};
