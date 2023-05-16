import { db, sequelize } from "../data-source";


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

}
export const userGameInteraction = new UserGameInteraction();
