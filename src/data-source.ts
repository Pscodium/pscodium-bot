/* eslint-disable @typescript-eslint/no-var-requires */
import { Sequelize } from "sequelize";
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
dotenv.config();

const sequelize = new Sequelize(String(process.env.DB_NAME), String(process.env.DB_USER), String(process.env.DB_PASSWORD), {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

const db = {
    User: User(sequelize),
    Bank: Bank(sequelize),
    Card: Cards(sequelize),
    Blackjack: Blackjack(sequelize),
    Badge: Badges(sequelize),
    Achievement: Achievements(sequelize),
    UserAchievements: UserAchievements(sequelize),
    Game: Game(sequelize),
    Ticket: Ticket(sequelize),
    UserTicket: UserTicket(sequelize),
    sequelize: sequelize
};

db.User.belongsTo(db.Bank, {
    foreignKey: "bankId",
    constraints: true
});
db.Blackjack.belongsTo(db.User, {
    foreignKey: "userId",
    constraints: true
});
db.User.belongsTo(db.Game, {
    foreignKey: "gameId",
    constraints: true
});
db.User.belongsToMany(db.Achievement, { through: db.UserAchievements, foreignKey: 'userId'});
db.Achievement.belongsToMany(db.User, { through: db.UserAchievements, foreignKey: 'achievementId'});

db.User.belongsToMany(db.Ticket, { through: db.UserTicket, foreignKey: "userId" });
db.Ticket.belongsToMany(db.User, { through: db.UserTicket, foreignKey: "ticketId" });

db.Ticket.belongsTo(db.User, {
    foreignKey: "createdBy",
    constraints: true
});

db.Ticket.belongsTo(db.User, {
    foreignKey: "claimedBy",
    constraints: true
});

db.Ticket.belongsTo(db.User, {
    foreignKey: "closedBy",
    constraints: true
});

sequelize.sync({ alter: true }).then(() => {
    console.log('Todas as tabelas foram sincronizadas.');
});


export { sequelize, db };
