import { Logger } from 'winston';

import { Paths } from '../../openapi';

export async function ping(logger: Logger): Promise<Paths.Ping.Responses.$200> {
  logger.debug('PONG!');
  return { status: 'ok' };
}
