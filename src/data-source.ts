/* eslint-disable @typescript-eslint/no-var-requires */
import { Sequelize } from "sequelize";
import dotenv = require('dotenv');
import User from "./models/tables/User";
import Bank from "./models/tables/Bank";
import Emoji from "./models/tables/Emoji";
dotenv.config();

const sequelize = new Sequelize(String(process.env.DB_NAME), String(process.env.DB_USER), String(process.env.DB_PASSWORD), {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

const db = {
    User: User(sequelize),
    Bank: Bank(sequelize),
    Emoji: Emoji(sequelize)
};

db.User.belongsTo(db.Bank, {
    foreignKey: "bankId",
    constraints: true
});

sequelize.sync({ alter: true }).then(() => {
    console.log('Todas as tabelas foram sincronizadas.');
});


export { sequelize, db };
