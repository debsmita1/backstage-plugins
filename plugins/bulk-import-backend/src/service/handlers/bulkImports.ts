import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';

import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { Components, Paths } from '../../openapi';
import { GithubApiService } from '../githubApiService';
import { findAllRepositories } from './repositories';

export async function findAllImports(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
): Promise<Paths.FindAllImports.Responses.$200> {
  logger.debug('Getting all bulk import jobs..');
  const result: Components.Schemas.Import[] = [];
  const catalogLocations = await catalogInfoGenerator.listCatalogUrlLocations();
  const repos = await findAllRepositories(
    logger,
    githubApiService,
    catalogInfoGenerator,
    false,
  );
  for (const repo of repos) {
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

  return result;
}

export async function createImportJobs(
  logger: Logger,
  config: Config,
  catalogApi: CatalogApi,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  importRequests: Paths.CreateImportJobs.RequestBody,
): Promise<Paths.CreateImportJobs.Responses.$202> {
  logger.debug(
    `Handling request to import ${importRequests?.length ?? 0} repo(s)..`,
  );

  if (!importRequests) {
    return [];
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
  }

  return result;
}

/**
 * verifyLocationExistence checks for the existence of the Location target.
 * Under the hood, it attempts to read the target URL and will return false if the target could not be found
 * and even if there is already a Location row in the database.
 * @param catalogApi
 * @param repoCatalogUrl
 */
async function verifyLocationExistence(
  catalogApi: CatalogApi,
  repoCatalogUrl: string,
): Promise<boolean> {
  try {
    const result = await catalogApi.addLocation({
      type: 'url',
      target: repoCatalogUrl,
      dryRun: true,
    });
    // The `result.exists` field is only filled in dryRun mode
    return result.exists as boolean;
  } catch (error: any) {
    if (error.message && error.message.includes('NotFoundError')) {
      return false;
    }
    throw error;
  }
}

export async function getImportStatus(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogApi: CatalogApi,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  defaultBranch?: string,
): Promise<Components.Schemas.ImportStatus> {
  return getImportStatusWithCheckerFn(
    logger,
    githubApiService,
    catalogInfoGenerator,
    repoUrl,
    async (catalogUrl: string) =>
      await verifyLocationExistence(catalogApi, catalogUrl),
    defaultBranch,
  );
}

export async function getImportStatusFromLocations(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  catalogUrlLocations: string[],
  defaultBranch?: string,
): Promise<Components.Schemas.ImportStatus> {
  return getImportStatusWithCheckerFn(
    logger,
    githubApiService,
    catalogInfoGenerator,
    repoUrl,
    async (catalogUrl: string) => {
      for (const loc of catalogUrlLocations) {
        if (catalogUrl === loc) {
          return true;
        }
      }
      return false;
    },
    defaultBranch,
  );
}

async function getImportStatusWithCheckerFn(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  catalogExistenceCheckFn: (catalogUrl: string) => Promise<boolean>,
  defaultBranch?: string,
): Promise<Components.Schemas.ImportStatus> {
  const catalogUrl = catalogInfoGenerator.getCatalogUrl(repoUrl, defaultBranch);
  if (await catalogExistenceCheckFn(catalogUrl)) {
    return 'ADDED';
  }
  // Check to see if there are any PR
  const openImportPr = await githubApiService.findImportOpenPr(logger, {
    repoUrl,
  });
  if (openImportPr.prUrl) {
    return 'WAIT_PR_APPROVAL';
  }
  return null;
}
