import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildMemberRemove",
    once: false,
    async run(interaction) {
        const member = interaction.user.username;
        console.log(member, " Saiu do server");
    }
});
