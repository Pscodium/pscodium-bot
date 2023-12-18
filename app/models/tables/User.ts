import { DataTypes, Model, Sequelize } from "sequelize";
import { AchievementsInstance } from "./Achievements";
import { TransactionInstance } from "./Bank";
import { GamesInstance } from "./Games";
import { TicketInstance } from "./Ticket";
import { PermissionsInstance } from "./Permissions";
import { Options } from "../../data-source";
import { SessionAttributes } from "./Session";

interface UsersAttributes {
    id: string;
    bot: boolean;
    username: string;
    discriminator: string;
    userTag: string;
    bankId?: number;
    gameId?: number;
    permissionId?: number;
    since: Date;
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
    setPermission(permission: PermissionsInstance): unknown;
    setBank(bank: TransactionInstance): unknown;
    bank: TransactionInstance;
    game: GamesInstance;
    achievements: AchievementsInstance;
    permission: PermissionsInstance;
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
        },
        since: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        associate: function (models: Record<string, any>) {
            User.belongsTo(models.Bank, {
                foreignKey: "bankId",
                constraints: true
            });
            User.belongsTo(models.Game, {
                foreignKey: "gameId",
                constraints: true
            });
            User.belongsToMany(models.Achievement, { through: models.UserAchievements, foreignKey: 'userId'});
            User.belongsToMany(models.Ticket, { through: models.UserTicket, foreignKey: "userId" });
            User.belongsTo(models.Permissions, { foreignKey: "permissionId", constraints: true });
        }
    } as Options);

    return User;
}

