import { TextChannel } from "discord.js";
import { Event } from "../../structs/types/Event";
import { db } from "../../data-source";
import { ticketDatabaseManager } from "../../utils/ticket/ticketDatabaseManager";


export default new Event({
    name: "interactionCreate",
    once: false,
    async run(interaction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId != 'member-ticket-modal') return;

        const { guild } = interaction;
        if (!guild) return;

        const memberId = interaction.fields.getTextInputValue("ticket-member-add-modal");

        const memberExists = await db.User.findOne({
            where: {
                id: memberId
            }
        });
        if (!memberExists) {
            return interaction.reply({ content: `${interaction.user}, o ID '${memberId}' que você digitou não existe no servidor.`, ephemeral: true});
        }

        const channel = interaction.channel as TextChannel;

        channel.permissionOverwrites.create(memberId, { ViewChannel: true, SendMessages: true });

        interaction.reply({ content: `O usuário <@${memberId}> também está participando do ticket agora.`});

        if (!interaction.channelId) return;
        await ticketDatabaseManager.changeTagForMembersAddByChannelId(interaction.channelId, memberExists);
    }
});
