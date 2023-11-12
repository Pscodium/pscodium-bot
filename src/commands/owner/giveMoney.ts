import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { genericService } from "../../services/generic.service";
import { permissionService } from "../../services/permissions.service";

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

        const isOwner = await permissionService.isOwner(member.id);
        if (!isOwner) {
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

        if (!user) return;

        await db.Bank.update(
            {
                bank: db.sequelize.literal(`bank + ${amount}`)
            },
            {
                where: {
                    id: user.bankId
                }
            });

        interaction.reply({
            content: `${member} enviou para ${mention? mention : member} ${genericService.formatedCash(amount)} créditos!!`,
            ephemeral: visibility == undefined? false : visibility
        });
    },
});
