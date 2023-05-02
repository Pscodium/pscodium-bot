import { db } from "../../data-source";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildMemberRemove",
    once: false,
    async run(interaction) {
        const userExists = await db.User.findOne({
            where: {
                id: interaction.user.id
            }
        });

        if (!userExists) {
            return;
        }
        db.User.destroy({
            where: {
                id: interaction.user.id
            }
        });
    }
});
