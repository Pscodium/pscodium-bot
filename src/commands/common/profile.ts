/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { client, config } from "../..";
import { Command } from "../../structs/types/Command";
import moment from "moment";
import { badgesManager } from "../../utils/BadgesManager";
import { textManipulator } from "../../utils/textManipulator/TextManipulators";

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

        const nickname = member?.user.username;

        const roles = member?.roles.cache;

        const rolesString2 = roles?.map(role => `**${role}**`).join(", ") || "Nenhuma";

        const embed = new EmbedBuilder()
            .setTitle(`${await textManipulator.capitalizedCase(mention? mention.username : interaction.user.username)}  ${await badgesManager.userVerifiedBadge(mention? mention.id : interaction.user.id)}`)
            .setAuthor({
                name: "Your profile",

                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setThumbnail(mention? mention.avatarURL() : interaction.user.avatarURL())
            .setDescription(`
            **Nickname:**
            ${await textManipulator.capitalizedCase(nickname)}

            **Account created ago:**
            ${now.diff(testeDATE, 'days')} dias

            **Time on this fucking server:**
            ${now.diff(joinedAt, 'days')} dias

            **Roles:**
            ${rolesString2}
            `)
            .setColor(config.colors.blue as ColorResolvable);

        interaction.reply({
            embeds: [embed]
        });
    },
});
