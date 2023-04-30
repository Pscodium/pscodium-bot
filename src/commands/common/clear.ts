import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";

export default new Command({
    name: "clear",
    description: "delete chat messages",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "amount",
            description: "The total number of messages to be deleted",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        }
    ],
    async run({interaction, options}) {
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
