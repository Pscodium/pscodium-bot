import { Event } from "../../structs/types/Event";

export default new Event({
    name: "interactionCreate",
    once: true,
    run(interaction) {
        if (interaction.isCommand() || interaction.isUserContextMenuCommand()){
            console.log(`\nInteraction Listener`.yellow,`\nCommand: ${interaction.commandName} \nAuthor: ${interaction.user.tag}\nAuthor Id: ${interaction.user.id}`.magenta);
        }
    }
});
