import { GuildMember, User } from "discord.js";
import { UserInstance } from "../models/tables/User";
import DefaultService from "./default.service";
import moment from "moment";
import { t } from "./translate.service";

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
            since: member.user.createdAt,
            language: "pt"
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
                userId: user.id,
                expiration_date: this.db.sequelize.literal('expiration_date > NOW()')
            }
        });
        if (sessionAlreadyExists) {
            await this.db.Session.destroy({
                where: {
                    sessionId: sessionAlreadyExists.sessionId
                }
            });
        }

        const session = await this.db.Session.create({
            expiration_date: moment().add(3, 'day').valueOf(),
        });
        if (!session) return;
        await session.setUser(hasUser);
        await session.save();

        return session.sessionId;
    }

    async getUser(userId: string): Promise<UserInstance | undefined | null> {
        try {
            const user = await this.db.User.findByPk(userId);
            
            return user;
        } catch (err) {
            console.error('[USER ERROR] - ', err);
        }
    }

    async getUserAndBankAccount(userId: string): Promise<UserInstance | undefined | null> {
        try {
            const user = await this.db.User.findOne({
                where: {
                    id: userId
                },
                include: [
                    { model: this.db.Bank }
                ]
            });
            
            return user;
        } catch (err) {
            console.error('[USER ERROR] - ', err);
        }
    }

    async localizateUser(userId: string) {
        const user = await this.db.User.findOne({
            where: { id: userId }
        });
        if (!user) return;
        t.setLocale(user.language);

        return true;
    }
}

export const userService = new UserService();