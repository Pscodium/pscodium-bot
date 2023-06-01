/* eslint-disable guard-for-in */
/* eslint-disable no-sync */
import { db } from "../data-source";
import  * as fs from 'fs';
import * as path from 'path';
import * as badges from '../scripts/database/badges.json';
import * as achievements from '../scripts/database/achievements.json';
import * as cards from '../scripts/database/cards.json';
import { AchievementTypes } from "../models/tables/Achievements";

class DatabaseStructureCreator {

    private dataFolderPath = path.join(__dirname, '../scripts/database');

    async badgesSaver() {
        const pathToJson = path.join(this.dataFolderPath, 'badges.json');

        const badges = await db.Badge.findAll();

        const data = badges.map((badge) => badge.toJSON());

        const jsonData = JSON.stringify(data, null, 2);

        fs.writeFileSync(pathToJson, jsonData);
    }

    async achievementsSaver() {
        const pathToJson = path.join(this.dataFolderPath, 'achievements.json');

        const achievements = await db.Achievement.findAll();

        const data = achievements.map((achievement) => achievement.toJSON());

        const jsonData = JSON.stringify(data, null, 2);

        fs.writeFileSync(pathToJson, jsonData);
    }

    async cardsSaver() {
        const pathToJson = path.join(this.dataFolderPath, 'cards.json');

        const cards = await db.Card.findAll();

        const data = cards.map((card) => card.toJSON());

        const jsonData = JSON.stringify(data, null, 2);

        fs.writeFileSync(pathToJson, jsonData);
    }

    async populateBadges() {
        try {
            for (const badge in badges) {
                const badgeExist = await db.Badge.findOne({ where: { emoji: badges[badge].emoji }});

                if (badgeExist) {
                    return;
                }
                await db.Badge.create({
                    emoji: badges[badge].emoji,
                    value: badges[badge].value,
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    async populateAchievements() {
        try {
            for (const card in cards) {
                const cardExist = await db.Card.findOne({ where: { emoji: cards[card].emoji }});

                if (cardExist) {
                    return;
                }
                await db.Card.create({
                    emoji: cards[card].emoji,
                    value: cards[card].value,
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    async populateCards() {
        try {
            for (const achievement in achievements) {
                const achievementExist = await db.Achievement.findOne({ where: { name: achievements[achievement].name }});

                if (achievementExist) {
                    return;
                }

                await db.Achievement.create({
                    description: achievements[achievement].description,
                    emoji: achievements[achievement].emoji,
                    emoji_value: achievements[achievement].emoji_value,
                    name: achievements[achievement].name,
                    type: achievements[achievement].type as AchievementTypes,
                    level_to_reach: achievements[achievement].level_to_reach,
                    money_to_reach: Number(achievements[achievement].money_to_reach),
                    plays_to_reach: achievements[achievement].plays_to_reach,
                    wins_to_reach: achievements[achievement].wins_to_reach
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

}
export const databaseStructureCreator = new DatabaseStructureCreator();
