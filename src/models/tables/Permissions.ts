import { DataTypes, Model, Sequelize } from "sequelize";
import enums from "../enums";
import { UserInstance } from "./User";
import { Options } from "../../data-source";

type EnumsType = typeof enums;
type EnumsPermissionsType = typeof enums.Permissions;
type EnumPermissionsKeys = keyof typeof enums.Permissions;

type PermissionAttributes = {
    [key in EnumPermissionsKeys]?: boolean;
} & {
    id: number;
    userId?: string;
};

export type PermissionsInstance = Model<PermissionAttributes> & PermissionAttributes & {
    setUser(user: UserInstance): unknown;
} & {
        [key in EnumPermissionsKeys]: boolean;
    };

export default function Permissions(sequelize: Sequelize) {
    const columnsList: Record<string, any> = {};

    Object.keys(enums.Permissions).forEach((permission) => {
        const column = {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        };

        columnsList[permission] = column;
    });

    const Permissions = sequelize.define<PermissionsInstance>("permissions", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ...columnsList
    }, {
        associate: function (models: Record<string, any>) {
            Permissions.belongsTo(models.User, { foreignKey: "userId", constraints: true });
        }
    } as Options)
    return Permissions
}
export { EnumsType, EnumPermissionsKeys, EnumsPermissionsType };