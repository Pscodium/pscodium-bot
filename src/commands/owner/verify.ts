/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Command";
import { config } from "../..";


export default new Command({
    name: "verify",
    description: "Abre mensagem de verificação de usuários.",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction, client }) {

        const member = interaction.user;

        if (!(["439915811692609536", "597225862366232582"].includes(member.id))) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        if (!interaction.channel) return;
        const ticketChannel = client.channels.cache.find(channel => channel.id == config.important.verifyChannelId);
        if (interaction.channel.id !== config.important.verifyChannelId) {
            return interaction.reply({ content: `Você não pode utilizar o comando */verify* nesse chat. Utilize o chat ${ticketChannel}`});
        }

        const embed = new EmbedBuilder({
            author: { name: "Pscodium Bot Verify Account" },
            description: "Clique na reação abaixo para poder ver todos os canais",
        }).setColor(config.colors.green as ColorResolvable);

        (await interaction.channel.send({ embeds: [embed] })).react('✅');
        await interaction.reply({ content: "Pode excluir esta mensagem, apenas você vai ver ela...", ephemeral: true });
    }
});
