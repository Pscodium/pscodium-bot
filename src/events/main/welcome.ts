import { db } from '../../data-source';
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildMemberAdd",
    once: false,
    async run(interaction) {
        console.log("User enter in guild");
        const userExists = await db.User.findOne({
            where: {
                id: interaction.user.id
            }
        });

        if (userExists) {
            return;
        }

        db.User.create({
            id: interaction.user.id,
            bot: interaction.user.bot,
            username: interaction.user.username,
            discriminator: interaction.user.discriminator,
        });
    }
});
