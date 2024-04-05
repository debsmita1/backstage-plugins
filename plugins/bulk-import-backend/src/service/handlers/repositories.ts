import {Logger} from "winston";
import {Components, Paths} from "../../openapi";
import {GithubApiService} from "../githubApiService";
import gitUrlParse from "git-url-parse";
import {CatalogInfoGenerator} from "../../helpers";
import {getImportStatus} from "./bulkImports";
import {CatalogApi} from "@backstage/catalog-client";

export async function findAllRepositories(
    logger: Logger,
    githubApiService: GithubApiService,
    catalogApi: CatalogApi,
    catalogInfoGenerator: CatalogInfoGenerator,
    checkStatus: boolean,
): Promise<Paths.FindAllRepositories.Responses.$200> {
    logger.debug('Getting all repositories..');
    const promises = await githubApiService.getRepositoriesFromIntegrations().then(
        (repos) => repos.repositories.map(
            async (repo) => {
                const gitUrl = gitUrlParse(repo.html_url);
                const importStatus = checkStatus ? (await getImportStatus(logger, githubApiService, catalogApi, catalogInfoGenerator, repo.html_url, repo.default_branch)) : undefined;
                return {
                    id: `${gitUrl.organization}/${repo.name}`,
                    name: repo.name,
                    organization: gitUrl.organization,
                    url: repo.html_url,
                    defaultBranch: repo.default_branch,
                    importStatus: importStatus,
                } as Components.Schemas.Repository;
            }
        ));
    return Promise.all(promises);
}
