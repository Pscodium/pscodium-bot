import { ApplicationCommandType } from "discord.js";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";

export default new Command({
    name: "load-emojis",
    description: "Insert emojis in database",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    async run({interaction}) {

        const { guild } = interaction;

        if (!guild) return;

        guild.emojis.cache.map(async (emoji) => {
            if (emoji.name === null) return;
            await db.Emoji.create({
                emoji: emoji.name,
                value: `<:${emoji.name}:${emoji.id}>`
            });
        });

        interaction.reply({ content: `Foram adicionados ${guild.emojis.cache.size} emojis no banco de dados`, ephemeral: true });

    },
});
