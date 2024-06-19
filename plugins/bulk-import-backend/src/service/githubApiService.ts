/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Config } from '@backstage/config';
import {
  GithubCredentials,
  GithubIntegrationConfig,
  ScmIntegrations,
} from '@backstage/integration';

import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CustomGithubCredentialsProvider } from '../helpers';
// import { Components } from '../openapi.d';
import {
  ExtendedGithubCredentials,
  GithubAppCredentials,
  GithubRepoFetchError,
  GithubRepository,
  GithubRepositoryResponse,
  isGithubAppCredential,
} from '../types';

export class GithubApiService {
  private readonly logger: Logger;
  private readonly integrations: ScmIntegrations;
  private readonly githubCredentialsProvider: CustomGithubCredentialsProvider;

  constructor(logger: Logger, config: Config) {
    this.logger = logger;
    this.integrations = ScmIntegrations.fromConfig(config);
    this.githubCredentialsProvider =
      CustomGithubCredentialsProvider.fromIntegrations(this.integrations);
  }

  /**
   * Creates the GithubRepoFetchError to be stored in the returned errors array of the returned GithubRepositoryResponse object
   */
  private createCredentialError(
    credential: ExtendedGithubCredentials,
    err?: Error,
  ): GithubRepoFetchError | undefined {
    if (err) {
      if (isGithubAppCredential(credential)) {
        return {
          appId: credential.appId,
          type: 'app',
          error: {
            name: err.name,
            message: err.message,
          },
        };
      }
      return {
        type: 'token',
        error: {
          name: err.name,
          message: err.message,
        },
      };
    }
    if ('error' in credential) {
      return {
        appId: credential.appId,
        type: 'app',
        error: {
          name: credential.error.name,
          message: credential.error.message,
        },
      };
    }
    return undefined;
  }

  /**
   * Adds the repositories accessible by the provided github app to the provided repositories Map<string, GithubRepository>
   * If any errors occurs, adds them to the provided errors Map<number, GithubRepoFetchError>
   */
  private async addGithubAppRepositories(
    octokit: Octokit,
    credential: GithubAppCredentials,
    repositories: Map<string, GithubRepository>,
    errors: Map<number, GithubRepoFetchError>,
  ): Promise<void> {
    try {
      const repos = await octokit.paginate(
        octokit.apps.listReposAccessibleToInstallation,
      );
      // The return type of the paginate method is incorrect for apps.listReposAccessibleToInstallation
      const accessibleRepos: RestEndpointMethodTypes['apps']['listReposAccessibleToInstallation']['response']['data']['repositories'] =
        repos.repositories ?? repos;
      accessibleRepos.forEach(repo => {
        const githubRepo: GithubRepository = {
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
        };
        repositories.set(githubRepo.full_name, githubRepo);
      });
    } catch (err) {
      this.logger.error(
        `Fetching repositories with access token for github app ${credential.appId}, failed with ${err}`,
      );
      const credentialError = this.createCredentialError(
        credential,
        err as Error,
      );
      if (credentialError) {
        errors.set(credential.appId, credentialError);
      }
    }
  }

  /**
   * Adds the user or organization repositories accessible by the github token to the provided repositories Map<string, GithubRepository> if they're owned by the specified owner
   * If any errors occurs, adds them to the provided errors Map<number, GithubRepoFetchError>
   */
  private async addGithubTokenRepositories(
    octokit: Octokit,
    credential: GithubCredentials,
    repositories: Map<string, GithubRepository>,
    errors: Map<number, GithubRepoFetchError>,
  ): Promise<void> {
    try {
      const repos = await octokit.paginate(
        octokit.rest.repos.listForAuthenticatedUser,
      );
      repos.forEach(repo => {
        /**
         * The listForAuthenticatedUser endpoint will grab all the repositories the github token has explicit access to.
         * These would include repositories they own, repositories where they are a collaborator,
         * and repositories that they can access through an organization membership.
         * A filter is needed to grab only the repositories for the target owner
         */
        const githubRepo: GithubRepository = {
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
        };
        repositories.set(githubRepo.full_name, githubRepo);
      });
    } catch (err) {
      this.logger.error(
        `Fetching repositories with token from token failed with ${err}`,
      );
      const credentialError = this.createCredentialError(
        credential,
        err as Error,
      );
      if (credentialError) {
        errors.set(-1, credentialError);
      }
    }
  }

  /**
   * Returns GithubRepositoryResponse containing:
   *   - a list of unique repositories the github integrations have access to
   *   - a list of errors encountered by each app and/or token (if any exist)
   */
  async getRepositoriesFromIntegrations(): Promise<GithubRepositoryResponse> {
    const ghConfigs = this.integrations.github
      .list()
      .map(ghInt => ghInt.config);
    if (ghConfigs.length === 0) {
      this.logger.debug(
        'No GitHub Integration in config => returning an empty list of repositories.',
      );
      return {
        repositories: [],
        errors: [],
      };
    }

    const credentialsByConfig = new Map<
      GithubIntegrationConfig,
      ExtendedGithubCredentials[]
    >();
    for (const ghConfig of ghConfigs) {
      const creds = await this.githubCredentialsProvider.getAllCredentials({
        host: ghConfig.host,
      });
      credentialsByConfig.set(ghConfig, creds);
    }
    const repositories = new Map<string, GithubRepository>();
    const errors = new Map<number, GithubRepoFetchError>();
    for (const [ghConfig, credentials] of credentialsByConfig) {
      for (const credential of credentials) {
        if ('error' in credential) {
          if (credential.error?.name !== 'NotFoundError') {
            this.logger.error(
              `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
            );
            const credentialError = this.createCredentialError(credential);
            if (credentialError) {
              errors.set(credential.appId, credentialError);
            }
          }
          continue;
        }
        // const baseUrl =
        //     ghHost === 'github.com'
        //         ? 'https://api.github.com'
        //         : `https://${ghHost}/api/v3`;
        const octokit = new Octokit({
          baseUrl: ghConfig.apiBaseUrl ?? 'https://api.github.com',
          auth: credential.token,
        });

        if (isGithubAppCredential(credential)) {
          await this.addGithubAppRepositories(
            octokit,
            credential,
            repositories,
            errors,
          );
        } else {
          await this.addGithubTokenRepositories(
            octokit,
            credential,
            repositories,
            errors,
          );
        }
      }
    }
    return {
      repositories: Array.from(repositories.values()),
      errors: Array.from(errors.values()),
    };
  }

  async findImportOpenPr(
    logger: Logger,
    input: {
      repoUrl: string;
    },
  ): Promise<{
    prNum?: number;
    prUrl?: string;
  }> {
    const ghConfig = this.integrations.github.byUrl(input.repoUrl)?.config;
    if (!ghConfig) {
      throw new Error(`Could not find GH integration from ${input.repoUrl}`);
    }

    const gitUrl = gitUrlParse(input.repoUrl);
    const owner = gitUrl.organization;
    const repo = gitUrl.name;

    const credentials = await this.githubCredentialsProvider.getAllCredentials({
      host: ghConfig.host,
    });
    if (credentials.length === 0) {
      throw new Error(`No credentials for GH integration`);
    }

    const branchName = 'chore/janus-idp/backstage-bulk-import';
    for (const credential of credentials) {
      if ('error' in credential) {
        if (credential.error?.name !== 'NotFoundError') {
          this.logger.error(
            `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
          );
          const credentialError = this.createCredentialError(credential);
          if (credentialError) {
            logger.debug(`${credential.appId}: ${credentialError}`);
          }
        }
        continue;
      }

      const octo = new Octokit({
        baseUrl: ghConfig.apiBaseUrl ?? 'https://api.github.com',
        auth: credential.token,
      });

      try {
        return this.findOpenPRForBranch(logger, octo, owner, repo, branchName);
      } catch (error) {
        logger.warn(`Error fetching pull requests: ${error}`);
      }
    }
    return {};
  }

  private async findOpenPRForBranch(
    logger: Logger,
    octo: Octokit,
    owner: string,
    repo: string,
    branchName: string,
  ): Promise<{
    prNum?: number;
    prUrl?: string;
  }> {
    try {
      const response = await octo.rest.pulls.list({
        owner: owner,
        repo: repo,
        state: 'open',
      });
      for (const pull of response.data) {
        if (pull.head.ref === branchName) {
          return {
            prNum: pull.number,
            prUrl: pull.html_url,
          };
        }
      }
    } catch (error) {
      logger.warn(`Error fetching pull requests: ${error}`);
    }
    return {};
  }

  private async createOrUpdateFileInBranch(
    octo: Octokit,
    owner: string,
    repo: string,
    branchName: string,
    fileName: string,
    fileContent: string,
  ): Promise<void> {
    try {
      const { data: existingFile } = await octo.rest.repos.getContent({
        owner: owner,
        repo: repo,
        path: fileName,
        ref: branchName,
      });
      // Response can either be a directory (array of files) or a single file element. In this case, we ensure it has the sha property to update it.
      if (Array.isArray(existingFile) || !('sha' in existingFile)) {
        throw new Error(
          `The content at path ${fileName} is not a file or the response from GitHub does not contain the 'sha' property.`,
        );
      }
      // If the file already exists, update it
      await octo.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: fileName,
        message: `Add ${fileName} config file`,
        content: btoa(fileContent),
        sha: existingFile.sha,
        branch: branchName,
      });
    } catch (error: any) {
      if (error.status === 404) {
        // If the file does not exist, create it
        await octo.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: fileName,
          message: `Add ${fileName} config file`,
          content: btoa(fileContent),
          branch: branchName,
        });
      } else {
        throw error;
      }
    }
  }

  async submitPrToRepo(
    logger: Logger,
    input: {
      repoUrl: string;
      gitUrl: gitUrlParse.GitUrl;
      prTitle: string;
      prBody: string;
      catalogInfoContent: string;
    },
  ): Promise<{
    prUrl?: string;
    prNumber?: number;
    errors?: string[];
  }> {
    const ghConfig = this.integrations.github.byUrl(input.repoUrl)?.config;
    if (!ghConfig) {
      throw new Error(`Could not find GH integration from ${input.repoUrl}`);
    }

    const owner = input.gitUrl.organization;
    const repo = input.gitUrl.name;

    const credentials = await this.githubCredentialsProvider.getAllCredentials({
      host: ghConfig.host,
    });
    if (credentials.length === 0) {
      throw new Error(`No credentials for GH integration`);
    }

    const branchName = 'chore/janus-idp/backstage-bulk-import';
    const fileName = 'catalog-info.yaml';
    const errors: any[] = [];
    for (const credential of credentials) {
      if ('error' in credential) {
        if (credential.error?.name !== 'NotFoundError') {
          this.logger.error(
            `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
          );
          const credentialError = this.createCredentialError(credential);
          if (credentialError) {
            logger.debug(`${credential.appId}: ${credentialError}`);
          }
        }
        continue;
      }
      // const baseUrl =
      //     ghHost === 'github.com'
      //         ? 'https://api.github.com'
      //         : `https://${ghHost}/api/v3`;
      const octo = new Octokit({
        baseUrl: ghConfig.apiBaseUrl ?? 'https://api.github.com',
        auth: credential.token,
      });
      try {
        const existingPrForBranch = await this.findOpenPRForBranch(
          logger,
          octo,
          owner,
          repo,
          branchName,
        );

        const repoData = await octo.rest.repos.get({
          owner,
          repo,
        });
        const parentRef = await octo.rest.git.getRef({
          owner,
          repo,
          ref: `heads/${repoData.data.default_branch}`,
        });
        if (existingPrForBranch.prNum) {
          await this.createOrUpdateFileInBranch(
            octo,
            owner,
            repo,
            branchName,
            fileName,
            input.catalogInfoContent,
          );
          const pullRequestResponse = await octo.rest.pulls.update({
            owner,
            repo,
            pull_number: existingPrForBranch.prNum,
            title: input.prTitle,
            body: input.prBody,
            head: branchName,
            base: repoData.data.default_branch,
          });
          return {
            prNumber: existingPrForBranch.prNum,
            prUrl: pullRequestResponse.data.html_url,
          };
        }

        try {
          await octo.rest.git.getRef({
            owner,
            repo,
            ref: `heads/${branchName}`,
          });
        } catch (error: any) {
          if (error.status === 404) {
            await octo.rest.git.createRef({
              owner,
              repo,
              ref: `refs/heads/${branchName}`,
              sha: parentRef.data.object.sha,
            });
          } else {
            throw error;
          }
        }

        await this.createOrUpdateFileInBranch(
          octo,
          owner,
          repo,
          branchName,
          fileName,
          input.catalogInfoContent,
        );

        const pullRequestResponse = await octo.rest.pulls.create({
          owner,
          repo,
          title: input.prTitle,
          body: input.prBody,
          head: branchName,
          base: repoData.data.default_branch,
        });

        return {
          prNumber: pullRequestResponse.data.number,
          prUrl: pullRequestResponse.data.html_url,
        };
      } catch (e: any) {
        logger.warn(`Couldn't create PR in ${input.repoUrl}: ${e}`);
        errors.push(e.message);
      }
    }

    logger.warn(
      `Tried all possible GitHub credentials, but could not create PR in ${input.repoUrl}. Please try again later...`,
    );

    return {
      errors: errors,
    };
  }
}
