import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";



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
        const account = parseFloat(String(bank.bank));
        const wallet = parseFloat(String(bank.balance));

        const subCommand = options.getSubcommand();
        const value = options.getNumber('value');

        function formatedCash(amount: number) {
            let formated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            if(Number(formated) >= 100) {
                formated = formated.replace(',', '.');
            }
            return formated;
        }

        if (subCommand == "withdraw") {

            if (!value) {

                if (account == 0) {
                    interaction.reply({ content: `Você não possui créditos no banco para retirar`});
                    return;
                }

                await db.Bank.update({
                    bank: 0,
                    balance: wallet + account
                }, {
                    where: { id: bankId }
                });

                interaction.reply({ content: "`"+ formatedCash(account) +"` créditos foram retirados com sucesso."});
                return;
            }

            if (value > account) {
                interaction.reply({ content: `Você não possui ${formatedCash(value)} no banco para retirar`});
                return;
            }

            await db.Bank.update({
                bank: account - value,
                balance: wallet + value
            }, {
                where: { id: bankId }
            });
            interaction.reply({ content: "`"+ formatedCash(value) +"` créditos foram retirados com sucesso."});
        }
        else if (subCommand == "deposit") {
            if (!value) {

                if (wallet == 0) {
                    interaction.reply({ content: `Você não possui créditos na carteira para depositar`});
                    return;
                }

                await db.Bank.update({
                    bank: account + wallet,
                    balance: 0
                }, {
                    where: { id: bankId }
                });

                interaction.reply({ content: "`"+ formatedCash(wallet) +"` créditos foram depositados com sucesso."});
                return;
            }

            if (value > wallet) {
                interaction.reply({ content: `Você não possui créditos na carteira para depositar`});
                return;
            }

            await db.Bank.update({
                bank: account + value,
                balance: wallet - value
            }, {
                where: { id: bankId }
            });
            interaction.reply({ content: "`"+ formatedCash(value) +"` créditos foram depositados com sucesso."});
        }
    },
});
