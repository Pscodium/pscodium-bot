/* eslint-disable indent */
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, ComponentType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { config } from "../..";
import { AchievementTypes } from "../../models/tables/Achievements";
import { Command } from "../../structs/types/Command";
import { achievementManager } from "../../utils/AchievementManager";
import { getBadgesForChoices } from "../../utils/GetBadgesForChoices";

const choices = Object.keys(AchievementTypes).map(type => ({
    name: type.charAt(0).toLocaleUpperCase() + type.slice(1).toLowerCase(),
    value: type
}));

export default new Command({
    name: "achievement",
    description: "This command creates achievement using the badges from database.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "name",
            description: "Name of this achievement.",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "description",
            description: "Description of this achievement.",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "type",
            description: "Type of this achievement.",
            type: ApplicationCommandOptionType.String,
            choices: choices,
            required: true
        },
        {
            name: "level",
            description: "Level to reach this achievement.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: "wins",
            description: "Wins to reach this achievement.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: "plays",
            description: "Plays to reach this achievement.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: "money",
            description: "Money to reach this achievement.",
            type: ApplicationCommandOptionType.Number,
            required: false
        }
    ],
    async run({interaction, options}) {

        const { guild } = interaction;
        const member = interaction.user;
        const name = options.getString("name");
        const description = options.getString("description");
        const type = options.getString("type");

        const level = options.getInteger("level");
        const wins = options.getInteger("wins");
        const plays = options.getInteger("plays");
        const money = options.getNumber("money");

        if (!type || !name || !description) return;
        if (!member) return;
        if (!guild) return;

        if (member.id !== "439915811692609536") {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        const firstList = await getBadgesForChoices.getFirstTwentyFiveBadges();
        const secondList = await getBadgesForChoices.getSecondTwentyFiveBadges();
        const thirdList = await getBadgesForChoices.getThirdTwentyFiveBadges();

        if (!firstList || !secondList) return;

        const row = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: 'first-list',
                    placeholder: "Select a Icon/Badge",
                    options: firstList
                })
            ]
        });
        const secondRow = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: 'second-list',
                    placeholder: "Select a Icon/Badge",
                    options: secondList
                })
            ]
        });

        const thirdRow = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: 'third-list',
                    placeholder: "Select a Icon/Badge",
                    options: thirdList
                })
            ]
        });

        const msg = await interaction.reply({ content: "Selecione algum ícone dessas listas", components: [row, secondRow, thirdRow], fetchReply: true, ephemeral: true });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

        collector.on('collect', async (selectInteraction) => {

            switch (selectInteraction.customId) {
                case "first-list": {
                    const value = selectInteraction.values[0];

                    await selectInteraction.update({ content: ":clock10: Carregando seu emoji...", components: [] });

                    const badge = await achievementManager.getBadgeFromDatabase(value);
                    if (!badge) return;

                    await achievementManager.createAchievement({
                        emoji: badge.emoji,
                        emoji_value: badge.value,
                        type: type as AchievementTypes,
                        level_to_reach: level? level : 0,
                        wins_to_reach: wins? wins : 0,
                        plays_to_reach:plays? plays : 0,
                        money_to_reach: money? money : 0,
                        name: name,
                        description: description,
                    });

                    setTimeout(() => {
                        selectInteraction.followUp({ ephemeral: true, components: [], embeds: [
                            new EmbedBuilder({
                                title: "Achievement criado com sucesso",
                                description: ` __**Seu novo achievement**__
                                - **Nome da Conquista**: ${name}
                                - **Descrição da Conquista**: ${description}
                                - **Tipo da Conquista**: ${type.charAt(0).toLocaleUpperCase() + type.slice(1).toLowerCase()}
                                - **Nível para alcançar**: ${level ? ` ${level}` : `Nenhum`}
                                - **Vezes jogadas para alcançar**: ${plays ? `${plays}` : `Nenhuma`}
                                - **Jogadas ganhas para alcançar**: ${wins ? `${wins}` : `Nenhuma`}

                                - **Emoji**: ${badge.value}
                                - **Nome do Emoji**: ${badge.emoji}
                                `,
                                author: {
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                }
                            }).setColor(config.colors.green as ColorResolvable)
                        ] });

                    }, 1000);
                    break;
                }
                case "second-list": {
                    const value = selectInteraction.values[0];

                    await selectInteraction.update({ content: ":clock10: Carregando seu emoji...", components: [] });

                    const badge = await achievementManager.getBadgeFromDatabase(value);
                    if (!badge) return;

                    await achievementManager.createAchievement({
                        emoji: badge.emoji,
                        emoji_value: badge.value,
                        type: type as AchievementTypes,
                        level_to_reach: level? level : 0,
                        wins_to_reach: wins? wins : 0,
                        plays_to_reach: plays? plays : 0,
                        money_to_reach: money? money : 0,
                        name: name,
                        description: description,
                    });

                    setTimeout(() => {
                        selectInteraction.followUp({ ephemeral: true, components: [], embeds: [
                            new EmbedBuilder({
                                title: "Achievement criado com sucesso",
                                description: ` __**Seu novo achievement**__
                                - **Nome da Conquista**: ${name}
                                - **Descrição da Conquista**: ${description}
                                - **Tipo da Conquista**: ${type.charAt(0).toLocaleUpperCase() + type.slice(1).toLowerCase()}
                                - **Nível para alcançar**: ${level ? ` ${level}` : `Nenhum`}
                                - **Vezes jogadas para alcançar**: ${plays ? `${plays}` : `Nenhuma`}
                                - **Jogadas ganhas para alcançar**: ${wins ? `${wins}` : `Nenhuma`}

                                - **Emoji**: ${badge.value}
                                - **Nome do Emoji**: ${badge.emoji}
                                `,
                                author: {
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                }
                            }).setColor(config.colors.green as ColorResolvable)
                        ] });

                    }, 1000);
                    break;
                }
                case "third-list": {
                    const value = selectInteraction.values[0];

                    await selectInteraction.update({ content: ":clock10: Carregando seu emoji...", components: [] });

                    const badge = await achievementManager.getBadgeFromDatabase(value);
                    if (!badge) return;

                    await achievementManager.createAchievement({
                        emoji: badge.emoji,
                        emoji_value: badge.value,
                        type: type as AchievementTypes,
                        level_to_reach: level? level : 0,
                        wins_to_reach: wins? wins : 0,
                        plays_to_reach: plays? plays : 0,
                        money_to_reach: money? money : 0,
                        name: name,
                        description: description,
                    });

                    setTimeout(() => {
                        selectInteraction.followUp({ ephemeral: true, components: [], embeds: [
                            new EmbedBuilder({
                                title: "Achievement criado com sucesso",
                                description: ` __**Seu novo achievement**__
                                - **Nome da Conquista**: ${name}
                                - **Descrição da Conquista**: ${description}
                                - **Tipo da Conquista**: ${type.charAt(0).toLocaleUpperCase() + type.slice(1).toLowerCase()}
                                - **Nível para alcançar**: ${level ? ` ${level}` : `Nenhum`}
                                - **Vezes jogadas para alcançar**: ${plays ? `${plays}` : `Nenhuma`}
                                - **Jogadas ganhas para alcançar**: ${wins ? `${wins}` : `Nenhuma`}

                                - **Emoji**: ${badge.value}
                                - **Nome do Emoji**: ${badge.emoji}
                                `,
                                author: {
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                }
                            }).setColor(config.colors.green as ColorResolvable)
                        ] });

                    }, 1000);
                    break;
                }
            }
        });
    },
});
