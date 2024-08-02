import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";
import { permissionService } from "../../services/permissions.service";
import guildsService from "../../services/guilds.service";

export default new Command({
    name: "welcome",
    description: "set welcome channel",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    async run({ interaction, options, client }) {
        const member = interaction.user;

        const isAdmin = await permissionService.isMasterAdmin(member.id);
        if (!isAdmin) {
            return interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
        }

        try {
            if (!interaction.guild) return;
            await guildsService.setGuildWelcomeChannel(interaction.channelId, interaction.guild.id)

            return interaction.reply({
                content: "Canal de boas vindas setado com sucesso",
                ephemeral: true
            });
        } catch (err) {
            interaction.reply({
                content: "Erro ao setar o canal de boas vindas",
                ephemeral: true
            })
        }
    },
});
