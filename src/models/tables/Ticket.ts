import { DataTypes, Model, Sequelize } from "sequelize";
import { UserInstance } from "./User";


export interface TicketAttributes {
    id?: number;
    question?: string;
    isClosed?: boolean;
    isMultiple?: boolean;
    isClaimed?: boolean;
    createdBy?: string;
    claimedBy?: string;
    closedBy?: string;
    channelId: string;
}

export interface TicketInstance extends Model<TicketAttributes>, TicketAttributes {
    addUser(ticket: UserInstance): unknown;
}

export default function Ticket(sequelize: Sequelize) {
    const ticket = sequelize.define<TicketInstance>("ticket", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        question: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        isClosed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isMultiple: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isClaimed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        channelId: {
            type: DataTypes.STRING,
            defaultValue: 0
        }
    });

    return ticket;
}
