import { ActionRowBuilder, APIActionRowComponent, APIMessageActionRowComponent, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder } from "discord.js";
import { Event } from "../../structs/types/Event";
import { channelManager } from "../../utils/ticket/ticketChannelManager";
import { ticketDatabaseManager } from "../../utils/ticket/ticketDatabaseManager";
import { config } from "../..";

export default new Event({
    name: "interactionCreate",
    once: false,
    async run(interaction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId != 'ticket-form-modal') return;

        const question = interaction.fields.getTextInputValue("ticket-form-modal-input");

        const reply = interaction.reply({content: "Formulário enviado com sucesso!", ephemeral: true });
        reply.then((i) => {
            setTimeout(() => {
                i.delete();
            }, 2000);
        });

        const channel = await channelManager.channelCreator(interaction);

        if (!channel) return;
        await ticketDatabaseManager.createTicket(interaction.user.id, channel.id, question);

        const channelRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
                label: "Entrar no canal",
                style: ButtonStyle.Link,
                url: channel?.url
            })) as unknown as APIActionRowComponent<APIMessageActionRowComponent>;

        const channelEmbed = new EmbedBuilder({
            author: { name: "Pscodium Bot Ticket System" },
            description: `Canal ${channel} criado com sucesso, use o botão abaixo para entrar em contato com o suporte.`,
        }).setColor(config.colors.Caramel as ColorResolvable);

        const rep = await interaction.followUp({ embeds: [channelEmbed], components: [channelRow], ephemeral: true });

        const adminRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
                label: "Fechar",
                style: ButtonStyle.Danger,
                customId: "ticket-close-button",
                emoji: "📪"
            }),
            new ButtonBuilder({
                label: "Membros",
                style: ButtonStyle.Secondary,
                customId: "ticket-member-button",
                emoji: "➕"
            }),
            new ButtonBuilder({
                label: "Reinvindicar",
                style: ButtonStyle.Primary,
                customId: "ticket-claim-button",
                emoji: "👋"
            })) as unknown as APIActionRowComponent<APIMessageActionRowComponent>;
        const adminEmbed = new EmbedBuilder({
            author: { name: "Pscodium Bot Ticket System" },
            title: "Bem-vindo(a), obrigado por abrir um ticket",
            description: `
            Um membro de nossa equipe de moderação em breve cuidará de sua solicitação.
            Obrigado por esperar com calma e bom humor
            `,
        }).setColor(config.colors["Baby powder"] as ColorResolvable);

        await channel?.send({ content: `${interaction.user}`, components: [adminRow], embeds: [adminEmbed] }).catch(err => { return; });

        const questionEmbed = new EmbedBuilder({
            author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() || undefined, },
            description: `
            Dúvida: ${question}
            `,
        }).setColor(config.colors.Cinereous as ColorResolvable);

        await channel.send({ embeds: [questionEmbed]});

        interaction.user.send(`Seu ticket no server ${interaction.guild?.name} foi criado. Você pode ver ele no canal ${channel}.`).catch(err => { return; });

        setTimeout(() => {
            interaction.deleteReply(rep);
        }, 50000);

    }
});
