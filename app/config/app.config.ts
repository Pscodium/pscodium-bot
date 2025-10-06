import { config } from 'dotenv';
import { expand } from "dotenv-expand";

const env = config();
expand(env);

export const appConfig = {
    igdb: {
        clientId: process.env.IGDB_CLIENT_ID || "",
        bearerToken: process.env.IGDB_BEARER_TOKEN || ""
    },
    gameCronJobSchedule: process.env.GAME_CRON_JOB_SCHEDULE || "*/15 * * * *", // A cada 15 minutos

    // Cron job configurations as JSON strings
    gameCronJobConfig: process.env.GAME_CRON_JOB_CONFIG || "",
    gameCronJobQuery: process.env.GAME_QUERY || "",

    gameMultiplayerCronJobConfig: process.env.GAME_MULTIPLAYER_CRON_JOB_CONFIG || "",
    gameMultiplayerCronJobQuery: process.env.GAME_MULTIPLAYER_QUERY || "",

    gameFreeCronJobConfig: process.env.GAME_FREE_CRON_JOB_CONFIG || "",
    gameFreeCronJobQuery: process.env.GAME_FREE_QUERY || ""
};