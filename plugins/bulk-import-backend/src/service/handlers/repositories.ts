import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { Components } from '../../openapi.d';
import { GithubApiService } from '../githubApiService';
import { HandlerResponse } from './handlers';
import { getImportStatusFromLocations } from './importStatus';

export async function findAllRepositories(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  checkStatus: boolean,
): Promise<HandlerResponse<Components.Schemas.RepositoryList>> {
  logger.debug('Getting all repositories..');
  const allReposAccessible =
    await githubApiService.getRepositoriesFromIntegrations();
  if (
    allReposAccessible.repositories?.length === 0 &&
    allReposAccessible.errors?.length > 0
  ) {
    // An error
    const errorList: string[] = [];
    for (const err of allReposAccessible.errors) {
      if (err.error?.message) {
        errorList.push(err.error.message);
      }
    }
    return {
      statusCode: 500,
      responseBody: {
        errors: errorList,
      },
    };
  }
  const resp = await githubApiService
    .getRepositoriesFromIntegrations()
    .then(async repos => {
      const catalogLocations =
        await catalogInfoGenerator.listCatalogUrlLocations();
      const errorList: string[] = [];
      for (const err of repos.errors) {
        if (err.error?.message) {
          errorList.push(err.error.message);
        }
      }
      const repoList: Components.Schemas.Repository[] = [];
      for (const repo of repos.repositories) {
        const gitUrl = gitUrlParse(repo.html_url);
        let importStatus: Components.Schemas.ImportStatus | undefined;
        const errors: string[] = [];
        try {
          importStatus = checkStatus
            ? await getImportStatusFromLocations(
                logger,
                githubApiService,
                catalogInfoGenerator,
                repo.html_url,
                catalogLocations,
                repo.default_branch,
              )
            : undefined;
        } catch (error: any) {
          errors.push(error.message);
        }
        repoList.push({
          id: `${gitUrl.organization}/${repo.name}`,
          name: repo.name,
          organization: gitUrl.organization,
          url: repo.html_url,
          defaultBranch: repo.default_branch,
          importStatus: importStatus,
          errors: errors,
        });
      }
      return {
        errors: errorList,
        repositories: repoList,
      };
    });
  return {
    statusCode: 200,
    responseBody: resp,
  };
}
