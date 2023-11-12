import { achievementService } from "./achievement.service";
import DefaultService from "./default.service";
import { userService } from "./user.service";

class BankService extends DefaultService {

    async withdrawMoney(value: number, bankId: number | undefined) {
        await this.db.Bank.update({
            bank: this.db.sequelize.literal(`bank - ${value}`),
            balance: this.db.sequelize.literal(`balance + ${value}`)
        }, {
            where: { id: bankId }
        });
    }

    async depositMoney(value: number, bankId: number | undefined) {
        await this.db.Bank.update({
            bank: this.db.sequelize.literal(`bank + ${value}`),
            balance: this.db.sequelize.literal(`balance - ${value}`)
        }, {
            where: { id: bankId }
        });
    }

    async getTotalMoneyByUserId(userId: string | undefined): Promise<number | undefined> {
        if (!userId) return;
        const user = await this.db.User.findOne({
            where: {
                id: userId
            },
            include: [
                {
                    model: this.db.Bank,
                    attributes: [
                        [this.db.sequelize.literal('bank + balance'), "total"]
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

    async getTotalMoneyByBankId(bankId: number | undefined): Promise<number | undefined> {
        if (!bankId) return;
        const account = await this.db.Bank.findOne({
            where: {
                id: bankId
            },
            attributes: [
                [this.db.sequelize.literal('bank + balance'), "total"]
            ],
        });
        if (!account) return;
        const money = account.dataValues.total;
        if (!money) return;
        return money;
    }

    async accountMoneyValidator(bankId: number | undefined) {
        const money = await this.getTotalMoneyByBankId(bankId);
        const user = await userService.getUserByBankId(bankId);

        const achievements = await achievementService.getMoneyAchievementsSmallerThanValue(money);

        if (!achievements) return;
        if (!user) return;

        const lastAchievement = achievements[achievements.length - 1];
        const hasAchievement = await achievementService.userHasAchievement(user.id, lastAchievement);

        if (hasAchievement) return;

        await achievementService.deleteAllUserAchievements(achievements);
        await user.addAchievement(lastAchievement);
    }
}
export const bankService = new BankService();
