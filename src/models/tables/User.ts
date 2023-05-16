import { DataTypes, Model, Sequelize } from "sequelize";
import { TransactionInstance } from "./Bank";
import { GamesInstance } from "./Games";

interface UsersAttributes {
    id: string;
    bot: boolean;
    username: string;
    discriminator: string;
    userTag: string;
    bankId?: number;
    gameId?: number;
}

interface UserIntance extends Model<UsersAttributes>, UsersAttributes {
    setGame(game: GamesInstance): unknown;
    setBank(bank: TransactionInstance): unknown;
    bank: TransactionInstance;
    game: GamesInstance;
}

export default function User(sequelize: Sequelize) {
    const User = sequelize.define<UserIntance>("user", {
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

