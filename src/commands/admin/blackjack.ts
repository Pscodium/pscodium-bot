/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ColorResolvable, CommandInteraction, ComponentType, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";

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
    async run({ interaction, options }) {

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
        const wallet = parseFloat(String(storedUser.bank.balance));

        if (bet && wallet < bet || bet == 0) {
            interaction.reply({ content: "Você tem que ter dinheiro na carteira para jogar." });
            return;
        }

        const hit = new ButtonBuilder({
            customId: "hit",
            label: "hit",
            style: ButtonStyle.Secondary
        });

        const stand = new ButtonBuilder({
            customId: "stand",
            label: "stand",
            style: ButtonStyle.Secondary
        });

        const doubleDown = new ButtonBuilder({
            customId: "double",
            label: "x2 double down",
            style: ButtonStyle.Secondary
        });

        const row = new ActionRowBuilder<ButtonBuilder>({
            components: [ hit, stand, doubleDown ]
        });

        const emojiList = await db.Emoji.findAll();

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

        function formatedCash(amount: number | undefined) {
            if (!amount) return;
            let formated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            if (Number(formated) >= 100) {
                formated = formated.replace(',', '.');
            }
            return formated;
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

            if (continueInteraction && lastPlay) {
                const newRow = new ActionRowBuilder<ButtonBuilder>({
                    components: [ stand, doubleDown ]
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
                            description: `
                        **You | ${userTotalSum}**
                        ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard ? thirdPlayerCard.value : ''} ${fourthPlayerCard ? fourthPlayerCard.value : ''} ${fifthPlayerCard ? fifthPlayerCard.value : ''}
                        **Dealer | ${dealerTotalSum}**
                        ${firstDealerCard?.value} ${secondDealerCard ? secondDealerCard.value : ''} ${thirdDealerCard ? thirdDealerCard.value : ''} ${fourthDealerCard ? fourthDealerCard.value : ''} ${fifthDealerCard ? fifthDealerCard.value : ''}
                        `
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
                            description: `
                        **You | ${userTotalSum}**
                        ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard ? thirdPlayerCard.value : ''} ${fourthPlayerCard ? fourthPlayerCard.value : ''} ${fifthPlayerCard ? fifthPlayerCard.value : ''}
                        **Dealer | ${dealerTotalSum}**
                        ${firstDealerCard?.value} ${secondDealerCard ? secondDealerCard.value : ''} ${thirdDealerCard ? thirdDealerCard.value : ''} ${fourthDealerCard ? fourthDealerCard.value : ''} ${fifthDealerCard ? fifthDealerCard.value : ''}
                        `
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
                            description: `
                        **You | ${userTotalSum}**
                        ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard ? thirdPlayerCard.value : ''} ${fourthPlayerCard ? fourthPlayerCard.value : ''} ${fifthPlayerCard ? fifthPlayerCard.value : ''}
                        **Dealer | ${dealerTotalSum}**
                        ${firstDealerCard?.value} ${secondDealerCard ? secondDealerCard.value : ''} ${thirdDealerCard ? thirdDealerCard.value : ''} ${fourthDealerCard ? fourthDealerCard.value : ''} ${fifthDealerCard ? fifthDealerCard.value : ''}

                        You had no gains or losses.

                        **DRAW**
                        `
                        }).setColor(config.colors.yellow as ColorResolvable)
                    ], components: []
                });
                return;
            }

            if (userWin) {
                await db.Bank.update({
                    balance: bet ? wallet + bet : wallet * 2
                }, {
                    where: { id: storedUser?.bankId }
                });
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
                            description: `
                        **You | ${userTotalSum}**
                        ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard ? thirdPlayerCard.value : ''} ${fourthPlayerCard ? fourthPlayerCard.value : ''} ${fifthPlayerCard ? fifthPlayerCard.value : ''}
                        **Dealer | ${dealerTotalSum}**
                        ${firstDealerCard?.value} ${secondDealerCard ? secondDealerCard.value : ''} ${thirdDealerCard ? thirdDealerCard.value : ''} ${fourthDealerCard ? fourthDealerCard.value : ''} ${fifthDealerCard ? fifthDealerCard.value : ''}

                        Your profit: ${bet ? formatedCash(bet) : formatedCash(wallet)}
                        Current balance: ${bet ? formatedCash(wallet + bet) : formatedCash(wallet * 2)}

                        **WINNER**
                        `
                        }).setColor(config.colors.green as ColorResolvable)
                    ], components: []
                });
                return;
            }

            await db.Bank.update({
                balance: bet ? wallet - bet : 0
            }, {
                where: { id: storedUser?.bankId }
            });

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
                        description: `
                    **You | ${userTotalSum}**
                    ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard ? thirdPlayerCard.value : ''} ${fourthPlayerCard ? fourthPlayerCard.value : ''} ${fifthPlayerCard ? fifthPlayerCard.value : ''}
                    **Dealer | ${dealerTotalSum}**
                    ${firstDealerCard?.value} ${secondDealerCard ? secondDealerCard.value : ''} ${thirdDealerCard ? thirdDealerCard.value : ''} ${fourthDealerCard ? fourthDealerCard.value : ''} ${fifthDealerCard ? fifthDealerCard.value : ''}

                    You loss: ${bet ? formatedCash(bet) : formatedCash(wallet)}
                    Current balance: ${bet ? formatedCash(wallet - bet) : formatedCash(0)}

                    **LOSE**
                    `
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

        //     return interaction.reply({embeds: [embed]});

        // }

        const embed = new EmbedBuilder({
            title: "Blackjack",
            author: {
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            },
            description: `
            **You | ${userPlay}**
            ${firstUserCard.value} ${secondUserCard.value}
            **Dealer | ${removeLetters(firstDealerCard.emoji)}**
            ${firstDealerCard.value}

            ${storedPlay? "**Bet:** "+ formatedCash(parseFloat(String(storedPlay.bet))) : ''}
            `
        });
        const msg = await interaction.reply({ content: storedPlay? `Continue sua jogada anterior...` : "" , embeds: [embed], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button
        });

        collector.on('collect', async (buttonInteraction) => {

            const lastMessageId = interaction.channel?.lastMessageId;
            const buttonInteracionMessageId = buttonInteraction.message.id;

            if (lastMessageId !== buttonInteracionMessageId) {
                buttonInteraction.update({ content: "Por favor, interaja apenas com o comando atual...", embeds: [], components: [] });
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
