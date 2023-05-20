import { db } from "../data-source";

interface EmojiCode {
    label: string;
    value: string;
    emoji: string;
}

class GetBadgesForChoices {

    async getFirstTwentyFiveBadges(): Promise<EmojiCode[]> {
        const emojiList = await db.Badge.findAll({
            limit: 25
        });

        const emojiCode: EmojiCode[] = emojiList.map(emoji => {
            return { label: emoji.emoji, value: emoji.value, emoji: emoji.value };
        });

        return emojiCode;
    }

    async getSecondTwentyFiveBadges(): Promise<EmojiCode[]> {
        const emojiList = await db.Badge.findAll({
            offset: 25,
            limit: 25
        });

        const emojiCode: EmojiCode[] = emojiList.map(emoji => {
            return { label: emoji.emoji, value: emoji.value, emoji: emoji.value };
        });

        return emojiCode;
    }
}
export const getBadgesForChoices = new GetBadgesForChoices();
