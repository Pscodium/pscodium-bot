/* eslint-disable no-sync */
import fs from 'fs';
import yaml from 'js-yaml';
import { config } from 'dotenv';
import { expand } from "dotenv-expand";
import { ExternalConfig } from './types/config';

const env = config();
expand(env);

export const appConfig = {
    igdb: {
        clientId: process.env.IGDB_CLIENT_ID || "",
        bearerToken: process.env.IGDB_BEARER_TOKEN || ""
    },
    gameCronJobSchedule: process.env.GAME_CRON_JOB_SCHEDULE || "*/15 * * * *", // A cada 15 minutos
};

export function loadConfig(filePath: string): ExternalConfig {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents) as ExternalConfig;
    return data;
}

export const externalConfig = loadConfig(__dirname + (process.env.NODE_ENV === 'production' ? '/../../config/config.yml' : '/config.yml'));
