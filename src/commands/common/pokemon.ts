import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import axios from "axios";
import { Command } from "../../structs/types/Command";

interface Pokemon {
    name: string;
    url: string;
}

export default new Command({
    name: "pokemon",
    description: "Get a pokemón from PokeAPI.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "pokemon",
            description: "Digite o nome do pokemón",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    async run({ interaction, options }){

        const text = options.getString("pokemon", true);

        axios.get(`https://pokeapi.co/api/v2/pokemon/${text}`)
            .then(async response => {

                await interaction.deferReply({ ephemeral: true });

                interaction.editReply({
                    content: response.data.name + " " + response.data.sprites.front_default
                });
            })
            .catch(async error => {
                await interaction.deferReply({ ephemeral: true });

                interaction.editReply({
                    content: "Este pokemon não existe",
                });
            });
    }
});
