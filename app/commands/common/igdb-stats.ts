import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Command";
import { GameJobService } from "../../services/jobs/game.job.service";

export default new Command({
    name: "igdb-stats",
    description: "Mostra estatísticas da base de dados IGDB",
    type: ApplicationCommandType.ChatInput,
    
    async run({ interaction }) {
        await interaction.deferReply();
        
        try {
            const gameService = new GameJobService();
            const analysis = await gameService.analyzeGameDatabase();
            
            if (!analysis) {
                return interaction.editReply({
                    content: "❌ Não foi possível obter as estatísticas da IGDB."
                });
            }

            // Embed principal com estatísticas gerais
            const statsEmbed = new EmbedBuilder()
                .setTitle("📊 Estatísticas da Base IGDB")
                .setColor(0x5865f2)
                .setDescription("Análise completa da base de dados de jogos")
                .addFields(
                    {
                        name: "🎮 Estatísticas Gerais",
                        value: 
                            `**Total de jogos:** ${analysis.totalGames.toLocaleString()}\n` +
                            `**Jogos com rating:** ${analysis.gamesWithRating.toLocaleString()}\n` +
                            `**Jogos bons (>3.0):** ${analysis.gamesWithGoodRating.toLocaleString()}\n` +
                            `**Jogos excelentes (>8.0):** ${analysis.gamesWithExcellentRating.toLocaleString()}`,
                        inline: true
                    },
                    {
                        name: "🔍 Filtros do Bot", 
                        value:
                            `**Pool disponível:** ${analysis.gamesWithRatingAndCount.toLocaleString()}\n` +
                            `**Jogos recentes:** ${analysis.gamesRecentlyReleased.toLocaleString()}\n` +
                            `**Cobertura:** ${((analysis.gamesWithRatingAndCount/analysis.gamesWithRating)*100).toFixed(1)}%\n` +
                            `**Qualidade:** ${((analysis.gamesWithGoodRating/analysis.gamesWithRating)*100).toFixed(1)}% são bons`,
                        inline: true
                    }
                )
                .setFooter({
                    text: "Dados obtidos da IGDB.com",
                    iconURL: "https://www.igdb.com/favicon.ico"
                })
                .setTimestamp();

            // Embed com distribuição por qualidade
            const distributionEmbed = new EmbedBuilder()
                .setTitle("🏆 Distribuição por Qualidade")
                .setColor(0xfee75c)
                .setDescription("Quantidade de jogos por faixa de rating");

            let distributionText = "";
            analysis.gamesByRatingRanges.forEach(range => {
                const percentage = ((range.count/analysis.gamesWithRating)*100).toFixed(1);
                const emoji = range.range.includes('9.0-10.0') ? '🏆' :
                    range.range.includes('8.0-8.9') ? '⭐' :
                        range.range.includes('7.0-7.9') ? '✨' :
                            range.range.includes('6.0-6.9') ? '👍' :
                                range.range.includes('5.0-5.9') ? '👌' : '📊';
                
                distributionText += `${emoji} **${range.range}**\n${range.count.toLocaleString()} jogos (${percentage}%)\n\n`;
            });

            distributionEmbed.setDescription(distributionText);

            await interaction.editReply({
                embeds: [statsEmbed, distributionEmbed]
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas IGDB:', error);
            await interaction.editReply({
                content: "❌ Erro ao buscar estatísticas da IGDB. Tente novamente mais tarde."
            });
        }
    }
});