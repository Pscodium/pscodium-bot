import { db } from '../../data-source';
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildMemberAdd",
    once: false,
    async run(interaction) {
        const userExists = await db.User.findOne({
            where: {
                id: interaction.user.id
            }
        });

        if (userExists) {
            return;
        }
        const bank = await db.Bank.create();
        const game = await db.Game.create();
        const user = await db.User.create({
            id: interaction.user.id,
            bot: interaction.user.bot,
            username: interaction.user.username,
            discriminator: interaction.user.discriminator,
            userTag: interaction.user.tag
        });
        user.setBank(bank);
        user.setGame(game);
        bank.save();
        game.save();
    }
});
