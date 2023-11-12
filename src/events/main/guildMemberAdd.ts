import { userService } from '../../services/user.service';
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "guildMemberAdd",
    once: false,
    async run(member) {
        await userService.createUser(member);
    }
});
