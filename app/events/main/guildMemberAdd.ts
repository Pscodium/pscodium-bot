import { TextChannel } from "discord.js";
import { userService } from "../../services/user.service";
import { Event } from "../../structs/types/Event";
import guildsService from "../../services/guilds.service";

export default new Event({
    name: "guildMemberAdd",
    once: false,
    async run(member) {
        try {
            await userService.createUser(member);
            const channelId = await guildsService.getGuildWelcomeChannelId(member.guild.id);
            if (!channelId) {
                return;
            }

            const channel = member.guild.channels.cache.get(
                channelId
            ) as TextChannel;

            if (channel) {
                channel.send(`Bem-vindo ao servidor, ${member}!`);
            } else {
                console.error(`Canal com ID ${channelId} não encontrado.`);
            }

        } catch (err) {
            console.log('[ERROR] - Error creating user')
        }
    },
});
