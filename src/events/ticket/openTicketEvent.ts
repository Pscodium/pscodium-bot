/* eslint-disable indent */
import { ActionRowBuilder, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "interactionCreate",
    once: false,
    async run(i) {
        if (!i.isButton()) return;
        if (i.customId != 'open-ticket-button') return;

        const { guild } = i;
        if (!guild) return;
        const guildChannels = guild.channels.cache;

        for (const c of guildChannels.values()) {
            if (c.name.startsWith('ticket')) {
                const textChannel = c as TextChannel;
                const ticketOwnerId = textChannel.topic;

                if (ticketOwnerId == i.user.id) {
                    i.reply({content: "Você já tem um ticket em aberto.", ephemeral: true });
                    return;
                }
            }
        }

        const modal = new ModalBuilder({ customId: "ticket-form-modal", title: "Abertura de Ticket"});

        const ticketBody = new ActionRowBuilder<TextInputBuilder>({
            components: [
                new TextInputBuilder({
                    customId: "ticket-form-modal-input",
                    label: "Mensagem",
                    placeholder: "Digite sua dúvida...",
                    style: TextInputStyle.Short,
                    required: true
                })
            ]
        });

        modal.setComponents(ticketBody);

        await i.showModal(modal);
    }
});
