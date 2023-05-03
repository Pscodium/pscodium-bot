import { DataTypes, Model, Sequelize } from "sequelize";
import { TransactionInstance } from "./Bank";

interface UsersAttributes {
    id: string;
    bot: boolean;
    username: string;
    discriminator: string;
    userTag: string;
    bankId?: number;
}

interface UserIntance extends Model<UsersAttributes>, UsersAttributes {
    bank: TransactionInstance;
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

