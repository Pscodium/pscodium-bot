import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { db, sequelize } from "../../data-source";
import { Command } from "../../structs/types/Command";



export default new Command({
    name: "give-money",
    description: "Owner command to give money for an user",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "amount",
            description: "Amount to give",
            type: ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "member",
            description: "Get member bank account information",
            type: ApplicationCommandOptionType.User,
            required: false
        },
        {
            name: "visibility",
            description: "Visibility from this message",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        }
    ],
    async run({interaction, options}) {

        const mention = options.getUser('member');
        const amount = options.getNumber('amount');
        const visibility = options.getBoolean('visibility');

        const member = interaction.user;

        if (!member) return;
        if (!amount) return;

        if (member.id !== "439915811692609536") {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        const user = await db.User.findOne({
            where: {
                id: mention? mention.id : member.id
            },
            include: [
                { model: db.Bank }
            ]
        });

        function formatedCash(amount: number) {
            let formated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            if(Number(formated) >= 100) {
                formated = formated.replace(',', '.');
            }
            return formated;
        }

        if (!user) return;

        await db.Bank.update(
            {
                bank: sequelize.literal(`bank + ${amount}`)
            },
            {
                where: {
                    id: user.bankId
                }
            });

        interaction.reply({
            content: `${member} enviou para ${mention? mention : member} ${formatedCash(amount)} créditos!!`,
            ephemeral: visibility == undefined? false : visibility
        });
    },
});
