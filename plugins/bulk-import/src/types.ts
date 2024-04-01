import { Entity } from '@backstage/catalog-model';

export type RepositoriesData = {
  id: number;
  name: string;
  repoURL: string;
  organization: string;
  status: string;
  lastUpdated: string;
};

export type PullRequestPreview = {
  prTitle?: string;
  prDescription?: string;
  componentName?: string;
  entityOwner?: string;
  useCodeOwnersFile: boolean;
  yaml: Entity;
};
export type PullRequestPreviewData = { [name: string]: PullRequestPreview };

export type AddRepositoriesData = {
  id: number;
  repoName?: string;
  orgName?: string;
  repoUrl?: string;
  organizationUrl?: string;
  repositories?: AddRepositoriesData[];
  selectedRepositories?: AddRepositoriesData[];
  catalogInfoYaml?: {
    status: string;
    prTemplate: PullRequestPreview;
  };
};

export type Order = 'asc' | 'desc';

export type RepositoryType = 'repository' | 'organization';

export type AddRepositoriesFormValues = {
  repositoryType: 'repository' | 'organization';
  repositories: { [name: string]: AddRepositoriesData };
  approvalTool: 'git' | 'servicenow';
};
