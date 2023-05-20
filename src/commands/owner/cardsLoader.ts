import { ApplicationCommandType } from "discord.js";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";

export default new Command({
    name: "cards-loader",
    description: "This command loads cards emoji from the Debuddy Fórum server.",
    type: ApplicationCommandType.ChatInput,
    async run({interaction}) {

        const { guild } = interaction;
        const member = interaction.user;

        if (!member) return;
        if (!guild) return;

        if (member.id !== "439915811692609536") {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        guild.emojis.cache.map(async (emoji) => {
            if (emoji.name === null) return;
            await db.Card.create({
                emoji: emoji.name,
                value: `<:${emoji.name}:${emoji.id}>`
            });
        });

        interaction.reply({ content: `Foram adicionadas ${guild.emojis.cache.size} cartas no banco de dados`, ephemeral: true });

    },
});
