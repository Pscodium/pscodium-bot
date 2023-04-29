import { ExtendedClient } from './structs/ExtendedClient';
export * from 'colors';
import * as config from './config.json';

const client = new ExtendedClient();

client.start();

export { client, config };

