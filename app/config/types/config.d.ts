export interface JobConfig {
    enabled: boolean;
    cron: string;
    type: string;
    class: string;
    queue: string;
    query: string;
    description: string;
    processing_message: string;
    column_name: string;
}

export interface Jobs {
    [key: string]: Record<string, JobConfig>;
    game_queue_job: Record<string, JobConfig>;
}

export interface ExternalConfig {
    jobs: Jobs;
}