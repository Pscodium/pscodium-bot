import { APIInteractionGuildMember, GuildMember, User } from "discord.js";
import { I18n, Replacements } from "i18n";
import path from 'path';

interface TranslateOptions {
    [key: string]: string | number | User | GuildMember | APIInteractionGuildMember | null | undefined;
}

class TranslateService {
    private i18n: I18n;
    private currentLocale: string;

    constructor() {
        this.currentLocale = "pt";
        this.i18n = new I18n({
            locales: ["en", "pt"],
            directory: path.join(__dirname, '..', 'languages'),
            defaultLocale: 'pt'
        });
    }

    public translate(key: string, options?: TranslateOptions): string {
        let translation = this.i18n.__({
            phrase: key,
            locale: this.currentLocale
        }, options as Replacements);

        translation = this.verifyMention(translation);
        translation = this.verifyRoles(translation);

        return translation;
    }

    private verifyMention(translation: string) {
        const mentionRegex = /&lt;@.*&gt;/;
        const emojiRegex = /&lt;:.+:\d+&gt;/;
        const rolesRegex = /amp;/;

        if (mentionRegex.test(translation) || emojiRegex.test(translation) || rolesRegex.test(translation)) {
            return translation.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(rolesRegex, '');
        }
        return translation;
    }

    private verifyRoles(translation: string) {
        const rolesRegex = /amp;/;

        if (rolesRegex.test(translation)) {
            return translation.replace(/amp;/g, "");
        }
        return translation;
    }

    public setLocale(locale: string): void {
        this.currentLocale = locale;
    }
}

export default TranslateService;
export const t = new TranslateService();