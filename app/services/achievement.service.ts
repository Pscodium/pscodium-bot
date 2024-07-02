import { AchievementsAttributes, AchievementTypes, AchievementsInstance } from "../models/tables/Achievements";
import { EmojiCode } from "./badges.service";
import DefaultService  from "./default.service";

export interface WinsAchievement {
    wins: number | null;
    id: number | undefined;
}

class AchievementService extends DefaultService {

    async getMoneyAchievement(userId: string): Promise<AchievementsAttributes | undefined> {
        let actualAchivement;
        const user = await this.db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: this.db.Achievement,
                    where: {
                        type: AchievementTypes.MONEY
                    },
                    as: 'achievements',
                    nested: true
                }
            ]
        });
        if (!user) return;

        const userAchievement = user.get('achievements') as unknown as AchievementsInstance[];
        if (userAchievement && userAchievement.length > 0) {
            for (const achievement of userAchievement) {
                actualAchivement = achievement;
            }
        }

        if (!actualAchivement) return;

        return actualAchivement.dataValues;
    }

    async getNextMoneyAchievement(userId: string): Promise<AchievementsAttributes | undefined> {
        let nextAchievement;
        const user = await this.db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: this.db.Achievement,
                    where: {
                        type: AchievementTypes.MONEY
                    },
                    as: 'achievements',
                    nested: true
                }
            ]
        });
        if (!user) return;
        const achievements = await this.db.Achievement.findAll({
            where: {
                type: AchievementTypes.MONEY
            }
        });
        if (!achievements) return;

        const userAchievement = user.get('achievements') as unknown as AchievementsInstance[];
        if (userAchievement && userAchievement.length > 0) {
            for (const achievement of userAchievement) {
                for (let i = 0; i < achievements.length; i++) {
                    if (achievements[i].id === achievement.id) {
                        nextAchievement = achievements[i + 1];
                    }
                }
            }
        }

        if (!nextAchievement) return;

        return nextAchievement.dataValues;
    }

    async getMoneyAchievementsSmallerThanValue(value: number | undefined): Promise<AchievementsInstance[] | undefined> {
        if (!value) return;
        const achievements = await this.db.Achievement.findAll({
            where: this.db.sequelize.literal(`money_to_reach < ${Number(value)} AND type = '${AchievementTypes.MONEY}'`)
        });

        if (!achievements) return;
        return achievements;
    }

    async userHasAchievement(userId: string, achievement: AchievementsInstance): Promise<boolean> {
        if (!achievement) return false;

        const hasAchievement = await this.db.UserAchievements.findOne({
            where: {
                userId: userId,
                achievementId: achievement.dataValues.id
            }
        });
        if (!hasAchievement) return false;
        return true;
    }

    async deleteAllUserAchievements(achievements: AchievementsInstance[]) {
        for (const achievement of achievements) {
            await this.db.UserAchievements.destroy({
                where: {
                    achievementId: achievement.id
                }
            });
        }
    }

    async createAchievement({ emoji, emoji_value, type, level_to_reach, plays_to_reach, wins_to_reach, money_to_reach, description, name}: AchievementsAttributes) {
        const achievement = await this.db.Achievement.create({
            emoji: emoji,
            emoji_value: emoji_value,
            type: type,
            level_to_reach: level_to_reach,
            plays_to_reach: plays_to_reach,
            wins_to_reach: wins_to_reach,
            money_to_reach: money_to_reach,
            description: description,
            name: name
        });
        achievement.save();
    }

    async getFirstTwentyFiveAchievements(): Promise<EmojiCode[]> {
        const achievements = await this.db.Achievement.findAll({
            limit: 25
        });

        const emojiCode: EmojiCode[] = achievements.map(achievement => {
            return { emoji: achievement.emoji_value, label: achievement.name, value: String(achievement.id) };
        });

        return emojiCode;
    }

    async getSecondTwentyFiveAchievements(): Promise<EmojiCode[]> {
        const achievements = await this.db.Achievement.findAll({
            offset: 25,
            limit: 25
        });

        const emojiCode: EmojiCode[] = achievements.map(achievement => {
            return { emoji: achievement.emoji_value, label: achievement.name, value: String(achievement.id) };
        });

        return emojiCode;
    }

    async getThirdTwentyFiveAchievements(): Promise<EmojiCode[]> {
        const achievements = await this.db.Achievement.findAll({
            offset: 50,
            limit: 25
        });

        const emojiCode: EmojiCode[] = achievements.map(achievement => {
            return { emoji: achievement.emoji_value, label: achievement.name, value: String(achievement.id) };
        });

        return emojiCode;
    }

    async addAchievementForUser(userId: string, achievementId: string) {
        const user = await this.db.User.findOne({
            where: {
                id: userId
            }
        });
        const achievement = await this.db.Achievement.findOne({
            where: {
                id: Number(achievementId)
            }
        });

        if (user && achievement) {
            await user.addAchievement(achievement);
        }
    }

    async winsToGetAchievement(): Promise<WinsAchievement[]> {
        const achievement = await this.db.Achievement.findAll({
            where: {
                type: 'wins'
            }
        });

        const wins = achievement.map(result => {
            return { wins: result.wins_to_reach, id: result.id };
        });

        return wins;
    }
}

export const achievementService = new AchievementService();