import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../..";
import { Event } from "../../structs/types/Event";
import { t } from "../../services/translate.service";
import { userService } from "../../services/user.service";

export default new Event({
    name: "interactionCreate",
    async run(interaction) {
        if (!interaction.isCommand()) return;
        await userService.localizateUser(interaction.user.id);

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (!interaction.isChatInputCommand()) return;
        const options = interaction.options as CommandInteractionOptionResolver;

        command.run({ client, interaction, options, t });
    },
});
