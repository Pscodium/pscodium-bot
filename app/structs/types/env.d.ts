declare namespace NodeJS {
    interface ProcessEnv {
        BOT_TOKEN: string;
        OCS_API_WS_BASE?: string;
        OCS_API_KEY?: string;
    }
}