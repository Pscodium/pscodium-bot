import { DataTypes, Model, Sequelize, UUIDV4 } from "sequelize";

interface CrashAttributes {
    id?: string;
    possibleGames: number[];
    selectedPlay: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CrashInstance extends Model<CrashAttributes>, CrashAttributes {}

export default function Crash(sequelize: Sequelize) {
    const Crash = sequelize.define<CrashInstance>("crash", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: UUIDV4
        },
        possibleGames: {
            type: DataTypes.JSON,
            allowNull: false,
            field: "possible_games"
        },
        selectedPlay: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            field: "selected_play"
        }
    });
    return Crash;
}
