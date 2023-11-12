import { ApplicationCommandOptionType, ApplicationCommandType, Guild } from "discord.js";
import { Command } from "../../structs/types/Command";
import { permissionService } from "../../services/permissions.service";


export default new Command({
    name: "server",
    description: "Change server settings",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    options: [
        {
            name: "icon",
            description: "Change server icon",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "image-file",
                    description: "Send a image file",
                    type: ApplicationCommandOptionType.Attachment,
                    required: true
                }
            ]
        }
    ],
    async run({ interaction, options }) {
        const member = interaction.user;

        const isAdmin = await permissionService.isMasterAdmin(member.id);
        if (!isAdmin) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        if (!interaction.isChatInputCommand()) return;
        const guild = interaction.guild as Guild;

        const image = options.getAttachment("image-file", true);

        await interaction.deferReply({ ephemeral: true });

        await guild.setIcon(image.url);

        await interaction.editReply({ content: `The new ${guild.name} server icon has been set!` });
    }
});
