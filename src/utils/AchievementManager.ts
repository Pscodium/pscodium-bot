import { db } from "../data-source";
import { AchievementsAttributes } from "../models/tables/Achievements";
import { BadgesInstance } from "../models/tables/Badges";

interface EmojiCode {
    label: string;
    value: string;
    emoji: string;
}

class AchievementManager {

    async getBadgeFromDatabase(value: string): Promise<BadgesInstance | null> {
        const badge = await db.Badge.findOne({ where: { value: value } });

        return badge;
    }

    async createAchievement({ emoji, emoji_value, type, level_to_reach, plays_to_reach, wins_to_reach, description, name}: AchievementsAttributes) {
        const achievement = await db.Achievement.create({
            emoji: emoji,
            emoji_value: emoji_value,
            type: type,
            level_to_reach: level_to_reach,
            plays_to_reach: plays_to_reach,
            wins_to_reach: wins_to_reach,
            description: description,
            name: name
        });
        achievement.save();
    }

    async getFirstTwentyFiveAchievements(): Promise<EmojiCode[]> {
        const achievements = await db.Achievement.findAll({
            limit: 25
        });

        const emojiCode: EmojiCode[] = achievements.map(achievement => {
            return { emoji: achievement.emoji_value, label: achievement.name, value: String(achievement.id) };
        });

        return emojiCode;
    }

    async getSecondTwentyFiveAchievements(): Promise<EmojiCode[]> {
        const achievements = await db.Achievement.findAll({
            offset: 25,
            limit: 25
        });

        const emojiCode: EmojiCode[] = achievements.map(achievement => {
            return { emoji: achievement.emoji_value, label: achievement.name, value: String(achievement.id) };
        });

        return emojiCode;
    }

    async addAchievementForUser(userId: string, achievementId: string) {
        const user = await db.User.findOne({
            where: {
                id: userId
            }
        });
        const achievement = await db.Achievement.findOne({
            where: {
                id: Number(achievementId)
            }
        });

        if (user && achievement) {
            await user.addAchievement(achievement);
        }
    }
}
export const achievementManager = new AchievementManager();
