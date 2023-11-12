import { BadgesInstance } from "../models/tables/Badges";
import DefaultService from "./default.service";

export interface EmojiCode {
    label: string;
    value: string;
    emoji: string;
}

class BadgesService extends DefaultService {
    async getBadgeFromDatabase(value: string): Promise<BadgesInstance | null> {
        const badge = await this.db.Badge.findOne({ where: { value: value } });

        return badge;
    }

    async getVerifiedBadge(userId: string) {
        const user = await this.db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: this.db.Achievement,
                    attributes: ['name']
                }
            ]
        });
        const badge = await this.db.Achievement.findOne({
            where: {
                name: "Verified"
            }
        });

        if (user && badge) {
            const userAchievement = await user.getAchievements();

            const userAlreadyVerified = userAchievement.filter(a => a.name == "Verified");
            if (userAlreadyVerified.length === 0) {
                await user.addAchievement(badge);
                return true;
            }
            return false;
        }
    }

    async userVerifiedBadge(userId: string) {
        const user = await this.db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: this.db.Achievement,
                    attributes: ['name']
                }
            ]
        });
        const badge = await this.db.Achievement.findOne({
            where: {
                name: "Verified"
            }
        });

        if (user && badge) {
            const userAchievement = await user.getAchievements();
            const userHasAchievement = userAchievement.filter(a => a.name == "Verified");
            if (userHasAchievement.length !== 0) {
                return badge.emoji_value;
            } else {
                return '';
            }
        }
    }

    async getFirstTwentyFiveBadges(): Promise<EmojiCode[]> {
        const emojiList = await this.db.Badge.findAll({
            limit: 25
        });

        const emojiCode: EmojiCode[] = emojiList.map(emoji => {
            return { label: emoji.emoji, value: emoji.value, emoji: emoji.value };
        });

        return emojiCode;
    }

    async getSecondTwentyFiveBadges(): Promise<EmojiCode[]> {
        const emojiList = await this.db.Badge.findAll({
            offset: 25,
            limit: 25
        });

        const emojiCode: EmojiCode[] = emojiList.map(emoji => {
            return { label: emoji.emoji, value: emoji.value, emoji: emoji.value };
        });

        return emojiCode;
    }

    async getThirdTwentyFiveBadges(): Promise<EmojiCode[]> {
        const emojiList = await this.db.Badge.findAll({
            offset: 50,
            limit: 25
        });

        const emojiCode: EmojiCode[] = emojiList.map(emoji => {
            return { label: emoji.emoji, value: emoji.value, emoji: emoji.value };
        });

        return emojiCode;
    }
}

export const badgesService = new BadgesService();