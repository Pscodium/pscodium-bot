/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Command";
import { config } from "../..";
import { permissionService } from "../../services/permissions.service";


export default new Command({
    name: "verify",
    description: "Abre mensagem de verificação de usuários.",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction, client }) {

        const member = interaction.user;

        const isOwner = await permissionService.isOwner(member.id);
        if (!isOwner) {
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

        // Ensure the channel supports send (TextChannel or NewsChannel)
        if ('send' in interaction.channel && typeof interaction.channel.send === 'function') {
            (await interaction.channel.send({ embeds: [embed.toJSON()] })).react('✅');
        } else {
            await interaction.reply({ content: "Não foi possível enviar a mensagem de verificação neste canal.", ephemeral: true });
            return;
        }
        await interaction.reply({ content: "Pode excluir esta mensagem, apenas você vai ver ela...", ephemeral: true });
    }
});
