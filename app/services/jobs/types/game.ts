export interface IGDBGame {
    id: number;
    name: string;
    summary?: string;
    cover?: {
        id: number;
        url: string;
    };
    genres?: Array<{
        id: number;
        name: string;
    }>;
    platforms?: Array<{
        id: number;
        name: string;
    }>;
    rating?: number;
    rating_count?: number;
    first_release_date?: number;
    screenshots?: Array<{
        id: number;
        url: string;
    }>;
    game_modes?: Array<{
        id: number;
        name: string;
    }>;
    multiplayer_modes?: Array<{
        id: number;
        onlinecoopmax?: number;
        onlinemax?: number;
        splitscreen?: boolean;
        lancoop?: boolean;
        onlinecoop?: boolean;
        splitscreencoop?: boolean;
        campaigncoop?: boolean;
        dropin?: boolean;
    }>;
}