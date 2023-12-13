import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Command";
import { databaseStructureCreator } from "../../utils/DatabaseStructureCreator";
import { permissionService } from "../../services/permissions.service";

export default new Command({
    name: "populate",
    description: "This command saves the information of a .json in the database.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    async run({interaction}) {

        const { guild } = interaction;
        const member = interaction.user;

        if (!member) return;
        if (!guild) return;

        const isOwner = await permissionService.isOwner(member.id);
        if (!isOwner) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        await databaseStructureCreator.populateCards();
        await databaseStructureCreator.populateBadges();
        await databaseStructureCreator.populateAchievements();

        interaction.reply({ content: `## Tabelas foram populadas`, ephemeral: true });

    },
});
