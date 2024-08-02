import { DataTypes, Model, Sequelize } from "sequelize";

interface CardsAttributes {
    id?: string;
    welcome_channel_id?: string;
    name: string;
    ownerId: string;
}

export interface CardsInstance extends Model<CardsAttributes>, CardsAttributes {}

export default function Cards(sequelize: Sequelize) {
    const Guilds = sequelize.define<CardsInstance>("guilds", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        welcome_channel_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING
        },
        ownerId: {
            type: DataTypes.STRING
        }
    });
    return Guilds;
}
