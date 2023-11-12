import { db } from "../data-source";
import enums from "../models/enums";
import { smallCapsMap } from "../utils/font/small_caps";



export default class DefaultService {
    public db;
    public enums;

    constructor() {
        this.db = db;
        this.enums = enums;
    }

    async capitalizedCase(text: string | undefined | null) {
        if (!text) return;
        if (typeof text == 'string') {
            text = String(text);
        }
        const words = text.toLowerCase().split(' ');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        return words.join(' ');
    }

    convertToSmallCaps(text: string): string {
        return text.toLowerCase().split("").map((char) => smallCapsMap[char] || char).join("");
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

}