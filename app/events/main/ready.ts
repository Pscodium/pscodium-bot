import { client } from "../..";
import { JobService } from "../../services/jobs";
import { Event } from "../../structs/types/Event";
import { GlobalEventWsService } from "../../services/globalEventWs.service";

export default new Event({
    name: "ready",
    once: true,
    async run() {

        const { commands, buttons, selects, modals } = client;

        console.log("✅ Bot online".green);
        console.log(`Commands loaded: ${commands.size}`.cyan);
        console.log(`Buttons loaded: ${buttons.size}`.cyan);
        console.log(`Selects loaded: ${selects.size}`.cyan);
        console.log(`Modals loaded: ${modals.size}`.cyan);

        const jobService = new JobService();
        jobService.start(client);

        const globalEventWs = new GlobalEventWsService(client);
        await globalEventWs.start();
    }
});
