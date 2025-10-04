import { config } from 'dotenv';

config();

export const appConfig = {
    igdb: {
        clientId: process.env.IGDB_CLIENT_ID || "",
        bearerToken: process.env.IGDB_BEARER_TOKEN || ""
    },
    gameCronJobSchedule: process.env.GAME_CRON_JOB_SCHEDULE || "*/15 * * * *" // A cada 15 minutos
};