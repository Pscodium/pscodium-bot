import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";
import { databaseStructureCreator } from "../../utils/DatabaseStructureCreator";

export default new Command({
    name: "json-saver",
    description: "This command saves badges and achievements in json files.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    async run({interaction}) {

        const { guild } = interaction;
        const member = interaction.user;

        if (!member) return;
        if (!guild) return;

        if (member.id !== "439915811692609536") {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        await databaseStructureCreator.achievementsSaver();
        await databaseStructureCreator.badgesSaver();
        await databaseStructureCreator.cardsSaver();

        interaction.reply({ content: `## Arquivos JSON criados com sucesso`, ephemeral: true });

    },
});
