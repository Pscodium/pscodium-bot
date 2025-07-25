/* eslint-disable indent */
import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";
import { permissionService } from "../../services/permissions.service";


export default new Command({
    name: "manage",
    description: "The staff commands",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    options: [
        {
            name: "members",
            description: "Manage the guild members.",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "kick",
                    description: "Kick a mentioned user",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "member",
                            description: "Mention a user",
                            type: ApplicationCommandOptionType.User,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason for kick",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "ban",
                    description: "Ban a mentioned user",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "member",
                            description: "Mention a user",
                            type: ApplicationCommandOptionType.User,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason for ban",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "punish",
                    description: "Punish a mentioned user",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "member",
                            description: "Mention a user",
                            type: ApplicationCommandOptionType.User,
                            required: true
                        },
                        {
                            name: "minutes",
                            description: "how long will he be grounded",
                            type: ApplicationCommandOptionType.Integer,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason for punish",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
            ]
        },
        {
            name: "roles",
            description: "Manage server roles",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "create",
                    description: "Create a new role",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "name",
                            description: "Name of the role",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                }
            ]
        }
    ],
    async run({ interaction, options }) {

        const member = interaction.user;

        const isAdmin = await permissionService.isMasterAdmin(member.id);
        if (!isAdmin) {
            interaction.reply({
                content: "Você não tem permissões para utilizar esse comando",
                ephemeral: true
            });
            return;
        }

        const subCommandGroup = options.getSubcommandGroup();

        switch (subCommandGroup) {
            case "members": {
                const subCommand = options.getSubcommand();

                switch (subCommand) {
                    case "kick": {

                        const memberId = options.getUser('member')?.id;
                        if (!memberId) return;

                        const member = await interaction.guild?.members.fetch(memberId);
                        if (!member) return;

                        const reason = options.getString('reason');
                        if (!reason) {

                            const embed = new EmbedBuilder()
                                .setTitle(`User has been kicked from ${interaction.guild?.name}`)
                                .setDescription(`${member.user} left to the guild`)
                                .setColor(config.colors.turquoise as ColorResolvable)
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                })
                                .setFooter({
                                    text: "Admin Commands",
                                    iconURL: "https://emoji.discadia.com/emojis/f5216d82-7811-4786-ae5a-9e6b0ef0c4fd.png"
                                })
                                .setTimestamp()
                                .setThumbnail(member.user.avatarURL());

                            interaction.reply({ embeds: [embed.toJSON()] });
                            await member.kick();
                            return;
                        }

                        const embed = new EmbedBuilder()
                        .setTitle(`User has been kicked from ${interaction.guild?.name}`)
                        .setDescription(`${member.user} left to the guild`)
                        .setFields([
                            {
                                name: "Reason",
                                value: reason
                            }
                        ])
                        .setColor(config.colors.turquoise as ColorResolvable)
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.avatarURL() || undefined,
                        })
                        .setFooter({
                            text: "Admin Commands",
                            iconURL: "https://emoji.discadia.com/emojis/f5216d82-7811-4786-ae5a-9e6b0ef0c4fd.png"
                        })
                        .setTimestamp()
                        .setThumbnail(member.user.avatarURL());

                        interaction.reply({ embeds: [embed.toJSON()] });
                        await member.kick(reason);

                        break;
                    }
                    case "ban": {

                        const memberId = options.getUser('member')?.id;
                        if (!memberId) return;

                        const member = await interaction.guild?.members.fetch(memberId);
                        if (!member) return;

                        const reason = options.getString('reason');
                        if (!reason) {

                            const embed = new EmbedBuilder()
                                .setTitle(`User has been banned from ${interaction.guild?.name}`)
                                .setDescription(`${member.user} left to the guild forever`)
                                .setColor(config.colors.turquoise as ColorResolvable)
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                })
                                .setFooter({
                                    text: "Admin Commands",
                                    iconURL: "https://emoji.discadia.com/emojis/f5216d82-7811-4786-ae5a-9e6b0ef0c4fd.png"
                                })
                                .setTimestamp()
                                .setThumbnail(member.user.avatarURL());

                            interaction.reply({ embeds: [embed.toJSON()] });
                            await member.ban();
                            return;
                        }

                        const embed = new EmbedBuilder()
                        .setTitle(`User has been banned from ${interaction.guild?.name}`)
                        .setDescription(`${member.user} left to the guild forever`)
                        .setFields([
                            {
                                name: "Reason",
                                value: reason
                            }
                        ])
                        .setColor(config.colors.turquoise as ColorResolvable)
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.avatarURL() || undefined,
                        })
                        .setFooter({
                            text: "Admin Commands",
                            iconURL: "https://emoji.discadia.com/emojis/f5216d82-7811-4786-ae5a-9e6b0ef0c4fd.png"
                        })
                        .setTimestamp()
                        .setThumbnail(member.user.avatarURL());

                        interaction.reply({ embeds: [embed.toJSON()] });
                        await member.ban({ reason: reason });

                        break;
                    }
                    case "punish": {

                        const memberId = options.getUser('member')?.id;
                        if (!memberId) {
                            interaction.reply({ content: "Invalid member"});
                            return;
                        }

                        const member = await interaction.guild?.members.fetch(memberId);
                        if (!member) {
                            interaction.reply({ content: "Invalid member"});
                            return;
                        }

                        const timeout = options.getInteger('minutes');
                        if (!timeout) {
                            interaction.reply({ content: "Invalid timeout" });
                            return;
                        }

                        const reason = options.getString('reason');
                        if (!reason) {

                            const embed = new EmbedBuilder()
                                .setTitle(`User has been punished from ${interaction.guild?.name}`)
                                .setDescription(`${member.user} is grounded for ${timeout} minutes`)
                                .setColor(config.colors.turquoise as ColorResolvable)
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.avatarURL() || undefined,
                                })
                                .setFooter({
                                    text: "Admin Commands",
                                    iconURL: "https://emoji.discadia.com/emojis/f5216d82-7811-4786-ae5a-9e6b0ef0c4fd.png"
                                })
                                .setTimestamp()
                                .setThumbnail(member.user.avatarURL());

                            interaction.reply({ embeds: [embed.toJSON()] });
                            await member.timeout(minutesToMilliseconds(timeout));
                            return;
                        }

                        const embed = new EmbedBuilder()
                        .setTitle(`User has been punished from ${interaction.guild?.name}`)
                        .setDescription(`${member.user} is grounded for ${timeout} minutes`)
                        .setFields([
                            {
                                name: "Reason",
                                value: reason
                            }
                        ])
                        .setColor(config.colors.turquoise as ColorResolvable)
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.avatarURL() || undefined,
                        })
                        .setFooter({
                            text: "Admin Commands",
                            iconURL: "https://emoji.discadia.com/emojis/f5216d82-7811-4786-ae5a-9e6b0ef0c4fd.png"
                        })
                        .setTimestamp()
                        .setThumbnail(member.user.avatarURL());

                        interaction.reply({ embeds: [embed.toJSON()] });
                        await member.timeout(minutesToMilliseconds(timeout), reason);

                        break;
                    }
                }


                break;
            }
            case "roles": {

                break;
            }
        }
    }
});


function minutesToMilliseconds(minutes: number): number {
    const milliseconds_to_minutes = 1000 * 60;
    return minutes * milliseconds_to_minutes;
}
