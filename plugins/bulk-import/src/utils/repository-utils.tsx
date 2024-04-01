import React from 'react';

import { Link } from '@backstage/core-components';

import { get } from 'lodash';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  Order,
} from '../types';

const descendingComparator = (
  a: AddRepositoriesData,
  b: AddRepositoriesData,
  orderBy: string,
) => {
  let value1 = get(a, orderBy);
  let value2 = get(b, orderBy);

  if (orderBy === 'selectedRepositories') {
    value1 = value1?.length;
    value2 = value2?.length;
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
): ((a: AddRepositoriesData, b: AddRepositoriesData) => number) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

export const createData = (
  id: number,
  name: string,
  url: string,
  catalogInfoYamlStatus: string,
  organization?: string,
): AddRepositoriesData => {
  return {
    id,
    repoName: name,
    repoUrl: url,
    organizationUrl: organization,
    catalogInfoYaml: {
      status: catalogInfoYamlStatus,
      prTemplate: {
        prTitle: 'This is the pull request title',
        prDescription: 'This is the description of the pull request',
        componentName: name,
        entityOwner: '',
        useCodeOwnersFile: false,
        yaml: { kind: 'Component', apiVersion: 'v1', metadata: { name } },
      },
    },
  };
};

export const createOrganizationData = (
  repositories: AddRepositoriesData[],
): AddRepositoriesData[] => {
  let id = 1;
  return repositories.reduce(
    (acc: AddRepositoriesData[], repo: AddRepositoriesData) => {
      const org = acc.find(a => a.organizationUrl === repo.organizationUrl);
      if (org && org.repositories) {
        org.repositories.push(repo);
      } else {
        acc.push({
          id,
          orgName: repo.organizationUrl,
          organizationUrl: repo.organizationUrl,
          repositories: [repo],
          selectedRepositories: [],
        });
        id++;
      }
      return acc;
    },
    [],
  );
};

export const getSelectedRepositories = (
  onOrgRowSelected: (org: AddRepositoriesData) => void,
  organizationData: AddRepositoriesData,
  alreadyAdded: number,
) => {
  if (
    !organizationData ||
    organizationData.selectedRepositories?.length === 0
  ) {
    return (
      <>
        None{' '}
        <Link to="" onClick={() => onOrgRowSelected(organizationData)}>
          Select
        </Link>
      </>
    );
  }
  return (
    <>
      {organizationData.selectedRepositories?.length} /{' '}
      {(organizationData.repositories?.length || 0) - alreadyAdded}{' '}
      <Link onClick={() => onOrgRowSelected(organizationData)} to="">
        Edit
      </Link>
    </>
  );
};

export const getNewSelectedRepositories = (
  data: AddRepositoriesData[],
  selectedIds: number[],
): { [name: string]: AddRepositoriesData } => {
  return selectedIds.length === 0
    ? {}
    : data.reduce((acc, d) => {
        if (selectedIds.find((id: number) => id === d.id)) {
          return (acc = { ...acc, ...{ [d.repoName as string]: d } });
        }
        return acc;
      }, {});
};

export const getRepositoriesSelected = (data: AddRepositoriesFormValues) => {
  return data.repositories?.length || 0;
};

export const filterSelectedForActiveDrawer = (
  repositories: AddRepositoriesData[],
  selectedReposID: number[],
) => {
  return selectedReposID
    .filter(id => id > -1)
    .filter(id => repositories?.map(r => r.id).includes(id));
};

export const urlHelper = (url: string) => {
  if (!url) {
    return url;
  }
  return url.split('https://')[1] || url;
};
