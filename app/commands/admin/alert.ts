import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { Command } from "../../structs/types/Command";
import { permissionService } from "../../services/permissions.service";


export default new Command({
    name: "alert",
    description: "Alert the dumb people.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [
        "Administrator"
    ],
    options: [
        {
            name: "user",
            description: "Mention the dumb people",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "alert",
            description: "Type your alert",
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

        const message = options.getString('alert');
        const image = options.getAttachment('image');
        const mention = options.getUser('user');

        if (!message) return;
        if (!mention) return;


        const embed = new EmbedBuilder()
            .setTitle("Alerta do bot")
            .setDescription(message)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setColor(config.colors.blue as ColorResolvable)
            .setImage(image? image.url: null);


        try {
            mention.send({ embeds: [embed.toJSON()] })
                .then( () => {
                    interaction.reply({ content: "O usuário recebeu sua mensagem", ephemeral: true, embeds: [embed.toJSON()] });
                })
                .catch( () => {
                    interaction.reply({ content: "Não foi possível enviar a mensagem", ephemeral: true });
                });
        } catch (e) {
            interaction.reply({ content: "Não foi possível enviar a mensagem", ephemeral: true });
        }
    }
});
