import { EnumPermissionsKeys } from "../models/tables/Permissions";
import DefaultService from "./default.service";

class PermissionService extends DefaultService {
    async hasPermission(userId: string, permissions: EnumPermissionsKeys[]) {
        const userPermissions = await this.db.Permissions.findOne({
            where: {
                userId: userId,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'id', 'userId']
            }
        });
        if (!userPermissions) return;
        const userPermissionsData = userPermissions.dataValues;

        if (userPermissionsData.owner_level === true || userPermissionsData.master_admin_level === true) {
            return true;
        }
        const hasPermissionList = permissions.filter(permission => userPermissionsData[permission] === true);

        return hasPermissionList.length === permissions.length;
    }

    async getBotOwners(): Promise<(string | undefined)[]>  {
        const permissions_users_ids = await this.db.Permissions.findAll({
            where: {
                owner_level: true
            },
            attributes: ['userId']
        });

        const owners_ids = permissions_users_ids.map((key) => {
            return key.dataValues.userId;
        });

        return owners_ids;
    }

    async isOwner(userId: string): Promise<boolean> {
        const user_permission = await this.db.Permissions.findOne({
            where: {
                userId: userId
            },
            attributes: [this.enums.Permissions.owner_level]
        });
        if (!user_permission) return false;

        const isOwner = user_permission[this.enums.Permissions.owner_level];

        return isOwner;
    }

    async isMasterAdmin(userId: string): Promise<boolean> {
        const user_permission = await this.db.Permissions.findOne({
            where: {
                userId: userId
            },
            attributes: [this.enums.Permissions.master_admin_level, this.enums.Permissions.owner_level]
        });
        if (!user_permission) return false;
        if (user_permission[this.enums.Permissions.owner_level]) {
            return true;
        }

        const isMasterAdmin = user_permission[this.enums.Permissions.master_admin_level];

        return isMasterAdmin;
    }
}

export const permissionService = new PermissionService();