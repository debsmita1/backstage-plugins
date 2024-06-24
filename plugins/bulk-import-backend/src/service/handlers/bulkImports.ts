import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';

import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { Components, Paths } from '../../openapi.d';
import { GithubApiService } from '../githubApiService';
import {
  DefaultPageNumber,
  DefaultPageSize,
  HandlerResponse,
} from './handlers';
import { verifyLocationExistence } from './importStatus';
import { findAllRepositories } from './repositories';

export async function findAllImports(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<HandlerResponse<Components.Schemas.Import[]>> {
  logger.debug('Getting all bulk import jobs..');
  const result: Components.Schemas.Import[] = [];
  const catalogLocations = await catalogInfoGenerator.listCatalogUrlLocations();
  const repos = await findAllRepositories(
    logger,
    githubApiService,
    catalogInfoGenerator,
    false,
    pageNumber,
    pageSize,
  );
  for (const repo of repos.responseBody?.repositories ?? []) {
    if (!repo.url) {
      continue;
    }
    const catalogUrl = catalogInfoGenerator.getCatalogUrl(
      repo.url,
      repo.defaultBranch,
    );
    let exists = false;
    for (const loc of catalogLocations) {
      if (loc === catalogUrl) {
        exists = true;
        break;
      }
    }
    if (exists) {
      result.push({
        id: repo.id,
        status: 'ADDED',
        repository: repo,
        approvalTool: 'GIT',
      });
      continue;
    }
    const errors: string[] = [];
    try {
      // Check to see if there are any PR
      const openImportPr = await githubApiService.findImportOpenPr(logger, {
        repoUrl: repo.url,
      });
      if (!openImportPr.prUrl) {
        // No import PR
        continue;
      }
      result.push({
        id: repo.id,
        status: 'WAIT_PR_APPROVAL',
        repository: repo,
        approvalTool: 'GIT',
        github: {
          pullRequest: {
            number: openImportPr.prNum,
            url: openImportPr.prUrl,
          },
        },
      });
    } catch (error: any) {
      errors.push(error.message);

      result.push({
        id: repo.id,
        status: 'PR_ERROR',
        errors: errors,
        repository: repo,
        approvalTool: 'GIT',
      });
    }
  }

  return {
    statusCode: 200,
    responseBody: result,
  };
}

export async function createImportJobs(
  logger: Logger,
  config: Config,
  catalogApi: CatalogApi,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  importRequests: Paths.CreateImportJobs.RequestBody,
): Promise<HandlerResponse<Components.Schemas.Import[]>> {
  logger.debug(
    `Handling request to import ${importRequests?.length ?? 0} repo(s)..`,
  );

  if (!importRequests || importRequests.length === 0) {
    logger.debug('Missing import requests from request body');
    return {
      statusCode: 400,
      responseBody: [],
    };
  }

  const appTitle =
    config.getOptionalString('app.title') ?? 'Red Hat Developer Hub';
  const appBaseUrl = config.getString('app.baseUrl');

  const result: Components.Schemas.Import[] = [];
  for (const req of importRequests) {
    const gitUrl = gitUrlParse(req.repository.url);

    // Check if repo is already imported
    const repoCatalogUrl = catalogInfoGenerator.getCatalogUrl(
      req.repository.url,
      req.repository.defaultBranch,
    );
    const hasLocation = await verifyLocationExistence(
      catalogApi,
      repoCatalogUrl,
    );
    if (hasLocation) {
      result.push({
        status: 'ADDED',
        repository: {
          url: req.repository.url,
          name: gitUrl.name,
          organization: gitUrl.organization,
        },
      } as Components.Schemas.Import);
      continue;
    }

    // Create PR
    try {
      const prToRepo = await githubApiService.submitPrToRepo(logger, {
        repoUrl: req.repository.url,
        gitUrl: gitUrl,
        catalogInfoContent:
          req.catalogInfoContent ??
          (await catalogInfoGenerator.generateDefaultCatalogInfoContent(
            req.repository.url,
          )),
        prTitle: req.github?.pullRequest?.title ?? `Add catalog-info.yaml`,
        prBody:
          req.github?.pullRequest?.body ??
          `
This pull request adds a **Backstage entity metadata file** to this repository so that the component can be added to a Backstage application.

After this pull request is merged, the component will become available in the [${appTitle} software catalog](${appBaseUrl}).

For more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/).
`,
      });
      if (prToRepo.errors && prToRepo.errors.length > 0) {
        result.push({
          errors: prToRepo.errors,
          status: 'PR_ERROR',
          repository: req.repository,
        } as Components.Schemas.Import);
        continue;
      }
      logger.debug(`Created new PR from request: ${prToRepo.prUrl}`);

      // Create Location
      try {
        await catalogApi.addLocation({
          type: 'url',
          target: repoCatalogUrl,
        });
      } catch (error: any) {
        if (!(error.message && error.message.includes('ConflictError'))) {
          throw error;
        }
        // Location already exists, which is fine
      }

      result.push({
        errors: prToRepo.errors,
        status: 'WAIT_PR_APPROVAL',
        repository: {
          url: req.repository.url,
          name: gitUrl.name,
          organization: gitUrl.organization,
        },
        github: {
          pullRequest: {
            url: prToRepo.prUrl,
            number: prToRepo.prNumber,
          },
        },
      } as Components.Schemas.Import);
    } catch (error: any) {
      result.push({
        errors: [error.message],
        status: 'PR_ERROR',
        repository: {
          url: req.repository.url,
          name: gitUrl.name,
          organization: gitUrl.organization,
        },
      } as Components.Schemas.Import);
    }
  }

  return {
    statusCode: 202,
    responseBody: result,
  };
}
