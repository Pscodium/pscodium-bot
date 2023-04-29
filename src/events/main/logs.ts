import { Event } from "../../structs/types/Event";

export default new Event({
    name: "interactionCreate",
    once: true,
    run(interaction) {
        console.log(`\nInteraction Listener`.yellow,`\nCommand: ${interaction} \nAuthor: ${interaction.user.tag}\nAuthor Id: ${interaction.user.id}`.magenta);
    }
});
