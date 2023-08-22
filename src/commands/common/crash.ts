import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { userBankManager } from "../../utils/UserBankManager";
import { userGameInteraction } from "../../utils/UserGameInteraction";
import { probabilitiesCreator } from "../../utils/ProbabilitiesCreator";

export default new Command({
    name: "crash",
    description: "Jogo Crash.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "multiplicador",
            description: "Digite o quanto você quer apostar",
            type: ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "aposta",
            description: "Digite o valor da aposta",
            type: ApplicationCommandOptionType.Number,
            required: false
        }
    ],
    async run({interaction, options}) {
        const { user } = interaction;

        const member = await db.User.findByPk(user.id);
        if (!member) return;

        const bankId = member.getDataValue('bankId');

        const bank = await db.Bank.findByPk(bankId);

        if (!bank) return;

        const wallet = bank.balance;

        const value = options.getNumber('multiplicador');
        const aposta = options.getNumber('aposta');
        if (!value) return;

        if (wallet === 0) {
            interaction.reply({ content: "Você deve ter dinheiro em sua carteira para jogar, vá no banco sacar `/bank withdraw`."});
            return;
        }

        if (aposta) {
            if (aposta > wallet || aposta == 0) {
                interaction.reply({ content: "Você deve ter dinheiro em sua carteira para jogar, vá no banco sacar `/bank withdraw`."});
                return;
            }
        }

        if (value <= 1) {
            interaction.reply({ content: "O Multiplicador deve ser maior que 1,00"});
            return;
        }

        const multi = probabilitiesCreator.getKindaHardProbabilities();

        if (Number(value) <= multi) {
            await userBankManager.crashUpdateBalanceWinner(aposta, bankId, Number(value));
            await userGameInteraction.crashWin(member.gameId);

            const embed = new EmbedBuilder({
                title: "Você ganhou!!",
                description: `Parabéns ${interaction.user}, você ganhou!!

                **Sua aposta**
                - Valor: ${aposta? userBankManager.formatedCash(aposta): userBankManager.formatedCash(wallet)}
                - Multiplicador: ${Number(value).toFixed(2)}

                **Crashou em**
                - Multiplicador: ${multi}

                **Lucro**
                - Valor: ${aposta? userBankManager.formatedCash(Number((aposta * Number(value)) - aposta).toFixed(2)) : userBankManager.formatedCash(Number((wallet * Number(value)) - wallet).toFixed(2))}

                `,
                author: {
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                }
            }).setColor(config.colors.green as ColorResolvable);

            interaction.reply({ embeds: [embed] });
        } else {
            await userBankManager.crashUpdateBalanceLoser(aposta, bankId);
            await userGameInteraction.crashLoss(member.gameId);

            const embed = new EmbedBuilder({
                title: "Você Perdeu!!",
                description: `Não foi dessa vez ${interaction.user}, você perdeu!!

                **Sua aposta**
                - Valor: ${aposta? userBankManager.formatedCash(aposta): userBankManager.formatedCash(wallet)}
                - Multiplicador: ${Number(value).toFixed(2)}

                **Crashou em**
                - Multiplicador: ${multi}

                **Perda**
                - Valor: ${aposta? `Você perdeu ${userBankManager.formatedCash(aposta)}`: "Você perdeu todo seu dinheiro da carteira!"}

                `,
                author: {
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                },
            }).setColor(config.colors.red as ColorResolvable);

            interaction.reply({ embeds: [embed] });
        }
    }
});
