import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { client, config } from "../..";
import { Command } from "../../structs/types/Command";
import moment from "moment";


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

        const rolesString2 = roles?.map(role => `**${role.name}**`).join(", ") || "Nenhuma";

        const embed = new EmbedBuilder()
            .setTitle(`Profile of ${mention? mention.tag : interaction.user.tag}`)
            .setAuthor({
                name: interaction.user.username,

                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setThumbnail(mention? mention.avatarURL() : interaction.user.avatarURL())
            .setFields(
                {
                    name: "Nickname:",
                    value: `${nickname}`
                },
                {
                    name: "Account created ago:",
                    value: `${now.diff(testeDATE, 'days')} dias`
                },
                {
                    name: "Time on this fucking server:",
                    value: `${now.diff(joinedAt, 'days')} dias`
                },
                {
                    name: "Roles:",
                    value: `${rolesString2}`
                }
            )
            .setColor(config.colors.blue as ColorResolvable);

        interaction.reply({
            embeds: [embed]
        });
    },
});
