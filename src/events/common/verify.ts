import { client, config } from "../..";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "messageReactionAdd",
    async run(interaction, user) {

        if (interaction.message.channelId !== config.important.verifyChannelId) return;

        const guild = client.guilds.cache.get(config.important.debbudyGuildId);

        if (!guild) return;

        const member = guild.members.cache.get(user.id);

        if (!member) return;

        if (interaction.emoji.name === "✅") {
            const role = guild.roles.cache.get(config.important.verifiedRoleId);
            const visitorRole = guild.roles.cache.get(config.important.visitorRoleId);

            if (!role) return;
            if (!visitorRole) return;

            member.roles
                .add(role)
                .then(() => {
                    console.log('Cargo adicionado com sucesso!');
                })
                .catch(error => {
                    console.error('Erro ao adicionar o cargo:', error);
                });

            member.roles
                .remove(visitorRole)
                .then(() => {
                    console.log('Cargo de visitor removido com sucesso!');
                })
                .catch(error => {
                    console.error('Erro ao remover o cargo:', error);
                });
        }
    }
});
