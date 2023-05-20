/* eslint-disable indent */
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";
import { achievementManager } from "../../utils/AchievementManager";

export default new Command({
    name: "give-achievement",
    description: "This command creates badges for achievements.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "User to receive achievement.",
            type: ApplicationCommandOptionType.User,
            required: false
        },
    ],
    async run({interaction, options}) {

        const { guild } = interaction;
        const member = interaction.user;
        const user = options.getUser("user");

        if (!member) return;
        if (!guild) return;

        if (member.id !== "439915811692609536") {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        const firstList = await achievementManager.getFirstTwentyFiveAchievements();
        const secondList = await achievementManager.getSecondTwentyFiveAchievements();
        let secondRow;
        let msg: Message<boolean>;



        const row = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: 'first-list',
                    placeholder: "Select a Icon/Badge",
                    options: firstList
                })
            ]
        });
        if (secondList.length != 0) {
            secondRow = new ActionRowBuilder<StringSelectMenuBuilder>({
                components: [
                    new StringSelectMenuBuilder({
                        custom_id: 'second-list',
                        placeholder: "Select a Icon/Badge",
                        options: secondList
                    })
                ]
            });
            msg = await interaction.reply({ content: "Selecione algum ícone dessas listas", components: [row, secondRow], fetchReply: true, ephemeral: true });
        } else {
            msg = await interaction.reply({ content: "Selecione algum ícone dessas listas", components: [row], fetchReply: true, ephemeral: true });
        }

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

        collector.on('collect', async (selectInteraction) => {

            switch (selectInteraction.customId) {
                case "first-list": {
                    const value = selectInteraction.values[0];

                    await selectInteraction.update({ content: ":clock10: Carregando seu emoji...", components: [] });

                    await achievementManager.addAchievementForUser(user? user.id : member.id, value);

                    setTimeout(() => {
                        selectInteraction.followUp({ ephemeral: true, embeds: [
                            new EmbedBuilder({
                                title: "Conquista enviada com sucesso",
                                description: ` __**Um novo achievement foi enviado**__
                                - **Quem recebeu**: ${user? user : member}
                                - **Quem enviou**: ${member}
                                `,
                                author: {
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                }
                            }).setColor(config.colors.Aquamarine as ColorResolvable)
                        ]});
                    }, 1000);

                    break;
                }
                case "second-list": {
                    const value = selectInteraction.values[0];

                    await selectInteraction.update({ content: ":clock10: Carregando seu emoji...", components: [] });

                    await achievementManager.addAchievementForUser(user? user.id : member.id, value);

                    setTimeout(() => {
                        selectInteraction.followUp({ ephemeral: true, embeds: [
                            new EmbedBuilder({
                                title: "Conquista enviada com sucesso",
                                description: ` __**Um novo achievement foi enviado**__
                                - **Quem recebeu**: ${user? user : member}
                                - **Quem enviou**: ${member}
                                `,
                                author: {
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                }
                            }).setColor(config.colors.Aquamarine as ColorResolvable)
                        ]});
                    }, 1000);
                    break;
                }
            }
        });
    },
});
