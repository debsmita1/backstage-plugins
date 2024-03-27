import {Logger} from "winston";
import {Paths} from "../../openapi";

export async function findAllImports(
    logger: Logger,
): Promise<Paths.FindAllImports.Responses.$200> {
    logger.debug('Getting all bulk import jobs..');
    // TODO: implement
    throw new Error("findAllImports: not implemented yet");
}

export async function createImportJobs(
    logger: Logger,
    req: Paths.CreateImportJobs.RequestBody,
): Promise<Paths.CreateImportJobs.Responses.$202> {
    logger.debug('Creating new bulk import jobs from request..');
    // TODO: implement
    throw new Error("createImportJobs: not implemented yet");
}
