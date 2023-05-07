import { DataTypes, Model, Sequelize } from "sequelize";

interface EmojiAttributes {
    emoji: string;
    value: string;
    id?: number;
}

export interface EmojiInstance extends Model<EmojiAttributes>, EmojiAttributes {}

export default function Emoji(sequelize: Sequelize) {


    const Emoji = sequelize.define<EmojiInstance>("emoji", {
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
    return Emoji;
}
