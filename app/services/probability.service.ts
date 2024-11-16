import { gameService } from "./games.service";

class ProbabilityService {
    randomWithProbabilities(probs: number[]): number {
        const totalProb = probs.reduce((acc, prob) => acc + prob, 0);

        if (Math.abs(totalProb - 1) > 1e-10) {
            throw new Error("A soma das probabilidades deve ser igual a 1.");
        }

        const rand = Math.random();
        let cumulativeProb = 0;

        for (let i = 0; i < probs.length; i++) {
            cumulativeProb += probs[i];
            if (rand < cumulativeProb) {
                return i;
            }
        }

        return probs.length - 1;
    }

    probabilityCreator(probabilities?: number[]): number {
        const probs = probabilities ?? [0.6, 0.20, 0.10, 0.08, 0.02];

        const randomInt = this.randomWithProbabilities(probs);

        if (randomInt === probs.length - 1) {
            const baseValue = 10 + Math.random() * 100;
            return parseFloat(baseValue.toFixed(2));
        }

        const baseValue = randomInt + 1;
        const randomDecimal = Math.random();
        const result = baseValue + randomDecimal;

        return parseFloat(result.toFixed(2));
    }

    async createBatchProbability(probabilities?: number[]): Promise<number | undefined> {
        const results = Array.from({ length: 100 }, () => 
            this.probabilityCreator(probabilities)
        );
        const matchResult = results[Math.floor(Math.random() * results.length)];

        const match = await gameService.createCrashGame(results, matchResult);

        return match?.selectedPlay;
    }
}

export const probabilityService = new ProbabilityService();