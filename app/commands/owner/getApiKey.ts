/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Command";
import { config } from "../..";
import { permissionService } from "../../services/permissions.service";
import { userService } from "../../services/user.service";


export default new Command({
    name: "apikey",
    description: "Gerar uma apikey para autenticar na api do bot.",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction }) {

        const member = interaction.user;

        const isOwner = await permissionService.isOwner(member.id);
        if (!isOwner) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }
        const apiKey = await userService.createSession(member);

        interaction.reply({
            content: `Parabéns, você gerou sua api key\n\n||${apiKey}||`,
            ephemeral: true
        });
    }
});
