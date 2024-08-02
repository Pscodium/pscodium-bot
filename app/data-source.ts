/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { ModelOptions, Sequelize } from "sequelize";
import dotenv = require('dotenv');
import User from "./models/tables/User";
import Bank from "./models/tables/Bank";
import Blackjack from "./models/tables/Blackjack";
import Game from "./models/tables/Games";
import Cards from "./models/tables/Cards";
import Badges from "./models/tables/Badges";
import Achievements from "./models/tables/Achievements";
import UserAchievements from "./models/tables/UserAchievements";
import Ticket from "./models/tables/Ticket";
import UserTicket from "./models/tables/UserTicket";
import DefaultService from "./services/default.service";
import enums from './models/enums/index';
import Permissions from "./models/tables/Permissions";
import Session from "./models/tables/Session";
import Guilds from "./models/tables/Guilds";

dotenv.config();

const sequelize = new Sequelize(String(process.env.DB_NAME), String(process.env.DB_USER), String(process.env.DB_PASSWORD), {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false
});

export interface Options extends ModelOptions<any> {
    associate?: (models: Record<string, any>) => void;
}

interface ModelOptionsGeneric {
    options: {
        associate?: (models: DatabaseModels) => void;
    }
}

const db = {
    enums,
    Guilds: Guilds(sequelize),
    User: User(sequelize),
    Session: Session(sequelize),
    Bank: Bank(sequelize),
    Card: Cards(sequelize),
    Blackjack: Blackjack(sequelize),
    Badge: Badges(sequelize),
    Achievement: Achievements(sequelize),
    UserAchievements: UserAchievements(sequelize),
    Game: Game(sequelize),
    Ticket: Ticket(sequelize),
    UserTicket: UserTicket(sequelize),
    Permissions: Permissions(sequelize),
    sequelize: sequelize
};

type DatabaseModels = typeof db;
type ModelBase<T> = T extends { [key: string]: infer U } ? U & ModelOptionsGeneric : never;

new DefaultService();

Object.entries(db).forEach(([modelName, model]) => {
    if (modelName === 'enums' || modelName === 'sequelize') return;
    const modelInstance = model as ModelBase<DatabaseModels>;
    if (modelInstance.options && typeof modelInstance.options.associate === 'function') {
        modelInstance.options.associate(db);
    }
});

sequelize.sync({ alter: true, logging: false }).then(() => {
    console.log('All tables have been synchronized.');
});


export { sequelize, db };
