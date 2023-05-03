import { ApplicationCommandType, ColorResolvable, EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";

export default new Command({
    name: "dice",
    description: "Create a test embed.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "amount",
            description: "Valor da aposta",
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    async run({ interaction, options }){

        const amount = options.getNumber("amount");

        const dados = Math.floor(Math.random() * 7);

        let result = "";

        if (dados == 6) {
            result = "ganhou";
        }
        else{
            result = "perdeu";
        }

        const embed = new EmbedBuilder()
            .setTitle("Dados")
            .setDescription(`${dados} :game_die: ${result}`)
            .setColor(config.colors.turquoise as ColorResolvable)
            .setTimestamp();

        await interaction.deferReply({ ephemeral: true });

        interaction.editReply({
            embeds: [embed]
        });

    }
});
