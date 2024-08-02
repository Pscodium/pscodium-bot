import { Guild } from "discord.js";
import DefaultService from "./default.service";

class GuildsService extends DefaultService {
    async createGuild(guild: Guild) {
        await this.db.Guilds.create({
            name: guild.name,
            ownerId: guild.ownerId,
            id: guild.id
        })
    }

    async setGuildWelcomeChannel(channelId: string, guildId: string) {
        await this.db.Guilds.update({
            welcome_channel_id: channelId
        }, {
            where: {
                id: guildId
            }
        })
    }

    async getGuildWelcomeChannelId(id: string) {
        const guild = await this.db.Guilds.findOne({
            where: {
                id
            },
            attributes: ['welcome_channel_id']
        });
        if (!guild) {
            return null;
        }

        return guild?.welcome_channel_id;
    }
}

export default new GuildsService();