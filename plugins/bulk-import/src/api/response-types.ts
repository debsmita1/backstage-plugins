type Repository = {
  url: string;
  name: string;
  organization: string;
  defaultBranch: string;
};

export type ImportJobResponse = {
  errors: string[];
  status: string;
  respository: Repository;
};

export type ImportJobStatus = {
  approvalTool: string;
  status: string;
  id: string;
  lastUpdate: string;
  respository: Repository;
};
