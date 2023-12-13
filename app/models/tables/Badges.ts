import { DataTypes, Model, Sequelize } from "sequelize";

interface BadgesAttributes {
    emoji: string;
    value: string;
    id?: number;
}

export interface BadgesInstance extends Model<BadgesAttributes>, BadgesAttributes {}

export default function Badges(sequelize: Sequelize) {
    const Badges = sequelize.define<BadgesInstance>("badges", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        emoji: {
            type: DataTypes.STRING,
        },
        value: {
            type: DataTypes.STRING,
        },
    });
    return Badges;
}
