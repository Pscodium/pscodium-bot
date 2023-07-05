import { ActionRowBuilder, ButtonInteraction, CacheType, ChannelType, ColorResolvable, EmbedBuilder, Interaction, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import { config } from "../..";
import { ticketDatabaseManager } from "./ticketDatabaseManager";
import convertToSmallCaps from "../textManipulator/convertToSmallCaps";


class ChannelManager {

    public channel: TextChannel | undefined;

    async channelCreator(interaction: Interaction<CacheType>) {
        const ticketChannelName = `●🎫┇${convertToSmallCaps('ticket-'+ interaction.user.username.toLowerCase())}`;

        const channel = await interaction.guild?.channels.create({
            name: ticketChannelName,
            type: ChannelType.GuildText,
            parent: config.important.ticketCategoryId,
            topic: interaction.user.id,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ["ViewChannel", "SendMessages"]
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ["ViewChannel"]
                }
            ]
        });

        this.channel = channel;
        return channel;
    }

    async channelDelete(interaction: ButtonInteraction<CacheType>) {
        if (!interaction.memberPermissions?.has('ManageChannels')) {
            await interaction.reply({ content: `Você não tem permissão para fechar esse ticket, finalize seu suporte com alguém da staff.`, ephemeral: true});
            return;
        }

        await ticketDatabaseManager.closeTicketByChannelId(interaction.channelId, interaction.user.id);
        interaction.channel?.delete();


    }

    async memberTicketAdd(interaction: ButtonInteraction<CacheType>) {
        if (!interaction.memberPermissions?.has('ManageChannels')) {
            await interaction.reply({ content: `Você não tem permissões para inserir usuários em um ticket, aguarde alguém da staff.`, ephemeral: true}).catch(err => { return; });
            return;
        }
        const modal = new ModalBuilder({ customId: "member-ticket-modal", title: "Abertura de Ticket"});

        const memberAddRow = new ActionRowBuilder<TextInputBuilder>({
            components: [
                new TextInputBuilder({
                    customId: "ticket-member-add-modal",
                    label: "ID do usuário",
                    placeholder: "Digite o ID do usuário",
                    style: TextInputStyle.Short,
                    required: true
                })
            ]
        });

        modal.setComponents(memberAddRow);

        await interaction.showModal(modal);
    }

    async adminTicketClaim(interaction: ButtonInteraction<CacheType>) {
        if (!interaction.memberPermissions?.has('ManageChannels')) {
            await interaction.reply({ content: `Você não pode reinvindicar um ticket, aguarde alguém da staff.`, ephemeral: true}).catch(err => { return; });
            return;
        }
        const user = await ticketDatabaseManager.findUserByChannelId(interaction.channelId);
        if (!user) return;

        interaction.channel?.send({content: `<@${user.id}>`, embeds: [
            new EmbedBuilder({
                author: { name: "Pscodium Bot Ticket System" },
                title: "Obrigado pela espera.",
                description: `
                Seu ticket foi atendido por ${interaction.user},
                `,
            }).setColor(config.colors.Aquamarine as ColorResolvable)
        ]}).catch(err => { return; });

        interaction.reply({ ephemeral: true, content: `${interaction.user} Você reinvindicou este ticket.`}).catch(err => { return; });

        await ticketDatabaseManager.updateClaimByChannelId(interaction.channelId, interaction.user.id);
    }
}

export const channelManager = new ChannelManager();
