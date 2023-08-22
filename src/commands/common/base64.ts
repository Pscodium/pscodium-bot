/* eslint-disable indent */
import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Command";
import { config } from "../..";

export default new Command({
    name: "base64",
    description: "Made for experienced devs.",
    options: [
        {
            name: "encode",
            description: "Encode message to base64",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message",
                    description: "Message",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "decode",
            description: "Decode base64 to message",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message",
                    description: "message",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run({ interaction, options }){
        const value = options.getString('message');
        const subCommand = options.getSubcommand();

        if (!value) return;

        switch (subCommand) {
            case "decode":
                try {
                    const decodedMessage = decodeMessage(value);

                    if (!decodedMessage) return;

                    const embed = new EmbedBuilder()
                        .setTitle("Base64 Decoder")
                        .setDescription("Você transformou um código base64 em mensagem utf-8")
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL() || undefined,
                        })
                        .setFields(
                            {
                                name: "Sua mensagem",
                                value: value
                            },
                            {
                                name: "Saída",
                                value: decodedMessage
                            }
                        )
                        .setColor(config.colors.blue as ColorResolvable);

                    interaction.reply({ embeds: [embed] });
                } catch (err) {
                    interaction.reply("Erro ao tentar decodificar a sua mensagem.");
                }
                break;
            case "encode":
                try {
                    const encodedMessage = encodeMessage(value);

                    if (!encodedMessage) return;

                    const embed = new EmbedBuilder()
                        .setTitle("Base64 Decoder")
                        .setDescription("Você transformou uma mensagem UTF-8 em uma base64")
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL() || undefined,
                        })
                        .setFields(
                            {
                                name: "Sua mensagem",
                                value: value
                            },
                            {
                                name: "Saída",
                                value: encodedMessage
                            }
                        )
                        .setColor(config.colors.blue as ColorResolvable);

                    interaction.reply({ embeds: [embed] });
                } catch (err) {
                    interaction.reply("Erro ao tentar codificar a sua mensagem.");
                }
                break;
        }

        function decodeMessage(message: string) {
            const decodedMessage = Buffer.from(message, 'base64').toString('utf-8');

            for (let i = 0; i < decodedMessage.length; i++) {
                if (decodedMessage.charCodeAt(i) > 127) {
                    interaction.reply({ content: "A mensagem contém caracteres inválidos fora do conjunto ASCII.", ephemeral: true });
                    return;
                }
            }

            return decodedMessage;
        }

        function encodeMessage(message: string) {
            const base64String = Buffer.from(message).toString('base64');
            return base64String;
        }
    }
});
