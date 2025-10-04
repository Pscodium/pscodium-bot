import { EmbedBuilder } from "discord.js";
import { JobClientEvent } from "../../structs/types/discord";

export default {
    name: "gameQueueJob",
    once: false,
    async run(job: JobClientEvent) {
    
        try {
            const { client, channelIds, game } = job;

            channelIds.forEach((channelId: string) => {
                client.channels.fetch(channelId).then(channel => {
                    if (channel && (channel.type === 0 || channel.type === 5)) {

                        const color =
                        game.rating >= 8
                            ? 0x57f287 // verde - jogos excelentes (8-10)
                            : game.rating >= 6.5
                                ? 0x5865f2 // azul - jogos muito bons (6.5-8)
                                : game.rating >= 5
                                    ? 0xfee75c // amarelo - jogos bons (5-6.5)
                                    : 0xffa500; // laranja - jogos aceitáveis (3-5)
            
                        const embed = new EmbedBuilder()
                            .setColor(color)
                            .setTitle(game.name)
                            .setURL(game.igdbUrl)
                            .setThumbnail(game.coverImage) // capa do jogo
                            .setImage(game.backgroundImage) // screenshot ou imagem grande
                            .setDescription(
                                `📖 **Resumo:**\n${game.summary.substring(0, 180)}${game.summary.length > 180 ? '...' : ''}\n\n` +
                            `🎮 **Lançamento:** ${game.releaseDate}\n` +
                            `⭐ **Nota IGDB:** ${game.rating > 0 ? `${game.rating.toFixed(1)}/10` : 'Sem avaliação'}${game.rating >= 8 ? ' 🏆' : game.rating >= 6.5 ? ' ⭐' : ''}\n` +
                            `🧩 **Gêneros:** ${game.genres}\n` +
                            `💻 **Plataformas:** ${game.platforms}\n\n` +
                            `${game.isOnline ? '🌐' : '📱'} **Online:** ${game.isOnline ? 'Sim' : 'Não'}\n` +
                            `${game.isMultiplayer ? '👥' : '👤'} **Multiplayer:** ${game.isMultiplayer ? 'Sim' : 'Não'}\n` +
                            `${game.isCoop ? '🤝' : '🚫'} **Co-op:** ${game.isCoop ? 'Sim' : 'Não'}\n` +
                            (game.isMultiplayer ? `🎯 **Detalhes:** ${game.multiplayerInfo}` : '')
                            )
                            .setFooter({
                                text: "Fonte: IGDB.com",
                                iconURL: "https://www.igdb.com/favicon.ico",
                            })
                            .setTimestamp();
            
                        channel.send({ embeds: [embed] });
                    }
                } ).catch(console.error);
            });
        } catch (error) {
            console.error('❌ Erro ao processar fila de jogos:', error);
        }
    }
};
