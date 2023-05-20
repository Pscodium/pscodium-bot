import { DataTypes, Model, Sequelize } from "sequelize";

interface TransactionAttributes {
    total?: number;
    balance: number;
    bank: number;
    id: number;
}

export interface TransactionInstance extends Model<TransactionAttributes>, TransactionAttributes {
    total: number;
}

export default function Bank(sequelize: Sequelize) {
    const Bank = sequelize.define<TransactionInstance>("bank", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        balance: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 0
        },
        bank: {
            type: DataTypes.DECIMAL(20, 2),
            defaultValue: 1000,
        },
    });
    return Bank;
}
