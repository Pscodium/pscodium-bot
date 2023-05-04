import { ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db, sequelize } from "../../data-source";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "rank",
    description: "Rank of the best players in the world.",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction, client }) {

        const bot = client.user;
        if(!bot) return;

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

        function formatedCash(amount: number | undefined) {
            if (amount) {
                let formated = parseFloat(String(amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                if (Number(formated) >= 100) {
                    formated = formated.replace(',', '.');
                }
                return formated;
            }
        }

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
    }
});
