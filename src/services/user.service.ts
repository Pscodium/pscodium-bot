import { GuildMember } from "discord.js";
import { UserInstance } from "../models/tables/User";
import DefaultService from "./default.service";

class UserService extends DefaultService {

    async getUserByBankId(bankId: number | undefined): Promise<UserInstance | null | undefined> {
        const user = await this.db.User.findOne({
            where: {
                bankId: bankId
            }
        });
        if (!user) return;
        return user;
    }

    async createUser(member: GuildMember) {
        const userExists = await this.db.User.findOne({
            where: {
                id: member.user.id
            }
        });
        if (userExists) {
            return;
        }
        const permissions = await this.db.Permissions.create();
        const bank = await this.db.Bank.create();
        const game = await this.db.Game.create();
        const user = await this.db.User.create({
            id: member.user.id,
            bot: member.user.bot,
            username: member.user.username,
            discriminator: member.user.discriminator,
            userTag: member.user.tag,
        });
        await user.setGame(game);
        await user.setBank(bank);
        await bank.save();
        await game.save();

        await user.setPermission(permissions);
        await permissions.save();
        await permissions.setUser(user);
        await user.save();

    }
}

export const userService = new UserService();