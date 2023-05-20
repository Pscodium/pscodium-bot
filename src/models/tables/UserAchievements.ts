import { DataTypes, Model, Sequelize } from "sequelize";

export interface UserAchievementsAttributes {
    id?: number;
}

export interface UserAchievementsInstance extends Model<UserAchievementsAttributes>, UserAchievementsAttributes {}

export default function UserAchievements(sequelize: Sequelize) {
    const UserAchievements = sequelize.define<UserAchievementsInstance>("user_achievements", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    });
    return UserAchievements;
}
