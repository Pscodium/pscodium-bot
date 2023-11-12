import { ApplicationCommandType } from "discord.js";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { permissionService } from "../../services/permissions.service";

export default new Command({
    name: "badges-loader",
    description: "This command loads badges emoji from the Badge Server.",
    type: ApplicationCommandType.ChatInput,
    async run({interaction}) {

        const { guild } = interaction;
        const member = interaction.user;

        if (!member) return;
        if (!guild) return;

        const isOwner = await permissionService.isOwner(member.id);
        if (!isOwner) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        guild.emojis.cache.map(async (emoji) => {
            if (emoji.name === null) return;

            const badge = await db.Badge.findOne({
                where: {
                    emoji: emoji.name
                }
            });
            if (!badge) {
                await db.Badge.create({
                    emoji: emoji.name,
                    value: `<:${emoji.name}:${emoji.id}>`
                });
            }
        });

        interaction.reply({ content: `Foram adicionadas ${guild.emojis.cache.size} badges no banco de dados`, ephemeral: true });

    },
});
