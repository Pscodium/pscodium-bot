import { ApplicationCommandType} from "discord.js";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";



export default new Command({
    name: "refresh-database",
    description: "delete chat messages",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    async run({interaction}) {
        const { guild } = interaction;
        if (!guild) return;

        const membersCached = guild.members.cache;

        membersCached.map(async (member) => {
            const userExists = await db.User.findOne({
                where: {
                    id: interaction.user.id
                }
            });
            if (userExists) {
                return;
            }
            const bank = await db.Bank.create();
            await db.User.create({
                id: member.user.id,
                bot: member.user.bot,
                username: member.user.username,
                discriminator: member.user.discriminator,
                userTag: member.user.tag,
                bankId: bank.dataValues.id
            });
            bank.save();
        });



        await interaction.deferReply({ ephemeral: true });

        interaction.editReply({ content: `Foram adicionados ${membersCached.size} usuários no banco de dados`});

    },
});
