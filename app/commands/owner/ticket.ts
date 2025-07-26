/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { Command } from "../../structs/types/Command";
import { config } from "../..";
import { permissionService } from "../../services/permissions.service";


export default new Command({
    name: "ticket",
    description: "Envie seu ticket para o suporte.",
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
        const ticketChannel = client.channels.cache.find(channel => channel.id == config.important.ticketChannelId);
        if (interaction.channel.id !== config.important.ticketChannelId) {
            return interaction.reply({ content: `Você não pode utilizar o comando */ticket* nesse chat. Utilize o chat ${ticketChannel}`});
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder({
                    label: "Abrir Ticket",
                    style: ButtonStyle.Primary,
                    custom_id: "open-ticket-button"
        }));

        const embed = new EmbedBuilder({
            author: { name: "Pscodium Bot Ticket System" },
            description: "Clique no botão abaixo, logo em seguida, aparecerá uma caixa de texto onde você pode nos dar mais detalhes sobre a sua dúvida o que facilita muito no atendimento.",
        }).setColor(config.colors.blue as ColorResolvable);

        await (interaction.channel as TextChannel).send({ embeds: [embed.toJSON()], components: [row] });
    }
});
