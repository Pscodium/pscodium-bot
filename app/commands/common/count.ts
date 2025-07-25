import { ApplicationCommandType, ChannelType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "count",
    description: "Count of some server information",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction, t }) {
        if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
        const { guild } = interaction;

        const members = guild.members.cache;
        const onlineMembers = members.filter(m => m.presence?.status == "online");
        const busyMembers = members.difference(onlineMembers);

        const roles = guild.roles.cache;
        const inUseRoles = roles.filter(r => r.members?.size > 0);
        const unUseRoles = roles.difference(inUseRoles);

        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type == ChannelType.GuildText);
        const voiceChannels = channels.filter(c => c.type == ChannelType.GuildVoice);

        const embed = new EmbedBuilder({
            description: t.translate('COUNT_MESSAGE', {
                GuildName: guild.name,
                OnlineMembers: onlineMembers.size,
                OfflineMembers: busyMembers.size,
                TotalMembers: members.size,
                UsedRoles: inUseRoles.size,
                UnusedRoles: unUseRoles.size,
                TotalRoles: roles.size,
                TotalTextChannels: textChannels.size,
                TotalVoiceChannels: voiceChannels.size
            })
        })
            .setColor(config.colors.blue as ColorResolvable)
            .setThumbnail(guild.iconURL());

        interaction.reply({ embeds: [embed.toJSON()] });
    }
});

