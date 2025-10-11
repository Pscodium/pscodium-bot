import { ExtendedClient } from './structs/ExtendedClient';
export * from 'colors';
import * as config from './config.json';
import { sequelize } from './data-source';
import moment from 'moment-timezone';

process.env.TZ = 'America/Sao_Paulo';
moment.tz.setDefault('America/Sao_Paulo');

const client = new ExtendedClient();

client.start();

sequelize.authenticate()
    .then(() => {
        console.log("Connection established!");
    })
    .catch((err) => {
        console.error("Error authenticating database: ", err);
    });



export { client, config };

