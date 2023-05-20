import { DataTypes, Model, Sequelize } from "sequelize";

export enum AchievementTypes {
    LEVEL = 'level',
    WINS = 'wins',
    PLAYS = 'plays',
    MISSION = 'mission'
}

export interface AchievementsAttributes {
    emoji: string;
    emoji_value: string;
    id?: number;
    type: AchievementTypes;
    level_to_reach: number | null;
    plays_to_reach: number| null;
    wins_to_reach: number| null;
    description: string;
    name: string;
}

export interface AchievementsInstance extends Model<AchievementsAttributes>, AchievementsAttributes {}

export default function Achievements(sequelize: Sequelize) {
    const Achievements = sequelize.define<AchievementsInstance>("achievements", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        emoji: {
            type: DataTypes.STRING,
        },
        emoji_value: {
            type: DataTypes.STRING,
        },
        type: {
            type: DataTypes.ENUM<AchievementTypes>(...Object.values(AchievementTypes)),
            allowNull: true,
            defaultValue: AchievementTypes.LEVEL
        },
        level_to_reach: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        wins_to_reach: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        plays_to_reach: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        }
    });
    return Achievements;
}
