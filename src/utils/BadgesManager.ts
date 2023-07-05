import { db } from '../data-source';

class BadgesManager {
    async getVerifiedBadge(userId: string) {
        const user = await db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: db.Achievement,
                    attributes: ['name']
                }
            ]
        });
        const badge = await db.Achievement.findOne({
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
        const user = await db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: db.Achievement,
                    attributes: ['name']
                }
            ]
        });
        const badge = await db.Achievement.findOne({
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
}
export const badgesManager = new BadgesManager();
