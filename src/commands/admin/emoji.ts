import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";

export default new Command({
    name: "emoji",
    description: "dManage guild emojis",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "ManageEmojisAndStickers"
    ],
    options: [
        {
            name: "create",
            description: "The total number of messages to be deleted",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Insert a name for emoji",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "image",
                    description: "Image for emoji",
                    type: ApplicationCommandOptionType.Attachment,
                    required: true
                }

            ]
        },
        {
            name: "delete",
            description: "Delete emoji",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Insert a name for emoji to delete",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    async run({interaction, options}) {

        const { guild } = interaction;

        const subCommand = options.getSubcommand();
        const name = options.getString('name');
        const url = options.getAttachment('image');
        if (!guild) return;
        if (!name) return;

        await interaction.reply({ content: ":clock10: Carregando seu emoji..."});

        if (subCommand == "create") {
            if (!url) return;
            try {
                const emoji = await interaction.guild?.emojis.create({ name: name, attachment: url.url }).catch(() => {
                    setTimeout(() => {
                        interaction.followUp(`Emoji não pode ser criado... :disappointed_relieved:`);
                    }, 2000);
                });

                setTimeout(() => {
                    interaction.followUp({content:`Emoji criado com sucesso: ${emoji}`, embeds: [
                        new EmbedBuilder({
                            title: "Emoji criado com sucesso",
                            description: ` **Seu novo emoji**
                            - **Emoji**: ${emoji}
                            - **Nome**: ${name}
                            `,
                            author: {
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL() || undefined,
                            }
                        }).setColor(config.colors.green as ColorResolvable)
                    ]});
                }, 3000);
            } catch (e) {
                interaction.followUp('Não foi possível criar o emoji!');
            }
        } else {
            const emoji = interaction.guild?.emojis.cache.find(emoji => emoji.name === name);

            if (!emoji) {
                return interaction.followUp(`Emoji não encontrado: ${name}`);
            }

            try {
                await emoji.delete();
                interaction.followUp(`Emoji excluído com sucesso: ${emoji}`);
            } catch (e) {
                interaction.followUp('Não foi possível excluir o emoji!');
            }
        }

    }
});
