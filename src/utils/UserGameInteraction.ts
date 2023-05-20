import { db, sequelize } from "../data-source";

interface WinsAchievement {
    wins: number | null;
    id: number | undefined;
}
class UserGameInteraction {

    async blackjackWin(id: number | undefined) {
        await db.Game.update({
            total_wins: sequelize.literal(`total_wins + 1`),
            total_ratio: sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            blackjack_wins: sequelize.literal(`blackjack_wins + 1`),
            blackjack_ratio: sequelize.literal(`CASE WHEN blackjack_losses > 0 THEN blackjack_wins / blackjack_losses ELSE blackjack_wins END`)
        }, {
            where: {
                id: id
            }
        });

        await this.getAchievementListener(id);
    }

    async blackjackLoss(id: number | undefined) {
        await db.Game.update({
            total_losses: sequelize.literal(`total_losses + 1`),
            total_ratio: sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            blackjack_losses: sequelize.literal(`blackjack_losses + 1`),
            blackjack_ratio: sequelize.literal(`CASE WHEN blackjack_losses > 0 THEN blackjack_wins / blackjack_losses ELSE blackjack_wins END`)
        }, {
            where: {
                id: id
            }
        });
    }

    async crashWin(id: number | undefined) {
        await db.Game.update({
            total_wins: sequelize.literal(`total_wins + 1`),
            total_ratio: sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            crash_wins: sequelize.literal(`crash_wins + 1`),
            crash_ratio: sequelize.literal(`CASE WHEN crash_losses > 0 THEN crash_wins / crash_losses ELSE crash_wins END`)
        }, {
            where: {
                id: id
            }
        });

        await this.getAchievementListener(id);
    }

    async crashLoss(id: number | undefined) {
        await db.Game.update({
            total_losses: sequelize.literal(`total_losses + 1`),
            total_ratio: sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            crash_losses: sequelize.literal(`crash_losses + 1`),
            crash_ratio: sequelize.literal(`CASE WHEN crash_losses > 0 THEN crash_wins / crash_losses ELSE crash_wins END`)
        }, {
            where: {
                id: id
            }
        });
    }

    async winsToGetAchievement(): Promise<WinsAchievement[]> {
        const achievement = await db.Achievement.findAll({
            where: {
                type: 'wins'
            }
        });

        const wins = achievement.map(result => {
            return { wins: result.wins_to_reach, id: result.id };
        });

        return wins;
    }

    async getAchievementListener(id: number | undefined) {
        const gameProfile = await db.Game.findOne({
            where: {
                id: id
            },
        });
        if (!gameProfile) return;
        const wins = gameProfile.total_wins;

        const possibleWins = await this.winsToGetAchievement();

        for( const mission of possibleWins ) {
            if (mission.wins && wins >= mission.wins) {
                const user = await db.User.findOne({
                    where: {
                        gameId: id
                    }
                });
                const achievement = await db.Achievement.findOne({
                    where: {
                        id: mission.id
                    }
                });

                if (user && achievement) {
                    await user.addAchievement(achievement);
                }
            }
        }
    }

}
export const userGameInteraction = new UserGameInteraction();
