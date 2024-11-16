import { CrashInstance } from "../models/tables/Crash";
import { achievementService } from "./achievement.service";
import { bankService } from "./bank.service";
import DefaultService from "./default.service";
import { probabilityService } from "./probability.service";

class GameService extends DefaultService {
    async crashUpdateBalanceWinner(bet: number | null, bankId: number | undefined, multiplicator: number) {
        await this.db.Bank.update({
            balance: bet? this.db.sequelize.literal(`balance + ((${bet * multiplicator}) - ${bet})`) : this.db.sequelize.literal(`balance * ${multiplicator}`)
        }, {
            where: { id: bankId }
        });
        bankService.accountMoneyValidator(bankId);
    }

    async crashUpdateBalanceLoser(bet: number | null, bankId: number | undefined) {
        await this.db.Bank.update({
            balance: bet? this.db.sequelize.literal(`balance - ${bet}`) : 0
        }, {
            where: { id: bankId }
        });
    }

    async blackjackWin(id: number | undefined) {
        await this.db.Game.update({
            total_wins: this.db.sequelize.literal(`total_wins + 1`),
            total_ratio: this.db.sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            blackjack_wins: this.db.sequelize.literal(`blackjack_wins + 1`),
            blackjack_ratio: this.db.sequelize.literal(`CASE WHEN blackjack_losses > 0 THEN blackjack_wins / blackjack_losses ELSE blackjack_wins END`)
        }, {
            where: {
                id: id
            }
        });

        await this.getAchievementListener(id);
    }

    async blackjackLoss(id: number | undefined) {
        await this.db.Game.update({
            total_losses: this.db.sequelize.literal(`total_losses + 1`),
            total_ratio: this.db.sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            blackjack_losses: this.db.sequelize.literal(`blackjack_losses + 1`),
            blackjack_ratio: this.db.sequelize.literal(`CASE WHEN blackjack_losses > 0 THEN blackjack_wins / blackjack_losses ELSE blackjack_wins END`)
        }, {
            where: {
                id: id
            }
        });
    }

    async crashWin(id: number | undefined) {
        await this.db.Game.update({
            total_wins: this.db.sequelize.literal(`total_wins + 1`),
            total_ratio: this.db.sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            crash_wins: this.db.sequelize.literal(`crash_wins + 1`),
            crash_ratio: this.db.sequelize.literal(`CASE WHEN crash_losses > 0 THEN crash_wins / crash_losses ELSE crash_wins END`)
        }, {
            where: {
                id: id
            }
        });

        await this.getAchievementListener(id);
    }

    async crashLoss(id: number | undefined) {
        await this.db.Game.update({
            total_losses: this.db.sequelize.literal(`total_losses + 1`),
            total_ratio: this.db.sequelize.literal(`CASE WHEN total_losses > 0 THEN total_wins / total_losses ELSE total_wins END`),
            crash_losses: this.db.sequelize.literal(`crash_losses + 1`),
            crash_ratio: this.db.sequelize.literal(`CASE WHEN crash_losses > 0 THEN crash_wins / crash_losses ELSE crash_wins END`)
        }, {
            where: {
                id: id
            }
        });
    }

    async getAchievementListener(id: number | undefined) {
        const gameProfile = await this.db.Game.findOne({
            where: {
                id: id
            },
        });
        if (!gameProfile) return;
        const wins = gameProfile.total_wins;

        const possibleWins = await achievementService.winsToGetAchievement();

        for( const mission of possibleWins ) {
            if (mission.wins && wins >= mission.wins) {
                const user = await this.db.User.findOne({
                    where: {
                        gameId: id
                    }
                });
                const achievement = await this.db.Achievement.findOne({
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

    async getCrashGameMultiplicator(probabilities?: number[]): Promise<number> {
        const multiplier = await probabilityService.createBatchProbability(probabilities);

        if (!multiplier) {
            return 1.00;
        }

        return multiplier;
    }

    async getActualCrashGame(): Promise<CrashInstance | null> {
        return await this.db.Crash.findOne({
            order: [['createdAt', 'desc']],
            limit: 1
        });
    }

    async createNextCrashGame(possibleGames: number[], selectedPlay: number): Promise<CrashInstance> {
        return await this.db.Crash.create({
            possibleGames,
            selectedPlay
        });
    }

    async createCrashGame(batchGameResults: number[], matchResult: number): Promise<CrashInstance | null> {
        try {
            let actualGame: CrashInstance | null;
            actualGame = await this.getActualCrashGame();
            if (!actualGame) {
                actualGame = await this.createNextCrashGame(batchGameResults, matchResult);
            }
            const createdNextGame = await this.createNextCrashGame(batchGameResults, matchResult);
            if (createdNextGame) {
                return actualGame;
            }

        } catch (err) {
            console.error("[CRASH GAME] - Error on create a crash game: ", err);
            return null;
        }
        return null;
    }
}

export const gameService = new GameService();