import guildsService from "../../services/guilds.service";
import { userService } from "../../services/user.service";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildCreate",
    once: false,
    async run(guild) {
        const membersCached = guild.members.cache;

        console.log(`O bot foi adicionado no server ${guild.name}`);

        try {
            await guildsService.createGuild(guild);

            // TODO: Change this function to bulk creation of users, don't forget to add this function on services and maybe api
            membersCached.map(async (member) => {
                await userService.createUser(member);
            });
        } catch (err) {
            console.log('[ERROR] - Error on create guild and users information: '+ err);
        }



        console.log(`Foram adicionados ${membersCached.size} usuários no banco de dados`);
    }
});
