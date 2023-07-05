import { Event } from "../../structs/types/Event";
import { channelManager } from "../../utils/ticket/ticketChannelManager";

export default new Event({
    name: "interactionCreate",
    once: false,
    async run(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId != 'ticket-close-button') return;

        await channelManager.channelDelete(interaction);
    }
});
