import { DataTypes, Model, Sequelize } from "sequelize";

interface EmojiAttributes {
    emoji: string;
    value: string;
}

interface BlackjackAttributes {
    id?: number;
    bet?: number;
    userId?: string;

    firstPlayerCard: EmojiAttributes;
    secondPlayerCard: EmojiAttributes;
    thirdPlayerCard: EmojiAttributes;
    fourthPlayerCard: EmojiAttributes;
    fifthPlayerCard: EmojiAttributes;

    userPlay: number;
    secondUserPlay: number;
    thirdUserPlay: number;
    fourthUserPlay: number;

    firstDealerCard: EmojiAttributes;
    secondDealerCard: EmojiAttributes;
    thirdDealerCard: EmojiAttributes;
    fourthDealerCard: EmojiAttributes;
    fifthDealerCard: EmojiAttributes;

    dealerPlay: number;
    secondDealerPlay: number;
    thirdDealerPlay: number;
    fourthDealerPlay: number;
}

export interface BlackjackInstance extends Model<BlackjackAttributes>, BlackjackAttributes {}

export default function Bank(sequelize: Sequelize) {


    const Bank = sequelize.define<BlackjackInstance>("blackjack", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bet: {
            type: DataTypes.DECIMAL(20, 2)
        },
        userPlay: {
            type: DataTypes.INTEGER
        },
        secondUserPlay: {
            type: DataTypes.INTEGER
        },
        thirdUserPlay: {
            type: DataTypes.INTEGER
        },
        fourthUserPlay: {
            type: DataTypes.INTEGER
        },
        firstPlayerCard: {
            type: DataTypes.JSON
        },
        secondPlayerCard: {
            type: DataTypes.JSON
        },
        thirdPlayerCard: {
            type: DataTypes.JSON
        },
        fourthPlayerCard: {
            type: DataTypes.JSON
        },
        fifthPlayerCard: {
            type: DataTypes.JSON
        },
        dealerPlay: {
            type: DataTypes.INTEGER
        },
        secondDealerPlay: {
            type: DataTypes.INTEGER
        },
        thirdDealerPlay: {
            type: DataTypes.INTEGER
        },
        fourthDealerPlay: {
            type: DataTypes.INTEGER
        },
        firstDealerCard: {
            type: DataTypes.JSON
        },
        secondDealerCard: {
            type: DataTypes.JSON
        },
        thirdDealerCard: {
            type: DataTypes.JSON
        },
        fourthDealerCard: {
            type: DataTypes.JSON
        },
        fifthDealerCard: {
            type: DataTypes.JSON
        },
    });
    return Bank;
}
