import React from 'react';

import { Link } from '@backstage/core-components';

import { get } from 'lodash';

import { formatDate } from '@janus-idp/shared-react';

import {
  AddedRepositories,
  AddRepositoriesData,
  ImportStatus,
  Order,
  RepositoryStatus,
  SelectedRepository,
} from '../types';

const descendingComparator = (
  a: AddRepositoriesData,
  b: AddRepositoriesData,
  orderBy: string,
  isOrganization: boolean,
) => {
  let value1 = get(a, orderBy);
  let value2 = get(b, orderBy);
  const order = {
    [RepositoryStatus.ADDED]: 1,
    [RepositoryStatus.Ready]: 2,
    [RepositoryStatus.WAIT_PR_APPROVAL]: 3,
    [RepositoryStatus.PR_ERROR]: 4,
    [RepositoryStatus.NotGenerated]: 5,
  };

  if (orderBy === 'selectedRepositories') {
    value1 = value1?.length;
    value2 = value2?.length;
  }

  if (orderBy === 'catalogInfoYaml') {
    if (isOrganization) {
      value1 =
        order[
          (a.selectedRepositories?.[0]?.catalogInfoYaml
            ?.status as ImportStatus) || RepositoryStatus.NotGenerated
        ];
      value2 =
        order[
          (b.selectedRepositories?.[0]?.catalogInfoYaml
            ?.status as ImportStatus) || RepositoryStatus.NotGenerated
        ];
    } else {
      value1 =
        order[
          (value1?.status as ImportStatus) || RepositoryStatus.NotGenerated
        ];
      value2 =
        order[
          (value2?.status as ImportStatus) || RepositoryStatus.NotGenerated
        ];
    }
  }
  if (value2 < value1) {
    return -1;
  }
  if (value2 > value1) {
    return 1;
  }
  return 0;
};

export const getComparator = (
  order: Order,
  orderBy: string,
  isOrganization: boolean,
): ((a: AddRepositoriesData, b: AddRepositoriesData) => number) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy, isOrganization)
    : (a, b) => -descendingComparator(a, b, orderBy, isOrganization);
};

export const defaultCatalogInfoYaml = (
  componentName: string,
  orgName: string,
  owner: string,
) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: componentName,
    annotations: { 'github.com/project-slug': `${orgName}/${componentName}` },
  },
  spec: { type: 'other', lifecycle: 'unknown', owner },
});

export const getPRTemplate = (
  componentName: string,
  orgName: string,
  entityOwner: string,
) => {
  return {
    componentName,
    entityOwner,
    prTitle: 'Add catalog-info.yaml config file',
    prDescription:
      'This pull request adds a **Backstage entity metadata file**\nto this repository so that the component can\nbe added to the [software catalog](http://localhost:3000).\nAfter this pull request is merged, the component will become available.\nFor more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/).',
    useCodeOwnersFile: false,
    yaml: defaultCatalogInfoYaml(componentName, orgName, entityOwner),
  };
};

export const createData = (
  id: string,
  name: string,
  url: string,
  catalogInfoYamlStatus: ImportStatus,
  entityOwner: string,
  organization?: string,
): AddRepositoriesData => {
  return {
    id,
    repoName: name,
    repoUrl: url,
    orgName: organization,
    organizationUrl: organization,
    defaultBranch: 'master',
    catalogInfoYaml: {
      status: catalogInfoYamlStatus,
      prTemplate: getPRTemplate(name, organization as string, entityOwner),
    },
    lastUpdated: formatDate(new Date().toISOString()),
  };
};

export const createOrganizationData = (
  repositories: AddRepositoriesData[],
): AddRepositoriesData[] => {
  return repositories?.reduce(
    (acc: AddRepositoriesData[], repo: AddRepositoriesData) => {
      const org = acc.find(a => a.organizationUrl === repo.organizationUrl);
      if (org?.repositories) {
        org.repositories.push(repo);
      } else {
        acc.push({
          id: repo.id,
          orgName: repo.orgName,
          defaultBranch: 'master',
          organizationUrl: repo.organizationUrl,
          repositories: [repo],
          selectedRepositories: [],
          lastUpdated: formatDate(new Date().toISOString()),
          repoName: repo.organizationUrl || '',
        });
      }
      return acc;
    },
    [],
  );
};

export const getSelectedRepositoriesCount = (
  onOrgRowSelected: (org: AddRepositoriesData) => void,
  organizationData: AddRepositoriesData,
  alreadyAdded: number,
) => {
  if (
    !organizationData ||
    organizationData.selectedRepositories?.length === 0
  ) {
    return (
      <span data-testid="select-repositories">
        None{' '}
        <Link to="" onClick={() => onOrgRowSelected(organizationData)}>
          Select
        </Link>
      </span>
    );
  }
  return (
    <span data-testid="edit-repositories">
      {organizationData.selectedRepositories?.length} /{' '}
      {(organizationData.repositories?.length || 0) - alreadyAdded}{' '}
      <Link onClick={() => onOrgRowSelected(organizationData)} to="">
        Edit
      </Link>
    </span>
  );
};

export const updateWithNewSelectedRepositories = (
  data: AddRepositoriesData[],
  existingSelectedRepositories: AddedRepositories,
  selectedRepoIds: SelectedRepository[],
): AddedRepositories => {
  return selectedRepoIds.length === 0
    ? {}
    : selectedRepoIds.reduce((acc, id) => {
        const existingRepo = Object.values(existingSelectedRepositories).find(
          repo => repo.id === id.repoId,
        );
        if (existingRepo) {
          return {
            ...acc,
            ...{ [existingRepo.repoName as string]: existingRepo },
          };
        }
        const repo = data.find((d: AddRepositoriesData) => id.repoId === d.id);
        if (repo) {
          return {
            ...acc,
            ...{
              [repo.repoName as string]: {
                ...repo,
                catalogInfoYaml: {
                  ...repo.catalogInfoYaml,
                  status: RepositoryStatus.Ready,
                },
              },
            },
          };
        }
        return acc;
      }, {});
};

export const getSelectedRepositories = (
  org: AddRepositoriesData,
  drawerSelected: SelectedRepository[],
): AddRepositoriesData[] => {
  return drawerSelected
    .filter(selId => org.repositories?.some(repo => repo.id === selId.repoId))
    .reduce((acc: AddRepositoriesData[], id) => {
      const repository = org.repositories?.find(repo => repo.id === id.repoId);
      if (repository) {
        acc.push(repository);
      }
      return acc;
    }, []);
};

export const filterSelectedForActiveDrawer = (
  repositories: AddRepositoriesData[],
  selectedReposID: SelectedRepository[],
) => {
  return selectedReposID
    .filter(id => id.repoId)
    .filter(id => repositories?.map(r => r.id).includes(id.repoId));
};

export const urlHelper = (url: string) => {
  if (!url || url === '') {
    return '-';
  }
  return url.split('https://')[1] || url;
};

export const getNewOrgsData = (
  orgsData: AddRepositoriesData[],
  reposData: AddRepositoriesData[],
  newSelected: SelectedRepository[],
  id: string,
) => {
  const orgId = orgsData?.find(
    org => org.orgName === reposData.find(repo => repo.id === id)?.orgName,
  )?.id;

  const selectedRepositories = newSelected.filter(selId =>
    orgsData
      ?.find(org => org.id === orgId)
      ?.repositories?.map(r => r.id)
      .includes(selId.repoId),
  );
  const newOrgsData = orgsData?.map(org => {
    if (org.id === orgId) {
      return {
        ...org,
        selectedRepositories:
          (selectedRepositories
            .map(repoId => reposData.find(repo => repo.id === repoId.repoId))
            .filter(r => r?.id) as AddRepositoriesData[]) || [],
      };
    }
    return org;
  });
  return newOrgsData;
};

export const getImportStatus = (status: string): string => {
  if (!status) {
    return '';
  }
  switch (status) {
    case 'WAIT_PR_APPROVAL':
      return 'Waiting for PR Approval';
    case 'ADDED':
      return 'Finished and Ingested';
    default:
      return '';
  }
};
