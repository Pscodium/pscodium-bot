import { ApplicationCommandType, ChannelType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "count",
    description: "Count of some server information",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction }) {
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
            description: `> ${guild.name}

            **Members**
            - Online: ${onlineMembers.size}
            - Offline/Busy: ${busyMembers.size}
            - Total: ${members.size}

            **Roles**
            - Assigned: ${inUseRoles.size}
            - Unassigned: ${unUseRoles.size}
            - Total: ${roles.size}

            **Channels**
            - Text: ${textChannels.size}
            - Voice: ${voiceChannels.size}
            `
        })
            .setColor(config.colors.blue as ColorResolvable)
            .setThumbnail(guild.iconURL());

        interaction.reply({ embeds: [embed] });
    }
});

