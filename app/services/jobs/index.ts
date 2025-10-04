import cron from 'node-cron';
import { ExtendedClient } from '../../structs/ExtendedClient';
import { GameJobService } from './game.job.service';
import guildsService from '../guilds.service';
import { appConfig } from '../../config/app.config';

export class JobService {
    
    async start(client: ExtendedClient) {
        const gameJobService = new GameJobService();
        console.log('🕐 Job service iniciado - executando jobs');
        
        cron.schedule(appConfig.gameCronJobSchedule,  async () => {
            const timestamp = new Date();
            console.log(`⏰ Emitindo evento gameQueueJob às ${timestamp.toLocaleTimeString()}`);
            const guilds = client.guilds.cache;
        
            const game = await gameJobService.getRandomGameForEmbed();
            const onlineGame = await gameJobService.getRandomMultiplayerGameForEmbed();

            if (!game || !onlineGame) {
                console.log('⚠️ Nenhum jogo encontrado na IGDB');
                return;
            }

            const guildIds = guilds.map(guild => guild.id);
            const gameChannelIds = await guildsService.getGameChannelByGuildIds(guildIds);
            const onlineGameChannelIds = await guildsService.getOnlineGameChannelByGuildIds(guildIds);

            if (gameChannelIds.length !== 0 && onlineGameChannelIds.length !== 0) {
                console.log(`✅ MENSAGENS ENVIADAS:\nCanais de Jogos: ${gameChannelIds.length} \nCanais de jogos online: ${onlineGameChannelIds.length}`);
                client.emit('gameQueueJob', { client, channelIds: gameChannelIds, game });
                client.emit('gameQueueJob', { client, channelIds: onlineGameChannelIds, game: onlineGame });
                return;
            }
            
        });
    }
}