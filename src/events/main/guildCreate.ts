import { db } from "../../data-source";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildCreate",
    once: false,
    async run(guild) {
        const membersCached = guild.members.cache;

        console.log(`O bot foi adicionado no server ${guild.name}`);

        membersCached.map(async (member) => {
            const userExists = await db.User.findOne({
                where: {
                    id: member.user.id
                }
            });
            if (userExists) {
                return;
            }
            const bank = await db.Bank.create();
            const game = await db.Game.create();
            const user = await db.User.create({
                id: member.user.id,
                bot: member.user.bot,
                username: member.user.username,
                discriminator: member.user.discriminator,
                userTag: member.user.tag,
            });
            user.setGame(game);
            user.setBank(bank);
            bank.save();
            game.save();
        });

        console.log(`Foram adicionados ${membersCached.size} usuários no banco de dados`);
    }
});
