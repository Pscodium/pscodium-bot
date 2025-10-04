import { Guild } from "discord.js";
import DefaultService from "./default.service";

class GuildsService extends DefaultService {
    async createGuild(guild: Guild) {
        await this.db.Guilds.create({
            name: guild.name,
            ownerId: guild.ownerId,
            id: guild.id
        });
    }

    async setGuildWelcomeChannel(channelId: string, guildId: string) {
        await this.db.Guilds.update({
            welcome_channel_id: channelId
        }, {
            where: {
                id: guildId
            }
        });
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

    async getGameChannelByGuildIds(guildIds: string[]) {
        const guilds = await this.db.Guilds.findAll({
            where: {
                id: guildIds
            },
            attributes: ['games_channel_id']
        });
        if (!guilds) {
            return [];
        }

        const channelIds = guilds
            .filter((guild) => guild.games_channel_id !== null && guild.games_channel_id !== undefined)
            .map((guild) => guild.games_channel_id as string);

        return channelIds;
    }

    async getOnlineGameChannelByGuildIds(guildIds: string[]): Promise<string[]> {
        const guilds = await this.db.Guilds.findAll({
            where: {
                id: guildIds
            },
            attributes: ['games_online_channel_id']
        });

        if (!guilds) {
            return [];
        }

        const channelIds = guilds
            .filter((guild) => guild.games_online_channel_id !== null && guild.games_online_channel_id !== undefined)
            .map((guild) => guild.games_online_channel_id as string);

        return channelIds;
    }
}

export default new GuildsService();