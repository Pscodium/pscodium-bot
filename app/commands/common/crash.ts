import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { gameService } from "../../services/games.service";

export default new Command({
    name: "crash",
    description: "Jogo Crash.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "multiplicador",
            description: "Digite o quanto você quer apostar",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "aposta",
            description: "Digite o valor da aposta",
            type: ApplicationCommandOptionType.Number,
            required: false
        }
    ],
    async run({ interaction, options }) {
        const { user } = interaction;

        const member = await db.User.findByPk(user.id);
        if (!member) return;

        const bankId = member.getDataValue('bankId');

        const bank = await db.Bank.findByPk(bankId);

        if (!bank) return;

        const wallet = bank.balance;

        const multiplicador = options.getString('multiplicador');
        const aposta = options.getNumber('aposta');
        if (!multiplicador) return;

        const value = parseFloat(multiplicador.replace(',', '.'));

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

        const multiplier = await gameService.getCrashGameMultiplicator();

        if (Number(value) <= multiplier) {
            await gameService.crashUpdateBalanceWinner(aposta, bankId, Number(value));
            await gameService.crashWin(member.gameId);

            const embed = new EmbedBuilder({
                title: "Você ganhou!!",
                description: `Parabéns ${interaction.user}, você ganhou!!

                **Sua aposta**
                - Valor: ${aposta? gameService.formatedCash(aposta): gameService.formatedCash(wallet)}
                - Multiplicador: ${Number(value).toFixed(2)}

                **Crashou em**
                - Multiplicador: ${multiplier}

                **Lucro**
                - Valor: ${aposta? gameService.formatedCash(Number((aposta * Number(value)) - aposta).toFixed(2)) : gameService.formatedCash(Number((wallet * Number(value)) - wallet).toFixed(2))}

                `,
                author: {
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                }
            }).setColor(config.colors.green as ColorResolvable);

            interaction.reply({ embeds: [embed.toJSON()] });
        } else {
            await gameService.crashUpdateBalanceLoser(aposta, bankId);
            await gameService.crashLoss(member.gameId);

            const embed = new EmbedBuilder({
                title: "Você Perdeu!!",
                description: `Não foi dessa vez ${interaction.user}, você perdeu!!

                **Sua aposta**
                - Valor: ${aposta? gameService.formatedCash(aposta): gameService.formatedCash(wallet)}
                - Multiplicador: ${Number(value).toFixed(2)}

                **Crashou em**
                - Multiplicador: ${multiplier}

                **Perda**
                - Valor: ${aposta? `Você perdeu ${gameService.formatedCash(aposta)}`: "Você perdeu todo seu dinheiro da carteira!"}

                `,
                author: {
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                },
            }).setColor(config.colors.red as ColorResolvable);

            interaction.reply({ embeds: [embed.toJSON()] });
        }
    }
});
