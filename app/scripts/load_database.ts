/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable guard-for-in */
import { db } from '../data-source';
import { databaseStructureCreator } from '../utils/DatabaseStructureCreator';

async function load() {
    const reseted = await restartDb();
    if (reseted) {

        await databaseStructureCreator.populateCards();
        await databaseStructureCreator.populateBadges();
        await databaseStructureCreator.populateAchievements();
        process.exit(0);
    }
}

async function restartDb() {
    try {
        if (db.sequelize) {
            await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            const { sequelize, ...models }: any = db;
            for (const model in models) {
                if (model != 'enums') {
                    await models[model].destroy({
                        where: {},
                        truncate: true
                    });
                }
            }
            await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        }

        console.log("Connection established!");
        return true;


    } catch (err) {
        console.error('Error when resetting the database:', err);
    }

}

load().then(() => {
    console.log("Pre load database completed! \n\n");
    process.exit(0);
})
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
