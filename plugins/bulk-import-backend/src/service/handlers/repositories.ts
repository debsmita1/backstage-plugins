import {Logger} from "winston";
import {Paths} from "../../openapi";

export async function findAllRepositories(
    logger: Logger,
): Promise<Paths.FindAllRepositories.Responses.$200> {
    logger.debug('Getting all repositories..');
    // TODO: implement
    throw new Error("findAllRepositories: not implemented yet");
}
