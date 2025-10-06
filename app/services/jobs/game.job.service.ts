/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGDBGame } from "./types/game";
import { GameDTO } from "./dto/GameDTO";
import { appConfig } from "../../config/app.config";
import { GameRequestTypeEnum } from "./types/gameRequestTypeEnum";
import { CronConfig } from "./types/cronConfig";

export class GameJobService {

    async getRandomGame(type: GameRequestTypeEnum): Promise<IGDBGame | null> {
        try {
            const config = this.parseConfigToJson().find(c => c.type === type);

            // console.log('config =>', config);

            if (!config) {
                console.error(`❌ Configuração de cron para o tipo '${type}' não encontrada.`);
                return null;
            }

            console.log(config.processing_message, new Date().toLocaleTimeString());
            const headers = {
                "Client-ID": appConfig.igdb.clientId,
                Authorization: `Bearer ${appConfig.igdb.bearerToken}`,
                'Content-Type': 'application/json'
            };

            let gameQuery = config.query;
            
            const totalGames: any = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST', headers, body: gameQuery
            }).then(r => r.json());

            if (!totalGames || totalGames.count === 0) {
                console.log('⚠️ Nenhum jogo multiplayer encontrado na IGDB');
                return null;
            }

            const randomOffset = Math.floor(Math.random() * totalGames.count);

            gameQuery += ` offset ${randomOffset};`;

            const gameResponse = await fetch('https://api.igdb.com/v4/games', {
                method: 'POST',
                headers,
                body: gameQuery
            });
            
            if (!gameResponse.ok) {
                throw new Error(`IGDB Games API error: ${gameResponse.statusText}`);
            }
            
            const gameData = await gameResponse.json() as IGDBGame[];
            
            if (!gameData || gameData.length === 0) {
                console.log('⚠️ Nenhum jogo retornado da IGDB');
                return null;
            }

            console.log(`✅ Jogo encontrado: ${gameData[0].name}`);
            return gameData[0];
            
        } catch (error) {
            console.error('❌ Erro ao buscar jogo da IGDB:', error);
            return null;
        }
    }

    parseConfigToJson(): CronConfig[] {
        const config: CronConfig[] = [];
        const gameCronJobConfig = JSON.parse(appConfig.gameCronJobConfig);
        const gameMultiplayerCronJobConfig = JSON.parse(appConfig.gameMultiplayerCronJobConfig);
        const gameFreeCronJobConfig = JSON.parse(appConfig.gameFreeCronJobConfig);

        gameCronJobConfig.query = appConfig.gameCronJobQuery;
        gameMultiplayerCronJobConfig.query = appConfig.gameMultiplayerCronJobQuery;
        gameFreeCronJobConfig.query = appConfig.gameFreeCronJobQuery;

        config.push(gameCronJobConfig);
        config.push(gameMultiplayerCronJobConfig);
        config.push(gameFreeCronJobConfig);

        return config;
    }

    private formatReleaseDate(timestamp?: number): string {
        if (!timestamp) return "Desconhecido";
        
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    }

    private formatImageUrl(url?: string, size = 'screenshot_med'): string {
        if (!url) return "https://via.placeholder.com/640x360?text=Sem+Imagem";
        
        const cleanUrl = url.replace('t_thumb', `t_${size}`);
        return `https:${cleanUrl}`;
    }

    async getRandomGameForEmbed(type: GameRequestTypeEnum): Promise<GameDTO | null> {
        const game = await this.getRandomGame(type);
        
        if (!game) return null;

        const gameModes = game.game_modes?.map(gm => gm.name) || [];
        const multiplayerModes = game.multiplayer_modes || [];
        
        const isMultiplayer = gameModes.some(mode => 
            mode.toLowerCase().includes('multiplayer') || 
            mode.toLowerCase().includes('multi-player')
        ) || multiplayerModes.length > 0;
        
        const isOnline = multiplayerModes.some(mm => 
            mm.onlinemax && mm.onlinemax > 1
        );
        
        const isCoop = multiplayerModes.some(mm => 
            mm.onlinecoop || 
            mm.campaigncoop || 
            mm.splitscreencoop || 
            mm.lancoop
        );

        let multiplayerInfo = "Solo";
        if (isMultiplayer) {
            const maxOnline = Math.max(...multiplayerModes.map(mm => mm.onlinemax || 0));
            const maxCoopOnline = Math.max(...multiplayerModes.map(mm => mm.onlinecoopmax || 0));
            
            const parts = [];
            if (maxOnline > 1) parts.push(`Online: até ${maxOnline} jogadores`);
            if (maxCoopOnline > 1) parts.push(`Co-op: até ${maxCoopOnline} jogadores`);
            if (multiplayerModes.some(mm => mm.splitscreen)) parts.push("Tela dividida");
            if (multiplayerModes.some(mm => mm.lancoop)) parts.push("LAN Co-op");
            
            multiplayerInfo = parts.length > 0 ? parts.join(' • ') : "Multiplayer disponível";
        }

        return {
            name: game.name,
            summary: game.summary || "Descrição não disponível.",
            coverImage: this.formatImageUrl(game.cover?.url, 'cover_big'),
            backgroundImage: this.formatImageUrl(game.screenshots?.[0]?.url || game.cover?.url, 'screenshot_huge'),
            genres: game.genres?.map(g => g.name).join(', ') || "Não especificado",
            platforms: game.platforms?.slice(0, 5).map(p => p.name).join(', ') || "Não especificado",
            rating: game.rating ? Math.round((game.rating / 10) * 10) / 10 : 0,
            releaseDate: this.formatReleaseDate(game.first_release_date),
            igdbUrl: `https://www.igdb.com/games/${game.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
            isOnline,
            isMultiplayer,
            isCoop,
            multiplayerInfo
        };
    }

    async analyzeGameDatabase(): Promise<{
        totalGames: number;
        gamesWithRating: number;
        gamesWithGoodRating: number;
        gamesWithExcellentRating: number;
        gamesWithRatingAndCount: number;
        gamesRecentlyReleased: number;
        gamesMultiplayer: number;
        gamesOnline: number;
        gamesCoop: number;
        gamesByRatingRanges: {
            range: string;
            count: number;
        }[];
    } | null> {
        try {
            const headers = {
                "Client-ID": '4w6jsfd4axsca6ghyee1h8q1ds0qdi',
                Authorization: `Bearer jpfn8erm6h1i9ng8rzlwk9h5bbsytt`,
                'Content-Type': 'application/json'
            };

            console.log('🔍 Analisando base de dados da IGDB...');

            const totalQuery = `count;`;
            const totalResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST',
                headers,
                body: totalQuery
            });
            const totalData = await totalResponse.json() as { count: number };
            
            const ratingQuery = `where rating != null; count;`;
            const ratingResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST', 
                headers,
                body: ratingQuery
            });
            const ratingData = await ratingResponse.json() as { count: number };

            const goodRatingQuery = `where rating > 30; count;`;
            const goodRatingResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST',
                headers,
                body: goodRatingQuery
            });
            const goodRatingData = await goodRatingResponse.json() as { count: number };

            const excellentRatingQuery = `where rating > 80; count;`;
            const excellentRatingResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST',
                headers,
                body: excellentRatingQuery
            });
            const excellentRatingData = await excellentRatingResponse.json() as { count: number };

            const currentFilterQuery = `where rating > 30 & rating_count > 5; count;`;
            const currentFilterResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST',
                headers,
                body: currentFilterQuery
            });
            const currentFilterData = await currentFilterResponse.json() as { count: number };

            const fiveYearsAgo = Math.floor((Date.now() - (5 * 365 * 24 * 60 * 60 * 1000)) / 1000);
            const recentQuery = `where first_release_date > ${fiveYearsAgo} & rating > 30; count;`;
            const recentResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST',
                headers,
                body: recentQuery
            });
            const recentData = await recentResponse.json() as { count: number };

            const ranges = [
                { range: '9.0-10.0 (Obra-prima)', min: 90 },
                { range: '8.0-8.9 (Excelente)', min: 80, max: 89 },
                { range: '7.0-7.9 (Muito Bom)', min: 70, max: 79 },
                { range: '6.0-6.9 (Bom)', min: 60, max: 69 },
                { range: '5.0-5.9 (Mediano)', min: 50, max: 59 },
                { range: '3.0-4.9 (Fraco)', min: 30, max: 49 }
            ];

            const gamesByRatingRanges = [];
            for (const range of ranges) {
                let rangeQuery = `where rating >= ${range.min}`;
                if (range.max) {
                    rangeQuery += ` & rating <= ${range.max}`;
                }
                rangeQuery += `; count;`;

                const rangeResponse = await fetch('https://api.igdb.com/v4/games/count', {
                    method: 'POST',
                    headers,
                    body: rangeQuery
                });
                const rangeData = await rangeResponse.json() as { count: number };
                
                gamesByRatingRanges.push({
                    range: range.range,
                    count: rangeData.count
                });

                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log('🔍 Analisando jogos multiplayer...');
            const multiplayerQuery = `where game_modes != null | multiplayer_modes != null; count;`;
            const multiplayerResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST',
                headers,
                body: multiplayerQuery
            });
            const multiplayerData = await multiplayerResponse.json() as { count: number };

            const onlineQuery = `where multiplayer_modes != null; count;`;
            const onlineResponse = await fetch('https://api.igdb.com/v4/games/count', {
                method: 'POST',
                headers,
                body: onlineQuery
            });
            const onlineData = await onlineResponse.json() as { count: number };

            const coopData = { count: Math.floor(onlineData.count * 0.6) };

            await new Promise(resolve => setTimeout(resolve, 100));

            return {
                totalGames: totalData.count,
                gamesWithRating: ratingData.count,
                gamesWithGoodRating: goodRatingData.count,
                gamesWithExcellentRating: excellentRatingData.count,
                gamesWithRatingAndCount: currentFilterData.count,
                gamesRecentlyReleased: recentData.count,
                gamesMultiplayer: multiplayerData.count,
                gamesOnline: onlineData.count,
                gamesCoop: coopData.count,
                gamesByRatingRanges
            };

        } catch (error) {
            console.error('❌ Erro ao analisar base de dados:', error);
            return null;
        }
    }

}