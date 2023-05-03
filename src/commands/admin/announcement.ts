import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";



export default new Command({
    name: "announcement",
    description: "Bot announcement",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    options: [
        {
            name: "announcement",
            description: "Type your announcement",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "image",
            description: "Insert a embed image",
            type: ApplicationCommandOptionType.Attachment,
            required: false
        }
    ],
    async run({interaction, options}) {

        const message = options.getString('announcement');
        const image = options.getAttachment('image');

        if (!message) return;


        const embed = new EmbedBuilder()
            .setTitle("Anúncio do bot")
            .setDescription(message)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setColor(config.colors.blue as ColorResolvable)
            .setImage(image? image.url: null);

        interaction.reply({
            content: '@everyone',
            embeds: [embed]
        });
    },
});
