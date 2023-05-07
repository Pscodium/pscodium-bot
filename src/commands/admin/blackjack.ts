/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ColorResolvable, ComponentType, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";

interface PlayProps {
    countHits?: number;
    continueInteraction?: boolean;

    firstPlayerCard?: EmojiCode;
    secondPlayerCard?: EmojiCode;
    thirdPlayerCard?: EmojiCode;
    fourthPlayerCard?: EmojiCode;

    userPlay?: number;
    secondUserPlay?: number;
    thirdUserPlay?: number;

    firstDealerCard?: EmojiCode;
    secondDealerCard?: EmojiCode;
    thirdDealerCard?: EmojiCode;
    fourthDealerCard?: EmojiCode;

    dealerPlay?: number;
    secondDealerPlay?: number;
    thirdDealerPlay?: number;

    userWin?: boolean;
    interaction: ButtonInteraction<CacheType>
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
    async run({interaction, options}) {

        const member = interaction.user;
        const bet = options.getNumber('bet');

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

        const row = new ActionRowBuilder<ButtonBuilder>({ components: [
            new ButtonBuilder({
                customId: "hit",
                label: "hit",
                style: ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                customId: "stand",
                label: "stand",
                style :ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                customId: "double",
                label: "x2 double down",
                style :ButtonStyle.Secondary
            })
        ]});

        const emojiList = await db.Emoji.findAll();

        const emojiCode: EmojiCode[] = emojiList.map(emoji => {
            return { emoji: emoji.emoji, value: emoji.value };
        });

        function getRandomEmoji(list: EmojiCode[]) {
            const randomIndex = Math.floor(Math.random() * list.length);
            return list[randomIndex];
        }

        function removeLetters(str: string) {
            return Number(str.replace(/[^\d]/g, ''));
        }

        function formatedCash(amount: number) {
            let formated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            if(Number(formated) >= 100) {
                formated = formated.replace(',', '.');
            }
            return formated;
        }

        const firstUserCard = getRandomEmoji(emojiCode);
        const secondUserCard = getRandomEmoji(emojiCode);
        const thirdUserCard = getRandomEmoji(emojiCode);
        const fourthUserCard = getRandomEmoji(emojiCode);

        const firstDealerCard = getRandomEmoji(emojiCode);
        const secondDealerCard = getRandomEmoji(emojiCode);
        const thirdDealerCard = getRandomEmoji(emojiCode);
        const fourthDealerCard = getRandomEmoji(emojiCode);

        const userPlay = removeLetters(firstUserCard.emoji) + removeLetters(secondUserCard.emoji);
        const secondUserPlay = userPlay + removeLetters(thirdUserCard.emoji);
        const thirdUserPlay = secondUserPlay + removeLetters(fourthUserCard.emoji);

        const dealerPlay = removeLetters(firstDealerCard.emoji) + removeLetters(secondDealerCard.emoji);
        const secondDealerPlay = dealerPlay + removeLetters(thirdDealerCard.emoji);
        const thirdDealerPlay = secondDealerPlay + removeLetters(fourthDealerCard.emoji);

        async function drawPlay({ userWin, firstPlayerCard, secondPlayerCard, thirdDealerCard,fourthPlayerCard, userPlay, secondUserPlay, thirdUserPlay, firstDealerCard, interaction,secondDealerCard, thirdPlayerCard, fourthDealerCard, dealerPlay, secondDealerPlay, thirdDealerPlay, continueInteraction }: PlayProps) {
            secondUserPlay = secondUserPlay === undefined ? 0 : secondUserPlay;
            thirdUserPlay = thirdUserPlay === undefined ? 0 : thirdUserPlay;

            secondDealerPlay = secondDealerPlay === undefined ? 0 : secondDealerPlay;
            thirdDealerPlay = thirdDealerPlay === undefined ? 0 : thirdDealerPlay;
            const userTotalSum = userPlay? userPlay: 0 + secondUserPlay + thirdUserPlay;
            const dealerTotalSum = dealerPlay? dealerPlay: 0 + secondDealerPlay + thirdDealerPlay;

            if (continueInteraction) {
                interaction.update({ embeds: [
                    new EmbedBuilder({
                        title: "Blackjack",
                        author: {
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL() || undefined,
                        },
                        description: `
                        **You | ${userTotalSum}**
                        ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard? thirdPlayerCard.value : ''} ${fourthPlayerCard? fourthPlayerCard.value : ''}
                        **Dealer | ${dealerTotalSum}**
                        ${firstDealerCard?.value} ${secondDealerCard? secondDealerCard.value : ''} ${thirdDealerCard? thirdDealerCard.value : ''} ${fourthDealerCard? fourthDealerCard.value : ''}
                        `
                    })
                ], components: [row] });
                return;
            }

            if (userWin) {
                await db.Bank.update({
                    balance: bet? wallet + bet : wallet*2
                }, {
                    where: { id: storedUser?.bankId }
                });

                interaction.update({ embeds: [
                    new EmbedBuilder({
                        title: "Blackjack",
                        author: {
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL() || undefined,
                        },
                        description: `
                        **You | ${userTotalSum}**
                        ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard? thirdPlayerCard.value : ''} ${fourthPlayerCard? fourthPlayerCard.value : ''}
                        **Dealer | ${dealerTotalSum}**
                        ${firstDealerCard?.value} ${secondDealerCard? secondDealerCard.value : ''} ${thirdDealerCard? thirdDealerCard.value : ''} ${fourthDealerCard? fourthDealerCard.value : ''}

                        Your profit: ${bet? formatedCash(bet) : formatedCash(wallet)}
                        Current balance: ${bet? formatedCash(wallet + bet) : formatedCash(wallet*2)}

                        **WINNER**
                        `
                    }).setColor(config.colors.green as ColorResolvable)
                ], components: [] });
                return;
            }

            await db.Bank.update({
                balance: bet? wallet - bet : 0
            }, {
                where: { id: storedUser?.bankId }
            });

            interaction.update({ embeds: [
                new EmbedBuilder({
                    title: "Blackjack",
                    author: {
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL() || undefined,
                    },
                    description: `
                    **You | ${userTotalSum}**
                    ${firstPlayerCard?.value} ${secondPlayerCard?.value} ${thirdPlayerCard? thirdPlayerCard.value : ''} ${fourthPlayerCard? fourthPlayerCard.value : ''}
                    **Dealer | ${dealerTotalSum}**
                    ${firstDealerCard?.value} ${secondDealerCard? secondDealerCard.value : ''} ${thirdDealerCard? thirdDealerCard.value : ''} ${fourthDealerCard? fourthDealerCard.value : ''}

                    You loss: ${bet? formatedCash(bet) : formatedCash(wallet)}
                    Current balance: ${bet? formatedCash(wallet - bet) : formatedCash(0)}

                    **LOSE**
                    `
                }).setColor(config.colors.red as ColorResolvable)
            ], components: [] });
            return;
        }

        let countHits = 0;

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
            `
        });
        const msg = await interaction.reply({embeds: [embed], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (buttonInteraction) => {
            const { user } = buttonInteraction;

            if (user.id != member.id) {
                return;
            }

            switch (buttonInteraction.customId) {
                case 'hit':
                    countHits += 1;
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
                    if (countHits >= 2) {
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
                    break;

                case 'double':
                    buttonInteraction.update({ content: "clicou no double"});
                    break;

            }

        });
    }
});
