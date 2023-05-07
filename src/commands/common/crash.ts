import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";

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

        const wallet = parseFloat(String(bank.balance));

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

        function randomWithProbabilities(probs: any[]) {
            const totalProb = probs.reduce((acc: any, prob: any) => acc + prob, 0);
            const rand = Math.random() * totalProb;
            let cumulativeProb = 0;
            for (let i = 0; i < probs.length; i++) {
                cumulativeProb += probs[i];
                if (rand < cumulativeProb) {
                    return i;
                }
            }
        }

        // default probability is [0.1, 0.3, 0.6]
        // the sum of the 3 numbers must be equal to 1
        const probabilities = [0.03, 0.1, 0.87];

        const randomInt = randomWithProbabilities(probabilities);

        let multi = 0;
        let randomFloat: number;

        if (randomInt === 0) {
            multi = Math.floor(Math.random() * ( 100 - 8 + 1)) + 5;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }
        else if (randomInt === 1) {
            multi = Math.floor(Math.random() * ( 6 - 1.54 + 1)) + 1.54;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }
        else if (randomInt === 2) {
            multi = Math.floor(Math.random() * ( 1.54 - 1 + 1)) + 1;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }

        function formatedCash(amount: number | string) {
            if (typeof amount != 'number') {
                amount = Number(amount);
            }
            let formated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            if(Number(formated) >= 100) {
                formated = formated.replace(',', '.');
            }
            return formated;
        }

        if (Number(value) <= multi) {
            await db.Bank.update({
                balance: aposta? wallet + ((aposta * Number(value)) - aposta) : wallet * Number(value)
            }, {
                where: { id: bankId }
            });

            const embed = new EmbedBuilder({
                title: "Você ganhou!!",
                description: `Parabéns ${interaction.user}, você ganhou!!

                **Sua aposta**
                - Valor: ${aposta? formatedCash(aposta): formatedCash(wallet)}
                - Multiplicador: ${Number(value).toFixed(2)}

                **Crashou em**
                - Multiplicador: ${multi}

                **Lucro**
                - Valor: ${aposta? formatedCash(Number((aposta * Number(value)) - aposta).toFixed(2)) : formatedCash(Number((wallet * Number(value)) - wallet).toFixed(2))}

                `,
                author: {
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                }
            }).setColor(config.colors.green as ColorResolvable);

            interaction.reply({ embeds: [embed] });
        } else {
            await db.Bank.update({
                balance: aposta? wallet - aposta : 0
            }, {
                where: { id: bankId }
            });

            const embed = new EmbedBuilder({
                title: "Você Perdeu!!",
                description: `Não foi dessa vez ${interaction.user}, você perdeu!!

                **Sua aposta**
                - Valor: ${aposta? formatedCash(aposta): formatedCash(wallet)}
                - Multiplicador: ${Number(value).toFixed(2)}

                **Crashou em**
                - Multiplicador: ${multi}

                **Perda**
                - Valor: ${aposta? `Você perdeu ${formatedCash(aposta)}`: "Você perdeu todo seu dinheiro da carteira!"}

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