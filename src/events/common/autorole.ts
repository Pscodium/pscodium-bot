import { config } from "../..";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildMemberAdd",
    async run(member) {
        const role = member.guild.roles.cache.find(role => role.id === config.important.visitorRoleId);
        if (role) {
            try {
                await member.roles.add(role);
                console.log(`Autorole atribuído para ${member.user.tag}`);
            } catch (error) {
                console.error(`Erro ao atribuir autorole para ${member.user.tag}:`, error);
            }
        }
    },
});
