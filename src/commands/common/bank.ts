import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { bankService } from "../../services/bank.service";

export default new Command({
    name: "bank",
    description: "Bank options",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "withdraw",
            description: "Withdraw money from your bank account",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "value",
                    description: "Value to withdraw",
                    type: ApplicationCommandOptionType.Number
                }
            ]
        },
        {
            name: "deposit",
            description: "Deposit money from your bank account",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "value",
                    description: "Value to withdraw",
                    type: ApplicationCommandOptionType.Number,
                }
            ]
        }
    ],
    async run({interaction, options}) {

        const member = interaction.member;

        if (!member) return;

        const user = await db.User.findByPk(member.user.id);
        if (!user) return;

        const bankId = user.getDataValue('bankId');

        const bank = await db.Bank.findByPk(bankId);

        if (!bank) return;
        const account = bank.bank;
        const wallet = bank.balance;

        const subCommand = options.getSubcommand();
        const value = options.getNumber('value');

        if (subCommand == "withdraw") {
            if (!value) {
                if (account == 0) {
                    interaction.reply({ content: `Você não possui créditos no banco para retirar`});
                    return;
                }

                await bankService.withdrawMoney(account, bankId);

                interaction.reply({ content: "`"+ bankService.formatedCash(account) +"` créditos foram retirados com sucesso."});
                return;
            }

            if (value > account) {
                interaction.reply({ content: `Você não possui ${bankService.formatedCash(value)} no banco para retirar`});
                return;
            }

            await bankService.withdrawMoney(value, bankId);

            interaction.reply({ content: "`"+ bankService.formatedCash(value) +"` créditos foram retirados com sucesso."});
        }
        else if (subCommand == "deposit") {
            if (!value) {
                if (wallet == 0) {
                    interaction.reply({ content: `Você não possui créditos na carteira para depositar`});
                    return;
                }

                await bankService.depositMoney(wallet, bankId);

                interaction.reply({ content: "`"+ bankService.formatedCash(wallet) +"` créditos foram depositados com sucesso."});
                return;
            }

            if (value > wallet) {
                interaction.reply({ content: `Você não possui créditos na carteira para depositar`});
                return;
            }

            await bankService.depositMoney(value, bankId);

            interaction.reply({ content: "`"+ bankService.formatedCash(value) +"` créditos foram depositados com sucesso."});
        }
    },
});
