/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { ActionRowBuilder, APIActionRowComponent, APIMessageActionRowComponent, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ColorResolvable, ComponentType, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { blackjackService } from "../../services/blackjack.service";
import { gameService } from "../../services/games.service";

interface PlayProps {
    countHits?: number;
    continueInteraction?: boolean;
    lastPlay?: boolean;
    draw?: boolean;

    firstPlayerCard?: EmojiCode;
    secondPlayerCard?: EmojiCode;
    thirdPlayerCard?: EmojiCode;
    fourthPlayerCard?: EmojiCode;
    fifthPlayerCard?: EmojiCode;

    userPlay?: number;
    secondUserPlay?: number;
    thirdUserPlay?: number;
    fourthUserPlay?: number;

    firstDealerCard?: EmojiCode;
    secondDealerCard?: EmojiCode;
    thirdDealerCard?: EmojiCode;
    fourthDealerCard?: EmojiCode;
    fifthDealerCard?: EmojiCode;

    dealerPlay?: number;
    secondDealerPlay?: number;
    thirdDealerPlay?: number;
    fourthDealerPlay?: number;

    userWin?: boolean;
    interaction: ButtonInteraction<CacheType>;
}

interface EmojiCode {
    emoji: string;
    value: string;
}

export default new Command({
    name: "blackjack",
    description: "Jogar um 21 de malandro",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "bet",
            description: "Aposta algo aí",
            type: ApplicationCommandOptionType.Number,
            required: false
        }
    ],
    async run({ interaction, options, t }) {

        const member = interaction.user;
        const storedPlay = await db.Blackjack.findOne({
            where: {
                userId: member.id
            }
        });
        const bet = storedPlay? Number(storedPlay.bet) : options.getNumber('bet');

        const storedUser = await db.User.findOne({
            where: {
                id: member.id
            },
            include: {
                model: db.Bank
            }
        });
        if (!storedUser) return;
        const wallet = storedUser.bank.balance;

        if (bet && wallet < bet || bet == 0) {
            interaction.reply({ content: t.translate('PLAYER_NOT_HAVE_MONEY') });
            return;
        }

        const hit = new ButtonBuilder()
            .setCustomId("hit")
            .setLabel("hit")
            .setStyle(ButtonStyle.Secondary);

        const stand = new ButtonBuilder()
            .setCustomId("stand")
            .setLabel("stand")
            .setStyle(ButtonStyle.Secondary);

        const doubleDown = new ButtonBuilder()
            .setCustomId("double")
            .setLabel("x2 double down")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(hit, stand, doubleDown) as unknown as APIActionRowComponent<APIMessageActionRowComponent>;

        const emojiList = await db.Card.findAll();

        const emojiCode: EmojiCode[] = emojiList.map(emoji => {
            return { emoji: emoji.emoji, value: emoji.value };
        });

        const resolvableEmoji: EmojiCode = { emoji: "false", value: "false" };

        const selectedEmojis: EmojiCode[] = [];

        function getRandomEmoji(list: EmojiCode[]) {
            if (selectedEmojis.length === list.length) {
                return null;
            }

            let randomEmoji: EmojiCode;

            do {
                const randomIndex = Math.floor(Math.random() * list.length);
                randomEmoji = list[randomIndex];
            } while (selectedEmojis.includes(randomEmoji));

            selectedEmojis.push(randomEmoji);

            return randomEmoji;
        }

        function removeLetters(str: string) {
            return Number(str.replace(/[^\d]/g, ''));
        }

        let countHits = 0;
        const firstUserCard = storedPlay? storedPlay.firstPlayerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const secondUserCard = storedPlay? storedPlay.secondPlayerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const thirdUserCard = storedPlay? storedPlay.thirdPlayerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const fourthUserCard = storedPlay? storedPlay.fourthPlayerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const fifthUserCard = storedPlay? storedPlay.fifthPlayerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;

        const firstDealerCard = storedPlay? storedPlay.firstDealerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const secondDealerCard = storedPlay? storedPlay.secondDealerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const thirdDealerCard = storedPlay? storedPlay.thirdDealerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const fourthDealerCard = storedPlay? storedPlay.fourthDealerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;
        const fifthDealerCard = storedPlay? storedPlay.fifthDealerCard : getRandomEmoji(emojiCode) ?? resolvableEmoji;

        const userPlay = storedPlay? storedPlay.userPlay : removeLetters(firstUserCard.emoji) + removeLetters(secondUserCard.emoji);
        const secondUserPlay = storedPlay? storedPlay.secondUserPlay : userPlay + removeLetters(thirdUserCard.emoji);
        const thirdUserPlay = storedPlay? storedPlay.thirdUserPlay : secondUserPlay + removeLetters(fourthUserCard.emoji);
        const fourthUserPlay = storedPlay? storedPlay.fourthUserPlay : thirdUserPlay + removeLetters(fifthUserCard.emoji);

        const dealerPlay = storedPlay? storedPlay.dealerPlay : removeLetters(firstDealerCard.emoji) + removeLetters(secondDealerCard.emoji);
        const secondDealerPlay = storedPlay? storedPlay.secondDealerPlay : dealerPlay + removeLetters(thirdDealerCard.emoji);
        const thirdDealerPlay = storedPlay? storedPlay.thirdDealerPlay : secondDealerPlay + removeLetters(fourthDealerCard.emoji);
        const fourthDealerPlay = storedPlay? storedPlay.fourthDealerPlay : thirdDealerPlay + removeLetters(fifthDealerCard.emoji);

        if (!storedPlay) {
            await db.Blackjack.create({
                bet: bet? bet : wallet,
                dealerPlay: dealerPlay,
                secondDealerPlay: secondDealerPlay,
                thirdDealerPlay: thirdDealerPlay,
                fourthDealerPlay: fourthDealerPlay,
                firstDealerCard: firstDealerCard,
                secondDealerCard: secondDealerCard,
                thirdDealerCard: thirdDealerCard,
                fourthDealerCard: fourthDealerCard,
                fifthDealerCard: fifthDealerCard,

                userPlay: userPlay,
                secondUserPlay: secondUserPlay,
                thirdUserPlay: thirdUserPlay,
                fourthUserPlay: fourthUserPlay,
                firstPlayerCard: firstUserCard,
                secondPlayerCard: secondUserCard,
                thirdPlayerCard: thirdUserCard,
                fourthPlayerCard: fourthUserCard,
                fifthPlayerCard: fifthUserCard,
                userId: member.id
            });
        }

        async function drawPlay({ userWin, firstPlayerCard, secondPlayerCard, thirdDealerCard, fourthPlayerCard, fifthPlayerCard, userPlay, secondUserPlay, thirdUserPlay, fourthUserPlay, firstDealerCard, interaction, secondDealerCard, thirdPlayerCard, fourthDealerCard, fifthDealerCard, dealerPlay, secondDealerPlay, thirdDealerPlay, fourthDealerPlay, continueInteraction, lastPlay, draw }: PlayProps) {
            secondUserPlay = secondUserPlay === undefined ? 0 : secondUserPlay;
            thirdUserPlay = thirdUserPlay === undefined ? 0 : thirdUserPlay;
            fourthUserPlay = fourthUserPlay === undefined ? 0 : fourthUserPlay;

            secondDealerPlay = secondDealerPlay === undefined ? 0 : secondDealerPlay;
            thirdDealerPlay = thirdDealerPlay === undefined ? 0 : thirdDealerPlay;
            fourthDealerPlay = fourthDealerPlay === undefined ? 0 : fourthDealerPlay;
            const userTotalSum = userPlay ? userPlay : 0 + secondUserPlay + thirdUserPlay + fourthUserPlay;
            const dealerTotalSum = dealerPlay ? dealerPlay : 0 + secondDealerPlay + thirdDealerPlay + fourthDealerPlay;

            const draw_translate = {
                UserTotalSum: userTotalSum,
                FirstPlayerCard: firstPlayerCard?.value,
                SecondPlayerCard: secondPlayerCard?.value,
                ThirdPlayerCard: thirdPlayerCard?.value,
                FourthPlayerCard: fourthPlayerCard?.value,
                FifthPlayerCard: fifthPlayerCard?.value,
                DealerTotalSum: dealerTotalSum,
                FirstDealerCard: firstDealerCard?.value,
                SecondDealerCard: secondDealerCard?.value,
                ThirdDealerCard: thirdDealerCard?.value,
                FourthDealerCard: fourthDealerCard?.value,
                FifthDealerCard: fifthDealerCard?.value,
                Profit: bet ? blackjackService.formatedCash(bet) : blackjackService.formatedCash(wallet),
                CurrentBalance: bet ? blackjackService.formatedCash(Number(wallet) + Number(bet)) : blackjackService.formatedCash(wallet * 2)
            };

            if (continueInteraction && lastPlay) {
                const newRow = new ActionRowBuilder().addComponents(stand, doubleDown) as unknown as APIActionRowComponent<APIMessageActionRowComponent>;

                interaction.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder({
                            title: "Blackjack",
                            author: {
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL() || undefined,
                            },
                            description: t.translate('BLACKJACK_PLAY_EMBED', draw_translate)
                        })
                    ], components: [newRow]
                });
                return;
            }

            if (continueInteraction) {
                interaction.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder({
                            title: "Blackjack",
                            author: {
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL() || undefined,
                            },
                            description: t.translate('BLACKJACK_PLAY_EMBED', draw_translate)
                        })
                    ], components: [row]
                });
                return;
            }

            if (draw) {
                await db.Blackjack.destroy({
                    where: {
                        userId: member.id
                    }
                });
                interaction.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder({
                            title: "Blackjack",
                            author: {
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL() || undefined,
                            },
                            description: t.translate('BLACKJACK_DRAW_EMBED', draw_translate)
                        }).setColor(config.colors.yellow as ColorResolvable)
                    ], components: []
                });
                return;
            }

            if (userWin) {
                await blackjackService.blackjackUpdateBalanceWinner(bet, storedUser?.bankId);
                await db.Blackjack.destroy({
                    where: {
                        userId: member.id
                    }
                });
                await gameService.blackjackWin(storedUser?.gameId);
                interaction.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder({
                            title: "Blackjack",
                            author: {
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL() || undefined,
                            },
                            description: t.translate('BLACKJACK_WINNER_EMBED', draw_translate)
                        }).setColor(config.colors.green as ColorResolvable)
                    ], components: []
                });
                return;
            }
            await blackjackService.blackjackUpdateBalanceLoser(bet, storedUser?.bankId);
            await db.Blackjack.destroy({
                where: {
                    userId: member.id
                }
            });
            await gameService.blackjackLoss(storedUser?.gameId);
            interaction.update({
                content: '',
                embeds: [
                    new EmbedBuilder({
                        title: "Blackjack",
                        author: {
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL() || undefined,
                        },
                        description: t.translate('BLACKJACK_LOSER_EMBED', draw_translate)
                    }).setColor(config.colors.red as ColorResolvable)
                ], components: []
            });
            return;
        }

        /**
         * TODO: Make this condition when you fix ace value to variable between 11 and 1.
         */
        // if (userPlay === 21) {
        //     const embed = new EmbedBuilder({
        //         title: "Blackjack",
        //         author: {
        //             name: interaction.user.tag,
        //             iconURL: interaction.user.avatarURL() || undefined,
        //         },
        //         description: `
        //         **You | ${userPlay}**
        //         ${firstUserCard.value} ${secondUserCard.value}
        //         **Dealer | ${removeLetters(firstDealerCard.emoji)}**
        //         ${firstDealerCard.value}

        //         Your profit: ${bet? formatedCash(bet) : formatedCash(wallet)}
        //         Current balance: ${bet? formatedCash(wallet + bet) : formatedCash(wallet*2)}

        //         **WINNER**
        //         `
        //     }).setColor(config.colors.green as ColorResolvable);

        //     return interaction.reply({embeds: [embed.toJSON()]});

        // }

        const embed = new EmbedBuilder({
            title: "Blackjack",
            author: {
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            },
            description: t.translate(storedPlay? "BLACKJACK_BET_PLAY_EMBED":"BLACKJACK_PLAY_EMBED", {
                UserTotalSum: userPlay,
                FirstPlayerCard: firstUserCard.value,
                SecondPlayerCard: secondUserCard.value,
                DealerTotalSum: removeLetters(firstDealerCard.emoji),
                FirstDealerCard: firstDealerCard.value,
                Bet: blackjackService.formatedCash(storedPlay?.bet)
            })
        });
        const msg = await interaction.reply({ content: storedPlay? t.translate("BLACKJACK_CONTINUE_PLAY_MESSAGE") : "" , embeds: [embed.toJSON()], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button
        });

        collector.on('collect', async (buttonInteraction) => {

            const lastMessageId = interaction.channel?.lastMessageId;
            const buttonInteracionMessageId = buttonInteraction.message.id;

            if (lastMessageId !== buttonInteracionMessageId) {
                buttonInteraction.update({ content: t.translate('GENERIC_INVALID_COMMAND_INTERACTION'), embeds: [], components: [] });
                return;
            }

            const { user } = buttonInteraction;

            if (user.id != member.id) {
                return;
            }

            switch (buttonInteraction.customId) {
                case 'hit':
                    countHits += 1;
                    if (countHits >= 3) {
                        if (fourthUserPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,
                                dealerPlay: removeLetters(firstDealerCard.emoji),
                                firstDealerCard: firstDealerCard
                            });
                            break;
                        }
                        if (fourthUserPlay == 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,
                                dealerPlay: removeLetters(firstDealerCard.emoji),
                                firstDealerCard: firstDealerCard
                            });
                            break;
                        }
                        drawPlay({
                            interaction: buttonInteraction,
                            continueInteraction: true,
                            lastPlay: true,
                            fourthUserPlay: fourthUserPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            thirdPlayerCard: thirdUserCard,
                            fourthPlayerCard: fourthUserCard,
                            fifthPlayerCard: fifthUserCard,
                            dealerPlay: removeLetters(firstDealerCard.emoji),
                            firstDealerCard: firstDealerCard
                        });
                        break;
                    }
                    if (countHits == 2) {
                        if (thirdUserPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                dealerPlay: removeLetters(firstDealerCard.emoji),
                                firstDealerCard: firstDealerCard
                            });
                            break;
                        }
                        if (thirdUserPlay == 21) {

                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                dealerPlay: removeLetters(firstDealerCard.emoji),
                                firstDealerCard: firstDealerCard
                            });
                            break;
                        }
                        drawPlay({
                            interaction: buttonInteraction,
                            continueInteraction: true,
                            thirdUserPlay: thirdUserPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            thirdPlayerCard: thirdUserCard,
                            fourthPlayerCard: fourthUserCard,
                            dealerPlay: removeLetters(firstDealerCard.emoji),
                            firstDealerCard: firstDealerCard
                        });
                        break;
                    }
                    if (secondUserPlay > 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: false,
                            secondUserPlay: secondUserPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            thirdPlayerCard: thirdUserCard,
                            dealerPlay: removeLetters(firstDealerCard.emoji),
                            firstDealerCard: firstDealerCard
                        });
                        break;
                    }
                    if (secondUserPlay == 21) {

                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: true,
                            secondUserPlay: secondUserPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            thirdPlayerCard: thirdUserCard,
                            dealerPlay: removeLetters(firstDealerCard.emoji),
                            firstDealerCard: firstDealerCard
                        });
                        break;
                    }
                    drawPlay({
                        interaction: buttonInteraction,
                        continueInteraction: true,
                        secondUserPlay: secondUserPlay,
                        firstPlayerCard: firstUserCard,
                        secondPlayerCard: secondUserCard,
                        thirdPlayerCard: thirdUserCard,
                        dealerPlay: removeLetters(firstDealerCard.emoji),
                        firstDealerCard: firstDealerCard
                    });
                    break;

                case 'stand':
                    if (countHits === 3) {
                        if (dealerPlay > fourthUserPlay && dealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard
                            });
                            break;
                        }
                        if (dealerPlay == fourthDealerPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard
                            });
                            break;
                        }
                        if (dealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard
                            });
                            break;
                        }
                        if (secondDealerPlay > fourthUserPlay && secondDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                            });
                            break;
                        }
                        if (secondDealerPlay == fourthUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                            });
                            break;
                        }
                        if (secondDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                            });
                            break;
                        }
                        if (thirdDealerPlay > fourthUserPlay && thirdDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                            });
                            break;
                        }
                        if (thirdDealerPlay == fourthUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                            });
                            break;
                        }
                        if (thirdDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                            });
                            break;
                        }
                        if (fourthDealerPlay > fourthUserPlay && fourthDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay == fourthUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                fourthUserPlay: fourthUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                fifthPlayerCard: fifthUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: true,
                            fourthUserPlay: fourthUserPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            thirdPlayerCard: thirdUserCard,
                            fourthPlayerCard: fourthUserCard,
                            fifthPlayerCard: fifthUserCard,

                            fourthDealerPlay: fourthDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard,
                            fifthDealerCard: fifthDealerCard
                        });
                        break;
                    }
                    if (countHits === 2) {
                        if (dealerPlay > thirdUserPlay && dealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                            });
                            break;
                        }
                        if (dealerPlay == thirdUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                            });
                            break;
                        }
                        if (dealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                            });
                            break;
                        }
                        if (secondDealerPlay > thirdUserPlay && secondDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard
                            });
                            break;
                        }
                        if (secondDealerPlay == thirdUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard
                            });
                            break;
                        }
                        if (secondDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard
                            });
                            break;
                        }
                        if (thirdDealerPlay > thirdUserPlay && thirdDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard
                            });
                            break;
                        }
                        if (thirdDealerPlay == thirdUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard
                            });
                            break;
                        }
                        if (thirdDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,
                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay > thirdUserPlay && fourthDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay == thirdUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                thirdUserPlay: thirdUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                fourthPlayerCard: fourthUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: true,
                            thirdUserPlay: thirdUserPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            thirdPlayerCard: thirdUserCard,
                            fourthPlayerCard: fourthUserCard,

                            fourthDealerPlay: fourthDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard,
                            fifthDealerCard: fifthDealerCard
                        });
                        break;
                    }
                    if (countHits === 1) {
                        // aqui o dealer vai ganhar de primeira jogada
                        if (dealerPlay > secondUserPlay && dealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard
                            });
                            break;
                        }
                        if (dealerPlay == secondUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                dealerPlay: dealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard
                            });
                            break;
                        }
                        if (secondDealerPlay > secondUserPlay && secondDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                thirdPlayerCard: thirdUserCard,
                                secondPlayerCard: secondUserCard,
                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard
                            });
                            break;
                        }
                        if (secondDealerPlay == secondUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                thirdPlayerCard: thirdUserCard,
                                secondPlayerCard: secondUserCard,
                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard
                            });
                            break;
                        }
                        if (secondDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                secondDealerPlay: secondDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard
                            });
                            break;
                        }
                        if (thirdDealerPlay > secondUserPlay && thirdDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard
                            });
                            break;
                        }
                        if (thirdDealerPlay == secondUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                thirdDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard
                            });
                            break;
                        }
                        if (thirdDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,
                                secondDealerPlay: thirdDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay > secondUserPlay && fourthDealerPlay <= 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: false,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay == secondUserPlay) {
                            drawPlay({
                                interaction: buttonInteraction,
                                draw: true,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        if (fourthDealerPlay > 21) {
                            drawPlay({
                                interaction: buttonInteraction,
                                userWin: true,
                                secondUserPlay: secondUserPlay,
                                firstPlayerCard: firstUserCard,
                                secondPlayerCard: secondUserCard,
                                thirdPlayerCard: thirdUserCard,

                                fourthDealerPlay: fourthDealerPlay,
                                firstDealerCard: firstDealerCard,
                                secondDealerCard: secondDealerCard,
                                thirdDealerCard: thirdDealerCard,
                                fourthDealerCard: fourthDealerCard,
                                fifthDealerCard: fifthDealerCard
                            });
                            break;
                        }
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: true,
                            secondUserPlay: secondUserPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            thirdPlayerCard: thirdUserCard,

                            fourthDealerPlay: fourthDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard,
                            fifthDealerCard: fifthDealerCard
                        });
                        break;
                    }
                    // aqui o dealer vai ganhar de primeira jogada
                    if (dealerPlay > userPlay && dealerPlay <= 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: false,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            dealerPlay: dealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard
                        });
                        break;
                    }
                    if (dealerPlay == userPlay) {
                        drawPlay({
                            interaction: buttonInteraction,
                            draw: true,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            dealerPlay: dealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard
                        });
                        break;
                    }
                    if (secondDealerPlay > userPlay && secondDealerPlay <= 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: false,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            secondDealerPlay: secondDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard
                        });
                        break;
                    }
                    if (secondDealerPlay == userPlay) {
                        drawPlay({
                            interaction: buttonInteraction,
                            draw: true,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            secondDealerPlay: secondDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard
                        });
                        break;
                    }
                    if (secondDealerPlay > 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: true,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,
                            secondDealerPlay: secondDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard
                        });
                        break;
                    }
                    if (thirdDealerPlay > userPlay && thirdDealerPlay <= 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: false,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,

                            secondDealerPlay: thirdDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard
                        });
                        break;
                    }
                    if (thirdDealerPlay == userPlay) {
                        drawPlay({
                            interaction: buttonInteraction,
                            draw: true,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,

                            secondDealerPlay: thirdDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard
                        });
                        break;
                    }
                    if (thirdDealerPlay > 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: true,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,

                            secondDealerPlay: thirdDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard
                        });
                        break;
                    }
                    if (fourthDealerPlay > userPlay && fourthDealerPlay <= 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: false,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,

                            fourthDealerPlay: fourthDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard,
                            fifthDealerCard: fifthDealerCard
                        });
                        break;
                    }
                    if (fourthDealerPlay == userPlay) {
                        drawPlay({
                            interaction: buttonInteraction,
                            draw: true,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,

                            fourthDealerPlay: fourthDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard,
                            fifthDealerCard: fifthDealerCard
                        });
                        break;
                    }
                    if (fourthDealerPlay > 21) {
                        drawPlay({
                            interaction: buttonInteraction,
                            userWin: true,
                            userPlay: userPlay,
                            firstPlayerCard: firstUserCard,
                            secondPlayerCard: secondUserCard,

                            fourthDealerPlay: fourthDealerPlay,
                            firstDealerCard: firstDealerCard,
                            secondDealerCard: secondDealerCard,
                            thirdDealerCard: thirdDealerCard,
                            fourthDealerCard: fourthDealerCard,
                            fifthDealerCard: fifthDealerCard
                        });
                        break;
                    }
                    drawPlay({
                        interaction: buttonInteraction,
                        userWin: true,
                        userPlay: userPlay,
                        firstPlayerCard: firstUserCard,
                        secondPlayerCard: secondUserCard,

                        fourthDealerPlay: fourthDealerPlay,
                        firstDealerCard: firstDealerCard,
                        secondDealerCard: secondDealerCard,
                        thirdDealerCard: thirdDealerCard,
                        fourthDealerCard: fourthDealerCard,
                        fifthDealerCard: fifthDealerCard
                    });
                    break;
                case 'double':
                    buttonInteraction.update({ content: "clicou no double" });
                    break;
            }
        });
    }
});
