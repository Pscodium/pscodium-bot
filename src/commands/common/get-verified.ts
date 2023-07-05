import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";
import { badgesManager } from "../../utils/BadgesManager";


export default new Command({
    name: "get-verified",
    description: "Get a verified account.",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction }) {
        const { user } = interaction;
        try {
            const verified = await badgesManager.getVerifiedBadge(user.id);

            if (!verified) {
                return interaction.reply({ content: "Your account is already verified.", ephemeral: true });
            }
            interaction.reply({ content: "Successfully verified account.", ephemeral: true });

        } catch (err) {
            await interaction.reply({ content: String(err) });
        }
    }
});
