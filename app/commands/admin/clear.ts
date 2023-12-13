import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";
import { permissionService } from "../../services/permissions.service";

export default new Command({
    name: "clear",
    description: "delete chat messages",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "ManageChannels"
    ],
    options: [
        {
            name: "amount",
            description: "The total number of messages to be deleted",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        }
    ],
    async run({interaction, options}) {

        const member = interaction.user;

        const isAdmin = await permissionService.isMasterAdmin(member.id);
        if (!isAdmin) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;

        interaction.deferReply({ephemeral: true});

        const amount = options.getInteger("amount", true);

        interaction.channel?.bulkDelete(Math.min(amount, 100), true)
            .then(deletedMessages => {
                interaction.editReply({content: `${deletedMessages.size} deleted messages`});
            })
            .catch(reason => {
                interaction.editReply({content: `Unable to delete messages: \n${reason}`});
            });


    },
});
