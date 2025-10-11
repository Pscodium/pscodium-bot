import { DataTypes, Model, Sequelize } from "sequelize";
import { externalConfig } from "../../config/app.config";

interface GuildsAttributes {
    id?: string;
    welcome_channel_id?: string;
    name: string;
    ownerId: string;
}

export interface GuildsInstance extends Model<GuildsAttributes>, GuildsAttributes {}

export default function Guilds(sequelize: Sequelize) {
    const columnsList: Record<string, any> = {};

    Object.keys(externalConfig.jobs.game_queue_job).forEach((jobName) => {
        const job = externalConfig.jobs.game_queue_job[jobName] as unknown as { column_name: string };
        const column = {
            type: DataTypes.STRING,
            allowNull: true
        };
        columnsList[job.column_name] = column;
    });

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
        ...columnsList
    });
    return Guilds;
}
