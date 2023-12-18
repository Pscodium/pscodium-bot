import { DataTypes, Model, Sequelize } from "sequelize";
import { Options } from "../../data-source";
import { UserInstance } from "./User";

export interface SessionAttributes {
    sessionId?: string;
    expiration_date: number;
    jwt?: string;
    userId?: string;
}

export interface SessionInstance extends Model<SessionAttributes>, SessionAttributes {
    setUser(hasUser: UserInstance): unknown;
}

export default function Session(sequelize: Sequelize) {
    const Session = sequelize.define<SessionInstance>("session", {
        sessionId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        jwt: {
            type: DataTypes.STRING,
            allowNull: true
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        associate: function (models) {
            Session.belongsTo(models.User, {
                foreignKey: "userId",
                onDelete: "cascade"
            })
        }
    } as Options);
    return Session;
}
