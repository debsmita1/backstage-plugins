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

export type ImportStatus = 'ADDED' | 'WAIT_PR_APPROVAL' | 'PR_ERROR' | null;

export type AddRepositoriesData = {
  id: string;
  defaultBranch: string;
  repoName?: string;
  orgName?: string;
  repoUrl?: string;
  organizationUrl?: string;
  repositories?: AddRepositoriesData[];
  selectedRepositories?: AddRepositoriesData[];
  catalogInfoYaml?: {
    status: ImportStatus;
    prTemplate: PullRequestPreview;
    pullRequest?: string;
    lastUpdated?: string;
  };
  lastUpdated?: string;
};

export type Order = 'asc' | 'desc';

export type RepositoryType = 'repository' | 'organization';

export type AddedRepositories = { [name: string]: AddRepositoriesData };

export type AddRepositoriesFormValues = {
  repositoryType: 'repository' | 'organization';
  repositories: AddedRepositories;
  approvalTool: 'git' | 'servicenow';
};

export type SelectedRepository = {
  repoId: string;
  orgName: string;
};

export enum RepositoryStatus {
  ADDED = 'ADDED',
  'WAIT_PR_APPROVAL' = 'WAIT_PR_APPROVAL',
  Ready = 'Ready',
  NotGenerated = 'NotGenerated',
  'PR_ERROR' = 'PR_ERROR',
}

export enum RepositorySelection {
  Repository = 'repository',
  Organization = 'organization',
}

export enum ApprovalTool {
  Git = 'git',
  ServiceNow = 'servicenow',
}
