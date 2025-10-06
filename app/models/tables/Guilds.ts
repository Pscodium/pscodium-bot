import { DataTypes, Model, Sequelize } from "sequelize";

interface GuildsAttributes {
    id?: string;
    welcome_channel_id?: string;
    name: string;
    ownerId: string;
    games_channel_id?: string;
    games_online_channel_id?: string;
    games_free_channel_id?: string;
    games_management_channel_id?: string;
}

export interface GuildsInstance extends Model<GuildsAttributes>, GuildsAttributes {}

export default function Guilds(sequelize: Sequelize) {
    const Guilds = sequelize.define<GuildsInstance>("guilds", {
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
        },
        games_channel_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        games_online_channel_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        games_free_channel_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        games_management_channel_id: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Guilds;
}
