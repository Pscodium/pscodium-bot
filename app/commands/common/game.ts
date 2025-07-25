/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { bankService } from "../../services/bank.service";
import { achievementService } from "../../services/achievement.service";

export default new Command({
    name: "game",
    description: "Made for experienced devs.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "profile",
            description: "Your/User game profile.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Profile from mentioned user.",
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        }
    ],
    async run({ interaction, options, t }){

        const mention = options.getUser("user");

        const user = await db.User.findOne({
            where: {
                id: mention? mention.id : interaction.user.id
            },
            include: [
                { model: db.Game },
                'achievements'
            ]
        });

        if (!user) return;

        const moneyAchievement = await achievementService.getMoneyAchievement(user.id);
        const nextMoneyAchievement = await achievementService.getNextMoneyAchievement(user.id);
        const totalBankAccountValue = await bankService.getTotalMoneyByUserId(user.id);

        const moneyToNextAchievement = bankService.formatedCash(nextMoneyAchievement?.money_to_reach);
        const totalMoneyFormatted = bankService.formatedCash(totalBankAccountValue);

        const achievements = await user.getAchievements();

        const achievementsLabel = achievements.map(achievement => {
            return { id: achievement.id, name: achievement.name, description: achievement.description, emoji: achievement.emoji, emoji_value: achievement.emoji_value };
        });

        const gameProfile = user.game;
        if (!gameProfile) return;

        const embed = new EmbedBuilder()
            .setTitle(t.translate('GAME_PROFILE_TITLE', { UserName: mention? mention.username : interaction.user.username }))
            .setAuthor({
                name: interaction.user.username,

                iconURL: interaction.user.avatarURL() || undefined,
            })
            .setThumbnail(mention? mention.avatarURL() : interaction.user.avatarURL())
            .setDescription(t.translate('GAME_PROFILE_DESCRIPTION', { AchievementsList: achievementsLabel.map(achievement => {
                return achievement.emoji_value;
            }). join(', ').replace(/,/g, ''), TotalMoney: totalMoneyFormatted, MoneyAchievement: moneyToNextAchievement }))
            .setFields(
                {
                    name: t.translate('GENERIC_BLACKJACK_WINS'),
                    value: String(gameProfile.blackjack_wins),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_BLACKJACK_LOSSES'),
                    value: String(gameProfile.blackjack_losses),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_RATIO'),
                    value: String(gameProfile.blackjack_ratio),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_CRASH_WINS'),
                    value: String(gameProfile.crash_wins),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_CRASH_LOSSES'),
                    value: String(gameProfile.crash_losses),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_RATIO'),
                    value: String(gameProfile.crash_ratio),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_TOTAL_WINS'),
                    value: String(gameProfile.total_wins),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_TOTAL_LOSSES'),
                    value: String(gameProfile.total_losses),
                    inline: true
                },
                {
                    name: t.translate('GENERIC_RATIO'),
                    value: String(gameProfile.total_ratio),
                    inline: true
                }
            )
            .setColor(config.colors["Atomic tangerine"] as ColorResolvable);

        interaction.reply({
            embeds: [embed.toJSON()]
        });
    }
});
