import { DataTypes, Model, Sequelize } from "sequelize";

interface CardsAttributes {
    emoji: string;
    value: string;
    id?: number;
}

export interface CardsInstance extends Model<CardsAttributes>, CardsAttributes {}

export default function Cards(sequelize: Sequelize) {
    const Cards = sequelize.define<CardsInstance>("cards", {
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
    return Cards;
}
