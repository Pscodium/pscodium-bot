import { bankService } from "./bank.service";
import DefaultService from "./default.service";

class BlackjackService extends DefaultService {
    async blackjackUpdateBalanceWinner(bet: number | null, bankId: number | undefined) {
        await this.db.Bank.update({
            balance: bet? this.db.sequelize.literal(`balance + ${bet}`) : this.db.sequelize.literal(`balance + balance`)
        }, {
            where: { id: bankId }
        });
        bankService.accountMoneyValidator(bankId);
    }

    async blackjackUpdateBalanceLoser(bet: number | null, bankId: number | undefined) {
        await this.db.Bank.update({
            balance: bet? this.db.sequelize.literal(`balance - ${bet}`) : 0
        }, {
            where: { id: bankId }
        });
    }
}

export const blackjackService = new BlackjackService();
