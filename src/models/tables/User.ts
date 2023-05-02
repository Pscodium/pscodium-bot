import { DataTypes, Sequelize } from "sequelize";

export default function User(sequelize: Sequelize) {
    const User = sequelize.define("user", {
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
        }
    });

    return User;
}

