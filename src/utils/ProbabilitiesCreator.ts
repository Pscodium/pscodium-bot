
class ProbabilitiesCreator {
    getCrashMultiplier() {
        function randomWithProbabilities(probs: any[]) {
            const totalProb = probs.reduce((acc: any, prob: any) => acc + prob, 0);
            const rand = Math.random() * totalProb;
            let cumulativeProb = 0;
            for (let i = 0; i < probs.length; i++) {
                cumulativeProb += probs[i];
                if (rand < cumulativeProb) {
                    return i;
                }
            }
        }

        // default probability is [0.1, 0.3, 0.6]
        // the sum of the 3 numbers must be equal to 1
        const probabilities = [0.03, 0.1, 0.87];

        const randomInt = randomWithProbabilities(probabilities);

        let multi = 0;
        let randomFloat: number;

        if (randomInt === 0) {
            multi = Math.floor(Math.random() * ( 100 - 8 + 1)) + 5;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }
        else if (randomInt === 1) {
            multi = Math.floor(Math.random() * ( 6 - 1.54 + 1)) + 1.54;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }
        else if (randomInt === 2) {
            multi = Math.floor(Math.random() * ( 1.54 - 1 + 1)) + 1;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }

        return multi;
    }

    getKindaHardProbabilities() {
        function randomWithProbabilities(probs: any[]) {
            const totalProb = probs.reduce((acc: any, prob: any) => acc + prob, 0);
            const rand = Math.random() * totalProb;
            let cumulativeProb = 0;
            for (let i = 0; i < probs.length; i++) {
                cumulativeProb += probs[i];
                if (rand < cumulativeProb) {
                    return i;
                }
            }
        }

        // default probability is [0.1, 0.3, 0.6]
        // the sum of the 3 numbers must be equal to 1
        const probabilities = [0.03, 0.1, 0.37, 0.50];

        const randomInt = randomWithProbabilities(probabilities);

        let multi = 0;
        let randomFloat: number;

        if (randomInt === 0) {
            multi = Math.floor(Math.random() * ( 100 - 8 + 1)) + 5;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }
        else if (randomInt === 1) {
            multi = Math.floor(Math.random() * ( 6 - 1.54 + 1)) + 1.54;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }
        else if (randomInt === 2) {
            multi = Math.floor(Math.random() * ( 1.54 - 1.20 + 1)) + 1.20;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }
        else if (randomInt === 3) {
            multi = Math.floor(Math.random() * (1.20 - 1 + 1)) + 1;
            randomFloat = Number((Math.random() * (1 - 0) + 0).toFixed(2));
            multi = parseFloat((multi + randomFloat).toFixed(2));
        }

        return multi;
    }
}
export const probabilitiesCreator = new ProbabilitiesCreator();
