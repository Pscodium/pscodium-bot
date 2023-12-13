import { GuildMember, User } from "discord.js";
import { UserInstance } from "../models/tables/User";
import jwt from 'jsonwebtoken';
import DefaultService from "./default.service";
import moment from "moment";

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

    async createSession(user: User): Promise<string | undefined> {
        const hasUser = await this.db.User.findOne({
            where: {
                id: user.id
            }
        });
        if (!hasUser) {
            return;
        }

        const sessionAlreadyExists = await this.db.Session.findOne({
            where: {
                userId: user.id
            }
        });
        if (sessionAlreadyExists) {
            const expiredSession = moment(sessionAlreadyExists.expiration_date).valueOf() < moment().valueOf();
            if (!expiredSession) {
                return sessionAlreadyExists.sessionId;
            }
            await this.db.Session.destroy({
                where: {
                    userId: user.id
                }
            });
        }

        const token = jwt.sign({ id: user.id }, String(process.env.JWT_SECRET_KEY), { expiresIn: '3d' });
        const session = await this.db.Session.create({
            expiration_date: moment().add(3, 'day').valueOf(),
            jwt: token
        });
        if (!session) return;
        await session.setUser(hasUser);
        await session.save();

        return session.sessionId;
    }
}

export const userService = new UserService();