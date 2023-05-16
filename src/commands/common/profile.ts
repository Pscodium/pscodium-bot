import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { client, config } from "../..";
import { Command } from "../../structs/types/Command";
import moment from "moment";
import { db } from "../../data-source";


export default new Command({
    name: "profile",
    description: "Get profile informations",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "menciona um truta aí",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    async run({interaction, options}) {

        const mention = options.getUser("user");

        const now = moment(new Date());

        const testeDATE = moment(mention? mention.createdAt : interaction.user.createdAt);

        if (!interaction.guild) return;

        const guild = client.guilds.cache.get(interaction.guild.id);
        const member = guild?.members.cache.get(mention? mention.id : interaction.user.id);

        const joinedAt = member?.joinedAt;

        const nickname = member?.nickname;

        const roles = member?.roles.cache;

        const user = await db.User.findOne({ where: { id: mention? mention.id : interaction.user.id }, include: [ {model: db.Game } ]});
        if (!user) return;

        const gameProfile = user.game;
        if (!gameProfile) return;

        const rolesString2 = roles?.map(role => `**${role.name}**`).join(", ") || "Nenhuma";

        const embed = new EmbedBuilder()
            .setTitle(`Profile of ${mention? mention.username : interaction.user.username}`)
            .setAuthor({
                name: interaction.user.username,

                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setThumbnail(mention? mention.avatarURL() : interaction.user.avatarURL())
            .setDescription(`
            **Nickname:**
            ${nickname}

            **Account created ago:**
            ${now.diff(testeDATE, 'days')} dias

            **Time on this fucking server:**
            ${now.diff(joinedAt, 'days')} dias

            **Roles:**
            ${rolesString2}


            __**Game Profile**__

            `)
            .setFields(
                {
                    name: "Blackjack Wins",
                    value: String(gameProfile.blackjack_wins),
                    inline: true
                },
                {
                    name: "Blackjack Losses",
                    value: String(gameProfile.blackjack_losses),
                    inline: true
                },
                {
                    name: "Ratio",
                    value: String(gameProfile.blackjack_ratio),
                    inline: true
                },
                {
                    name: "Crash Wins",
                    value: String(gameProfile.crash_wins),
                    inline: true
                },
                {
                    name: "Crash Losses",
                    value: String(gameProfile.crash_losses),
                    inline: true
                },
                {
                    name: "Ratio",
                    value: String(gameProfile.crash_ratio),
                    inline: true
                },
                {
                    name: "Total Wins",
                    value: String(gameProfile.total_wins),
                    inline: true
                },
                {
                    name: "Total Losses",
                    value: String(gameProfile.total_losses),
                    inline: true
                },
                {
                    name: "Ratio",
                    value: String(gameProfile.total_ratio),
                    inline: true
                }
            )
            .setColor(config.colors.blue as ColorResolvable);

        interaction.reply({
            embeds: [embed]
        });
    },
});
