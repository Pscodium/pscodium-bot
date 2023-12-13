import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "mention",
    type: ApplicationCommandType.User,
    async run({ interaction }) {
        if (!interaction.isUserContextMenuCommand()) return;

        const mention = interaction.targetMember;

        interaction.reply({ content: `${interaction.user} mentioned ${mention}` });
    }
});
