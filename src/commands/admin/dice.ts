import { ApplicationCommandType, ColorResolvable, EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";
import { db, sequelize } from "../../data-source";

export default new Command({
    name: "dice",
    description: "Create a test embed.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "amount",
            description: "Valor da aposta",
            type: ApplicationCommandOptionType.Number,
            required: false
        }
    ],
    async run({ interaction, options }){

        const aposta = options.getNumber("amount");

        const { user } = interaction;

        const member = await db.User.findByPk(user.id);
        if (!member) return;

        const bankId = member.getDataValue('bankId');

        const bank = await db.Bank.findByPk(bankId);

        if (!bank) return;

        const wallet = parseFloat(String(bank.balance));

        if (aposta) {
            if (aposta > wallet || aposta == 0) {
                interaction.reply({ content: "Você deve ter dinheiro em sua carteira para jogar, vá no banco sacar `/bank withdraw`."});
                return;
            }
        }

        if (wallet ==  0){
            interaction.reply({ content: "Você deve ter dinheiro em sua carteira para jogar, vá no banco sacar `/bank withdraw`."});
            return;
        }

        const dados = Math.floor(Math.random() * 7);

        function formatedCash(amount: number) {
            let formated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            if(Number(formated) >= 100) {
                formated = formated.replace(',', '.');
            }
            return formated;
        }

        if (dados == 6) {
            db.Bank.update({
                balance: aposta? sequelize.literal(`balance + ${aposta*2}`): sequelize.literal(`balance + balance`)
            },{
                where: {
                    id: bankId
                }
            });


            const embed = new EmbedBuilder({
                title: "Você ganhou!!",
                description: `Parabéns ${interaction.user}, você ganhou!!

                **${dados} :game_die:**

                **Sua aposta**
                - Valor: ${aposta? formatedCash(aposta): formatedCash(wallet)}

                **Lucro**
                - Valor: ${aposta? formatedCash(Number((aposta * 2) - aposta)) : formatedCash(Number((wallet * 2) - wallet))}

                `,
                author: {
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                }
            }).setColor(config.colors.green as ColorResolvable);

            interaction.reply({ embeds: [embed] });
        }
        else{
            db.Bank.update({
                balance: aposta? sequelize.literal(`balance - ${aposta}`): 0
            },{
                where: {
                    id: bankId
                }
            });

            const embed = new EmbedBuilder({
                title: "Você Perdeu!!",
                description: `Não foi dessa vez ${interaction.user}, você perdeu!!

                    **${dados} :game_die:**

                    **Sua aposta**
                    - Valor: ${aposta? formatedCash(aposta): formatedCash(wallet)}

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
