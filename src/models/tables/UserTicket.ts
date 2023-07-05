import { DataTypes, Model, Sequelize } from "sequelize";

export interface UserTicketAttributes {
    id?: number;
    userId?: string;
    ticketId?: number;
}

export interface UserTicketInstance extends Model<UserTicketAttributes>, UserTicketAttributes {}

export default function UserTicket(sequelize: Sequelize) {
    const userTicket = sequelize.define<UserTicketInstance>("users_tickets", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    });
    return userTicket;
}
