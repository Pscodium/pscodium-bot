import { ExtendedClient } from './structs/ExtendedClient';
export * from 'colors';
import * as config from './config.json';
import { sequelize } from './data-source';
import { api } from '../api/index';
const client = new ExtendedClient();

client.start();

sequelize.authenticate()
    .then(() => {
        console.log("Connection established!");
        api.start();
    })
    .catch((err) => {
        console.error("Error authenticating database: ", err);
    });



export { client, config };

