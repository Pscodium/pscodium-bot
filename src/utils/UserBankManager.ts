/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../data-source";
import { AchievementsAttributes, AchievementsInstance, AchievementTypes } from "../models/tables/Achievements";

class UserBankManager {

    async withdrawMoney(value: number, bankId: number | undefined) {
        await db.Bank.update({
            bank: db.sequelize.literal(`bank - ${value}`),
            balance: db.sequelize.literal(`balance + ${value}`)
        }, {
            where: { id: bankId }
        });
    }

    async depositMoney(value: number, bankId: number | undefined) {
        await db.Bank.update({
            bank: db.sequelize.literal(`bank + ${value}`),
            balance: db.sequelize.literal(`balance - ${value}`)
        }, {
            where: { id: bankId }
        });
    }

    async blackjackUpdateBalanceWinner(bet: number | null, bankId: number | undefined) {
        await db.Bank.update({
            balance: bet? db.sequelize.literal(`balance + ${bet}`) : db.sequelize.literal(`balance + balance`)
        }, {
            where: { id: bankId }
        });
        this.accountMoneyValidator(bankId);
    }

    async blackjackUpdateBalanceLoser(bet: number | null, bankId: number | undefined) {
        await db.Bank.update({
            balance: bet? db.sequelize.literal(`balance - ${bet}`) : 0
        }, {
            where: { id: bankId }
        });
    }

    async crashUpdateBalanceWinner(bet: number | null, bankId: number | undefined, multiplicator: number) {
        await db.Bank.update({
            balance: bet? db.sequelize.literal(`balance + ((${bet * multiplicator}) - ${bet})`) : db.sequelize.literal(`balance * ${multiplicator}`)
        }, {
            where: { id: bankId }
        });
        this.accountMoneyValidator(bankId);
    }

    async crashUpdateBalanceLoser(bet: number | null, bankId: number | undefined) {
        await db.Bank.update({
            balance: bet? db.sequelize.literal(`balance - ${bet}`) : 0
        }, {
            where: { id: bankId }
        });
    }

    async getNextMoneyAchievement(userId: string): Promise<AchievementsAttributes | undefined> {
        let nextAchievement;
        const user = await db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: db.Achievement,
                    where: {
                        type: AchievementTypes.MONEY
                    },
                    as: 'achievements',
                    nested: true
                }
            ]
        });
        if (!user) return;
        const achievements = await db.Achievement.findAll({
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

    async getMoneyAchievement(userId: string): Promise<AchievementsAttributes | undefined> {
        let actualAchivement;
        const user = await db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: db.Achievement,
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

    async getTotalBankValue(userId: string): Promise<number | undefined> {
        const user = await db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: db.Bank,
                    attributes: [
                        [db.sequelize.literal('bank + balance'), "total"]
                    ],
                    as: 'bank'
                }
            ],
        });
        if (!user) return;
        if (!user.bank) return;
        const bank = user.bank;
        return bank.dataValues.total;
    }

    formatedCash(amount: number | string | undefined | null) {
        if (!amount) return;
        if (typeof amount == 'number') {
            amount = parseFloat(String(amount));
        } else {
            amount = parseFloat(amount);
        }

        let formated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        if (Number(formated) >= 100) {
            formated = formated.replace(',', '.');
        }
        return formated;
    }

    async accountMoneyValidator(bankId: number | undefined) {
        const account = await db.Bank.findOne({
            where: {
                id: bankId
            },
            attributes: [
                [db.sequelize.literal('bank + balance'), "total"]
            ],
        });
        if (!account) return;
        const money = account.dataValues.total;
        if (!money) return;


        const user = await db.User.findOne({
            where: {
                bankId: bankId
            }
        });
        if (!user) return;
        const achievement = await db.Achievement.findAll({
            where: db.sequelize.literal(`money_to_reach < ${Number(money)} AND type = '${AchievementTypes.MONEY}'`)
        });

        if (!achievement) return;
        const hasAchievement = await db.UserAchievements.findOne({
            where: {
                achievementId: achievement[achievement.length - 1].dataValues.id
            }
        });

        if (hasAchievement) return;

        for (let i = 0; i < achievement.length - 1; i++) {
            await db.UserAchievements.destroy({
                where: {
                    achievementId: achievement[i].id
                }
            });
        }
        await user.addAchievement(achievement[achievement.length - 1]);

    }
}

export const userBankManager = new UserBankManager();
