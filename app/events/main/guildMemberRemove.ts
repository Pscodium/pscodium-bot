import { TextChannel } from "discord.js";
import { Event } from "../../structs/types/Event";
import guildsService from "../../services/guilds.service";

export default new Event({
    name: "guildMemberRemove",
    once: false,
    async run(member) {
        const user = member.user.username;
        console.log(user, " Saiu do server");

        try {
            const channelId = await guildsService.getGuildWelcomeChannelId(member.guild.id);
            if (!channelId) {
                return;
            }

            const channel = member.guild.channels.cache.get(
                channelId
            ) as TextChannel;

            if (channel) {
                channel.send(`${member} saiu do servidor. Sentiremos sua falta!`);
            } else {
                console.error(`Canal com ID ${channelId} não encontrado.`);
            }
        } catch (err) {
            console.log('[ERROR] - Error creating user');
        }
    }
});
