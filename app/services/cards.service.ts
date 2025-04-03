import DefaultService from "./default.service";

class CardsService extends DefaultService {

    async getAllCards() {
        try {
            return await this.db.Card.findAll();
        } catch (err) {
            console.error('[CARDS ERROR] - ', err);
        }
    }

}

export const cardsService = new CardsService();
