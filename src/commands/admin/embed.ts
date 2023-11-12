import { ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";
import { permissionService } from "../../services/permissions.service";


export default new Command({
    name: "embed",
    description: "Create a test embed.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    async run({ interaction }){

        const member = interaction.user;
        
        const isAdmin = await permissionService.isMasterAdmin(member.id);
        if (!isAdmin) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("Título")
            .setDescription("Bot desenvolvido por [pscodium](https://pscodium.dev/)")
            .setColor(config.colors.turquoise as ColorResolvable)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setFooter({
                text: "Footer",
                iconURL: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
            })
            .setFields(
                {
                    name: "Tarefa 1",
                    value: "Valor de tarefa 1"
                },
                {
                    name: "Tarefa 2",
                    value: "Valor de tarefa 2",
                    inline: true
                },
                {
                    name: "Tarefa 3 inline",
                    value: "Valor de tarefa 3 inline",
                    inline: true
                },
            )
            .setTimestamp()
            .setThumbnail(interaction.user.avatarURL())
            .setImage(interaction.user.avatarURL());


        await interaction.deferReply({ ephemeral: true });

        interaction.editReply({
            embeds: [embed]
        });

    }
});
