import { ApplicationCommandOptionType, ApplicationCommandType, Guild } from "discord.js";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "server",
    description: "Change server settings",
    type: ApplicationCommandType.ChatInput,
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
        if (!interaction.isChatInputCommand()) return;
        const guild = interaction.guild as Guild;

        const image = options.getAttachment("image-file", true);

        await interaction.deferReply({ ephemeral: true });

        await guild.setIcon(image.url);

        await interaction.editReply({ content: `The new ${guild.name} server icon has been set!` });
    }
});
