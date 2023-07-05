import { DataTypes, Model, Sequelize } from "sequelize";
import { AchievementsInstance } from "./Achievements";
import { TransactionInstance } from "./Bank";
import { GamesInstance } from "./Games";
import { TicketInstance } from "./Ticket";

interface UsersAttributes {
    id: string;
    bot: boolean;
    username: string;
    discriminator: string;
    userTag: string;
    bankId?: number;
    gameId?: number;
}

export interface UserInstance extends Model<UsersAttributes>, UsersAttributes {
    addTicket(ticket: TicketInstance): unknown;
    getTickets(): Promise<TicketInstance[]>;
    getTicket(): Promise<TicketInstance>;
    getAchievements(): Promise<AchievementsInstance[]>;
    getAchievement(): Promise<AchievementsInstance>;
    addAchievement(achievement: AchievementsInstance): unknown;
    removeAchievement(achievement: AchievementsInstance): unknown;
    setGame(game: GamesInstance): unknown;
    setBank(bank: TransactionInstance): unknown;
    bank: TransactionInstance;
    game: GamesInstance;
    achievements: AchievementsInstance;
}

export default function User(sequelize: Sequelize) {
    const User = sequelize.define<UserInstance>("user", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        bot: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        username: {
            type: DataTypes.STRING,
        },
        discriminator: {
            type: DataTypes.INTEGER,
        },
        userTag: {
            type: DataTypes.STRING,
        }
    });

    return User;
}

