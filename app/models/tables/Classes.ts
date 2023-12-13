import { DataTypes, Model, Sequelize } from "sequelize";

interface ClassAttributes {
    id?: number;
    name: string;
    PA?: number; // player ability
    PS?: number; // player strongness
    PD?: number; // player defense
    PH?: number; // player heal
    
}

export interface ClassInstance extends Model<ClassAttributes>, ClassAttributes {}

export default function Classes(sequelize: Sequelize) {
    const Classes = sequelize.define<ClassInstance>("classes", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Classes;
}
