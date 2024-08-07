/* eslint-disable no-prototype-builtins */
/* eslint-disable guard-for-in */

type EnumObject = {
    [key: string]: string;
}

const ENUMS = {
    UserRoles: {
        "admin": "admin",
        "developer": "developer",
        "owner": "owner",
        "customer": "customer",
        "default": "default"
    },
    Permissions: {
        "master_admin_level": 'master_admin_level',
        "can_manage_roles": 'can_manage_roles',
        "can_manage_users": 'can_manage_users',
        "can_manage_channels": 'can_manage_channels',
        "owner_level": "owner_level"
    } as const,
    rpg: {
        classes: {
            "warior": 'warior',
            "rogue": 'rogue',
            "paladin": 'paladin',
            "priest": 'priest',
            "mage": 'mage',
            "warlock": 'warlock'
        } as const
    } as const,
    Languages: {
        "en": "en",
        "pt": "pt"
    },
    values: function (enumObj: EnumObject) {
        return {
            values: Object.keys(enumObj).map(function (key) {
                return enumObj[key];
            })
        }
    },
    keys: (enumObj: any) => {
        return Object.keys(enumObj);
    }
};
const enums = Object.freeze(ENUMS);

export = enums;