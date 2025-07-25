import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";


export default new Command({
    name: "avatar",
    description: "Get avatar icon.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "get avatar from mentioned user",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    async run({ interaction, options, t }){

        const mention = options.getUser('user');

        const member = interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(t.translate('AVATAR_COMMAND_EMBED_TITLE', { MentionedUser: mention? mention?.username : interaction.user.username }))
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setColor(config.colors.blue as ColorResolvable)
            .setImage(mention? mention.avatarURL({size: 1024}) : member.avatarURL({size: 1024}));

        await interaction.deferReply({ ephemeral: false });

        interaction.editReply({
            embeds: [embed.toJSON()]
        });

    }
});
