import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "mention",
    type: ApplicationCommandType.User,
    async run({ interaction, t }) {
        if (!interaction.isUserContextMenuCommand()) return;

        const mention = interaction.targetMember;

        interaction.reply({ content: t.translate('MENTION_MESSAGE', { Sender: interaction.user, Mentioned: mention }) });
    }
});
