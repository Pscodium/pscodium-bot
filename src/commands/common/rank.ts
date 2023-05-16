import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db, sequelize } from "../../data-source";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "rank",
    description: "Rank of the best players in the world.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "type",
            description: "The type of the rank.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "money",
                    value: "1"
                },
                {
                    name: "ratio",
                    value: "2"
                }
            ]
        }
    ],
    async run({ interaction, client, options }) {

        const bot = client.user;
        if (!bot) return;

        const choice = options.getString('type');

        function formatedCash(amount: number | undefined) {
            if (amount) {
                let formated = parseFloat(String(amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                if (Number(formated) >= 100) {
                    formated = formated.replace(',', '.');
                }
                return formated;
            }
        }

        if (choice == "1") {
            const users = await db.User.findAll({
                limit: 10,
                include: [
                    {
                        model: db.Bank,
                        attributes: [
                            [sequelize.literal('bank + balance'), "total"]
                        ],
                        as: 'bank'
                    }
                ],
                order: [
                    [sequelize.literal('`bank.total`'), 'DESC'],
                ]
            });

            const rankList = users.map((user) => {
                return { total: formatedCash(user.bank.dataValues.total), userTag: user.userTag };
            });

            const embed = new EmbedBuilder({
                title: "Top 10 richest guys from the fucking world",
                author: {
                    name: interaction.user.username,
                    iconURL: interaction.user.avatarURL() || undefined,
                },
                description: `
                ***#1 ${rankList[0].userTag} 🥶***
                $${rankList[0].total}
                ***#2 ${rankList[1].userTag} 🥳***
                $${rankList[1].total}
                ***#3 ${rankList[2].userTag} 🥵***
                $${rankList[2].total}
                ***#4 ${rankList[3].userTag}***
                $${rankList[3].total}
                ***#5 ${rankList[4].userTag}***
                $${rankList[4].total}
                ***#6 ${rankList[5].userTag}***
                $${rankList[5].total}
                ***#7 ${rankList[6].userTag}***
                $${rankList[6].total}
                ***#8 ${rankList[7].userTag}***
                $${rankList[7].total}
                ***#9 ${rankList[8].userTag}***
                $${rankList[8].total}
                ***#10 ${rankList[9].userTag}***
                $${rankList[9].total}

                `,
                footer: {
                    text: bot.username,
                    iconURL: bot.avatarURL() || undefined,
                }
            }).setColor(config.colors.blue as ColorResolvable);

            interaction.reply({ embeds: [embed] });
            return;
        }
        if (choice == "2") {

            const users = await db.User.findAll({
                limit: 10,
                include: [
                    {
                        model: db.Game,
                        as: 'game'
                    }
                ],
                order: [
                    [sequelize.literal('`game.total_ratio`'), 'DESC'],
                ]
            });

            const rankList = users.map((user) => {
                return { ratio: user.game.dataValues.total_ratio, userTag: user.userTag };
            });

            const embed = new EmbedBuilder({
                title: "Top 10 players with best game ratio.",
                author: {
                    name: interaction.user.username,
                    iconURL: interaction.user.avatarURL() || undefined,
                },
                description: `
                ***#1 ${rankList[0].userTag} 🥶***
                ratio: ${rankList[0].ratio}
                ***#2 ${rankList[1].userTag} 🥳***
                ratio: ${rankList[1].ratio}
                ***#3 ${rankList[2].userTag} 🥵***
                ratio: ${rankList[2].ratio}
                ***#4 ${rankList[3].userTag}***
                ratio: ${rankList[3].ratio}
                ***#5 ${rankList[4].userTag}***
                ratio: ${rankList[4].ratio}
                ***#6 ${rankList[5].userTag}***
                ratio: ${rankList[5].ratio}
                ***#7 ${rankList[6].userTag}***
                ratio: ${rankList[6].ratio}
                ***#8 ${rankList[7].userTag}***
                ratio: ${rankList[7].ratio}
                ***#9 ${rankList[8].userTag}***
                ratio: ${rankList[8].ratio}
                ***#10 ${rankList[9].userTag}***
                ratio: ${rankList[9].ratio}

                `,
                footer: {
                    text: bot.username,
                    iconURL: bot.avatarURL() || undefined,
                }
            }).setColor(config.colors.blue as ColorResolvable);

            interaction.reply({ embeds: [embed] });
            return;
        }
    }
});
