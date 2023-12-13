import { DataTypes, Model, Sequelize } from "sequelize";

interface GamesAttributes {
    id: number;
    level: number;
    experience: number;
    multiplicator: number;

    total_wins: number;
    total_losses: number;
    total_ratio: number;

    blackjack_wins: number;
    blackjack_losses: number;
    blackjack_ratio: number;

    dice_wins: number;
    dice_losses: number;
    dice_ratio: number;

    crash_wins: number;
    crash_losses: number;
    crash_ratio: number;
}

export interface GamesInstance extends Model<GamesAttributes>, GamesAttributes {}

export default function Game(sequelize: Sequelize) {
    const Game = sequelize.define<GamesInstance>("games", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        experience: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 0
        },
        multiplicator: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 1
        },
        total_wins: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_losses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_ratio: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 1
        },
        blackjack_wins: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        blackjack_losses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        blackjack_ratio: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 1
        },
        dice_wins: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        dice_losses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        dice_ratio: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 1
        },
        crash_wins: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        crash_losses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        crash_ratio: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 1
        }
    });
    return Game;
}
