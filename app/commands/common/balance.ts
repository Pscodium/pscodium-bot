import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { genericService } from "../../services/generic.service";



export default new Command({
    name: "balance",
    description: "Get your bank account balance",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "member",
            description: "Get member bank account information",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    async run({interaction, options}) {

        const mention = options.getUser('member');

        const member = interaction.member;

        if (!member) return;

        const user = await db.User.findOne({
            where: {
                id: mention? mention.id : member.user.id
            },
            include: [
                { model: db.Bank }
            ]
        });

        if (!user) return;

        const userBank = user.bank;

        const account = userBank.bank;
        const wallet = userBank.balance;

        const embed = new EmbedBuilder()
            .setTitle("Bank Account")
            .setDescription(mention? `Geting ${mention} bank account profile`: "Getting your bank account profile")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setFields(
                {
                    name: "Bank",
                    value: `Value: ${genericService.formatedCash(account)}`
                },
                {
                    name: "Wallet",
                    value: `Value: ${genericService.formatedCash(wallet)}`
                }
            )
            .setColor(config.colors.blue as ColorResolvable);

        interaction.reply({
            embeds: [embed]
        });
    },
});
