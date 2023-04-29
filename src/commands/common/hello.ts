import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "hello",
    description: "Made for experienced devs.",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction }){

        await interaction.deferReply({ ephemeral: true });

        interaction.editReply({
            content: "Hello World!"
        });
    }
});
