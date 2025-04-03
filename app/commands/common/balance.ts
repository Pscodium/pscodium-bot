import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";
import { genericService } from "../../services/generic.service";
import { userService } from "../../services/user.service";



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
    async run({interaction, options, t}) {

        const mention = options.getUser('member');

        const member = interaction.member;

        if (!member) return;

        const user = await userService.getUserAndBankAccount(mention? mention.id : member.user.id);

        if (!user) return;

        const userBank = user.bank;

        const account = userBank.bank;
        const wallet = userBank.balance;

        const embed = new EmbedBuilder()
            .setTitle(t.translate("BALANCE_TITLE"))
            .setDescription(t.translate(mention? "BALANCE_MENTIONED_USER_DESCRIPTION" : "BALANCE_SINGLE_USER_DESCRIPTION", { UserName: mention }))
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setFields(
                {
                    name: t.translate('GENERIC_BANK'),
                    value: t.translate('BALANCE_FIELD_VALUE', {
                        FieldValue: genericService.formatedCash(account)
                    })
                },
                {
                    name: t.translate('GENERIC_WALLET'),
                    value: t.translate('BALANCE_FIELD_VALUE', {
                        FieldValue: genericService.formatedCash(wallet)
                    })
                }
            )
            .setColor(config.colors.blue as ColorResolvable);

        interaction.reply({
            embeds: [embed],
            allowedMentions: {
                parse: ['users']
            }
        });
    },
});
