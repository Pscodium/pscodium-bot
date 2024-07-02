import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";
import { badgesService } from "../../services/badges.service";


export default new Command({
    name: "get-verified",
    description: "Get a verified account.",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction, t }) {
        const { user } = interaction;
        try {
            const verified = await badgesService.getVerifiedBadge(user.id);

            if (!verified) {
                return interaction.reply({ content: t.translate('ACCOUNT_ALREADY_VERIFIED'), ephemeral: true });
            }
            interaction.reply({ content: t.translate('ACCOUNT_SUCCESSFULLY_VERIFIED'), ephemeral: true });

        } catch (err) {
            await interaction.reply({ content: String(err) });
        }
    }
});
