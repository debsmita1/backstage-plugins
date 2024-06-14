import { CatalogApi } from '@backstage/catalog-client';

import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { Components, Paths } from '../../openapi';
import { GithubApiService } from '../githubApiService';
import { getImportStatus } from './bulkImports';

export async function findAllRepositories(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogApi: CatalogApi,
  catalogInfoGenerator: CatalogInfoGenerator,
  checkStatus: boolean,
): Promise<Paths.FindAllRepositories.Responses.$200> {
  logger.debug('Getting all repositories..');
  const promises = await githubApiService
    .getRepositoriesFromIntegrations()
    .then(repos =>
      repos.repositories.map(async repo => {
          const gitUrl = gitUrlParse(repo.html_url);
          let importStatus: Components.Schemas.ImportStatus | undefined;
          const errors : string[] = [];
          try {
              importStatus = checkStatus
                  ? await getImportStatus(
                      logger,
                      githubApiService,
                      catalogApi,
                      catalogInfoGenerator,
                      repo.html_url,
                      repo.default_branch,
                  )
                  : undefined;
          } catch (error: any) {
              errors.push(error.message);
          }
        return {
          id: `${gitUrl.organization}/${repo.name}`,
          name: repo.name,
          organization: gitUrl.organization,
          url: repo.html_url,
          defaultBranch: repo.default_branch,
          importStatus: importStatus,
          errors: errors,
        } as Components.Schemas.Repository;
      }),
    );
  return Promise.all(promises);
}
