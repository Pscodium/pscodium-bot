import cron from 'node-cron';
import { ExtendedClient } from '../../structs/ExtendedClient';
import { GameJobService } from './game.job.service';
import guildsService from '../guilds.service';
import { appConfig, externalConfig } from '../../config/app.config';

export class JobService {
    
    async start(client: ExtendedClient) {
        const gameJobService = new GameJobService();
        console.log('🕐 Job service iniciado - executando jobs');
        
        cron.schedule(appConfig.gameCronJobSchedule,  async () => {
            const timestamp = new Date();
            const jobConfig = Object.values(externalConfig.jobs.game_queue_job);
            const brazilTime = timestamp.toLocaleTimeString('pt-BR', { 
                timeZone: 'America/Sao_Paulo',
                hour12: false 
            });
            console.log(`⏰ Emitindo evento gameQueueJob às ${brazilTime}`);
            const guilds = client.guilds.cache;
            const channel_counts: { [key: string]: number } = {};

            for (const job of jobConfig) {
                const game = await gameJobService.getRandomGameForEmbed(job.type);
                if (!game) {
                    console.log(`⚠️ Nenhum jogo encontrado na IGDB para o tipo ${job.type}`);
                    return;
                }

                const guildIds = guilds.map(guild => guild.id);
                const channelIds = await guildsService.getGuildGameJobChannelIds(guildIds, job.column_name);

                channel_counts[job.type] = channelIds.length ?? 0;

                client.emit('gameQueueJob', { client, channelIds: channelIds, game });

                await new Promise(resolve => setTimeout(resolve, 600));
            }

            console.log(`✅ Evento gameQueueJob emitido para ${Object.values(channel_counts).reduce((a, b) => a + b, 0)} canais em ${Object.keys(channel_counts).length} categorias.\n⚙️ Detalhes:`, channel_counts);
        });
    }
}