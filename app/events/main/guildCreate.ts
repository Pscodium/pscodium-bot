import { userService } from "../../services/user.service";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildCreate",
    once: false,
    async run(guild) {
        const membersCached = guild.members.cache;

        console.log(`O bot foi adicionado no server ${guild.name}`);

        membersCached.map(async (member) => {
            await userService.createUser(member);
        });

        console.log(`Foram adicionados ${membersCached.size} usuários no banco de dados`);
    }
});
