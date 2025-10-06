import cron from 'node-cron';
import { ExtendedClient } from '../../structs/ExtendedClient';
import { GameJobService } from './game.job.service';
import guildsService from '../guilds.service';
import { appConfig } from '../../config/app.config';
import { GameRequestTypeEnum } from './types/gameRequestTypeEnum';

export class JobService {
    
    private async fetchGamesWithDelay(gameJobService: GameJobService, gameTypes: GameRequestTypeEnum[], delayMs = 600) {
        const games = [];
        
        for (let i = 0; i < gameTypes.length; i++) {
            const game = await gameJobService.getRandomGameForEmbed(gameTypes[i]);
            games.push(game);
            
            if (i < gameTypes.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        
        return games;
    }
    
    async start(client: ExtendedClient) {
        const gameJobService = new GameJobService();
        console.log('🕐 Job service iniciado - executando jobs');
        
        cron.schedule(appConfig.gameCronJobSchedule,  async () => {
            const timestamp = new Date();
            console.log(`⏰ Emitindo evento gameQueueJob às ${timestamp.toLocaleTimeString()}`);
            const guilds = client.guilds.cache;
        
            const [game, onlineGame, freeGame, managementGame] = await this.fetchGamesWithDelay(gameJobService, [
                'normal' as GameRequestTypeEnum,
                'multiplayer' as GameRequestTypeEnum, 
                'free' as GameRequestTypeEnum,
                'management' as GameRequestTypeEnum
            ]);

            if (!game || !onlineGame || !freeGame || !managementGame) {
                console.log('⚠️ Nenhum jogo encontrado na IGDB');
                return;
            }

            const guildIds = guilds.map(guild => guild.id);
            const gameChannelIds = await guildsService.getGameChannelByGuildIds(guildIds);
            const onlineGameChannelIds = await guildsService.getOnlineGameChannelByGuildIds(guildIds);
            const freeGameChannelIds = await guildsService.getFreeGameChannelByGuildIds(guildIds);
            const managementGameChannelIds = await guildsService.getManagementGameChannelByGuildIds(guildIds);

            if (gameChannelIds.length !== 0 && onlineGameChannelIds.length !== 0) {
                console.log(`✅ MENSAGENS ENVIADAS:
                    \nCanais de Jogos: ${gameChannelIds.length} 
                    \nCanais de jogos online: ${onlineGameChannelIds.length} 
                    \nCanais de jogos gratuitos: ${freeGameChannelIds.length}
                    \nCanais de jogos de gerenciamento: ${managementGameChannelIds.length}`);
                client.emit('gameQueueJob', { client, channelIds: gameChannelIds, game });
                client.emit('gameQueueJob', { client, channelIds: onlineGameChannelIds, game: onlineGame });
                client.emit('gameQueueJob', { client, channelIds: freeGameChannelIds, game: freeGame });
                client.emit('gameQueueJob', { client, channelIds: managementGameChannelIds, game: managementGame });
                return;
            }
            
        });
    }
}