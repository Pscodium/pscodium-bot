/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, ComponentType, EmbedBuilder } from "discord.js";
import { config } from "../..";
import { db } from "../../data-source";
import { Command } from "../../structs/types/Command";
import { blackjackService } from "../../services/blackjack.service";
import { gameService } from "../../services/games.service";
interface EmojiCode {
    emoji: string;
    value: string;
}

interface GameState {
    playerCards: EmojiCode[];
    dealerCards: EmojiCode[];
    playerScores: number[];
    dealerScores: number[];
    countHits: number;
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
            where: { userId: member.id }
        });
        
        const bet = storedPlay ? Number(storedPlay.bet) : options.getNumber('bet');
        const storedUser = await db.User.findOne({
            where: { id: member.id },
            include: { model: db.Bank }
        });
        
        if (!storedUser) return;
        const wallet = storedUser.bank.balance;
        
        
        if (bet && wallet < bet || Number(wallet) === 0) {
            interaction.reply({ content: t.translate('PLAYER_NOT_HAVE_MONEY') });
            return;
        }


        const createButtons = (isLastPlay = false) => {
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

            return new ActionRowBuilder<ButtonBuilder>()
                .addComponents(isLastPlay ? [stand, doubleDown] : [hit, stand, doubleDown]);
        };

        const emojiList = await db.Card.findAll();
        const emojiCode: EmojiCode[] = emojiList.map(emoji => ({
            emoji: emoji.emoji,
            value: emoji.value
        }));

        const selectedEmojis: EmojiCode[] = [];
        const getRandomEmoji = (list: EmojiCode[]) => {
            if (selectedEmojis.length === list.length) return null;
            
            let randomEmoji: EmojiCode;
            do {
                randomEmoji = list[Math.floor(Math.random() * list.length)];
            } while (selectedEmojis.includes(randomEmoji));
            
            selectedEmojis.push(randomEmoji);
            return randomEmoji;
        };

        const removeLetters = (str: string) => Number(str.replace(/[^\d]/g, ''));

        const initGameState = (): GameState => {
            const resolvableEmoji: EmojiCode = { emoji: "false", value: "false" };
            
            const playerCards = [
                storedPlay?.firstPlayerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.secondPlayerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.thirdPlayerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.fourthPlayerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.fifthPlayerCard || getRandomEmoji(emojiCode) || resolvableEmoji
            ];

            const dealerCards = [
                storedPlay?.firstDealerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.secondDealerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.thirdDealerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.fourthDealerCard || getRandomEmoji(emojiCode) || resolvableEmoji,
                storedPlay?.fifthDealerCard || getRandomEmoji(emojiCode) || resolvableEmoji
            ];

            const playerScores = [
                storedPlay?.userPlay || removeLetters(playerCards[0].emoji) + removeLetters(playerCards[1].emoji),
                0, 0, 0
            ];
            playerScores[1] = storedPlay?.secondUserPlay || playerScores[0] + removeLetters(playerCards[2].emoji);
            playerScores[2] = storedPlay?.thirdUserPlay || playerScores[1] + removeLetters(playerCards[3].emoji);
            playerScores[3] = storedPlay?.fourthUserPlay || playerScores[2] + removeLetters(playerCards[4].emoji);

            const dealerScores = [
                storedPlay?.dealerPlay || removeLetters(dealerCards[0].emoji) + removeLetters(dealerCards[1].emoji),
                0, 0, 0
            ];
            dealerScores[1] = storedPlay?.secondDealerPlay || dealerScores[0] + removeLetters(dealerCards[2].emoji);
            dealerScores[2] = storedPlay?.thirdDealerPlay || dealerScores[1] + removeLetters(dealerCards[3].emoji);
            dealerScores[3] = storedPlay?.fourthDealerPlay || dealerScores[2] + removeLetters(dealerCards[4].emoji);

            return {
                playerCards,
                dealerCards,
                playerScores,
                dealerScores,
                countHits: 0
            };
        };

        const gameState = initGameState();

        if (!storedPlay) {
            await db.Blackjack.create({
                bet: bet || wallet,
                dealerPlay: gameState.dealerScores[0],
                secondDealerPlay: gameState.dealerScores[1],
                thirdDealerPlay: gameState.dealerScores[2],
                fourthDealerPlay: gameState.dealerScores[3],
                firstDealerCard: gameState.dealerCards[0],
                secondDealerCard: gameState.dealerCards[1],
                thirdDealerCard: gameState.dealerCards[2],
                fourthDealerCard: gameState.dealerCards[3],
                fifthDealerCard: gameState.dealerCards[4],
                userPlay: gameState.playerScores[0],
                secondUserPlay: gameState.playerScores[1],
                thirdUserPlay: gameState.playerScores[2],
                fourthUserPlay: gameState.playerScores[3],
                firstPlayerCard: gameState.playerCards[0],
                secondPlayerCard: gameState.playerCards[1],
                thirdPlayerCard: gameState.playerCards[2],
                fourthPlayerCard: gameState.playerCards[3],
                fifthPlayerCard: gameState.playerCards[4],
                userId: member.id
            });
        }

        const createDrawTranslate = (playerCardsCount: number, dealerCardsCount: number, playerScore: number, dealerScore: number, win?: boolean) => {
            let currentBalance = wallet;

            if (win) {
                currentBalance = bet? Number(currentBalance) + Number(bet) : Number(currentBalance) * 2;
            } else {
                currentBalance = bet ? Number(currentBalance) - Number(bet) : 0;
            }

            const translate: any = {
                UserTotalSum: playerScore,
                DealerTotalSum: dealerScore,
                Profit: bet ? blackjackService.formatedCash(bet) : blackjackService.formatedCash(wallet),
                CurrentBalance: blackjackService.formatedCash(currentBalance)
            };

            const playerCardNames = ['FirstPlayerCard', 'SecondPlayerCard', 'ThirdPlayerCard', 'FourthPlayerCard', 'FifthPlayerCard'];
            for (let i = 0; i < playerCardsCount && i < 5; i++) {
                translate[playerCardNames[i]] = gameState.playerCards[i]?.value;
            }

            const dealerCardNames = ['FirstDealerCard', 'SecondDealerCard', 'ThirdDealerCard', 'FourthDealerCard', 'FifthDealerCard'];
            for (let i = 0; i < dealerCardsCount && i < 5; i++) {
                translate[dealerCardNames[i]] = gameState.dealerCards[i]?.value;
            }

            return translate;
        };

        const endGame = async (userWin: boolean, isDraw: boolean, playerScore: number, dealerScore: number, playerCardsCount: number, dealerCardsCount: number) => {
            const draw_translate = createDrawTranslate(playerCardsCount, dealerCardsCount, playerScore, dealerScore, userWin);

            if (isDraw) {
                await db.Blackjack.destroy({ where: { userId: member.id } });
                return {
                    embed: new EmbedBuilder({
                        title: "Blackjack",
                        author: {
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL() || undefined,
                        },
                        description: t.translate('BLACKJACK_DRAW_EMBED', draw_translate)
                    }).setColor(config.colors.yellow as ColorResolvable),
                    components: []
                };
            }

            if (userWin) {
                await blackjackService.blackjackUpdateBalanceWinner(bet, storedUser?.bankId);
                await gameService.blackjackWin(storedUser?.gameId);
            } else {
                await blackjackService.blackjackUpdateBalanceLoser(bet, storedUser?.bankId);
                await gameService.blackjackLoss(storedUser?.gameId);
            }

            await db.Blackjack.destroy({ where: { userId: member.id } });

            return {
                embed: new EmbedBuilder({
                    title: "Blackjack",
                    author: {
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL() || undefined,
                    },
                    description: t.translate(userWin ? 'BLACKJACK_WINNER_EMBED' : 'BLACKJACK_LOSER_EMBED', draw_translate)
                }).setColor(userWin ? config.colors.green as ColorResolvable : config.colors.red as ColorResolvable),
                components: []
            };
        };

        const compareScores = (playerScore: number, dealerScores: number[], _playerCardsCount: number) => {
            for (let i = 0; i < dealerScores.length; i++) {
                const dealerScore = dealerScores[i];
                const dealerCardsCount = i + 2;
                
                if (dealerScore > playerScore && dealerScore <= 21) {
                    return { userWin: false, isDraw: false, finalDealerScore: dealerScore, dealerCardsCount };
                }
                if (dealerScore === playerScore) {
                    return { userWin: false, isDraw: true, finalDealerScore: dealerScore, dealerCardsCount };
                }
                if (dealerScore > 21) {
                    return { userWin: true, isDraw: false, finalDealerScore: dealerScore, dealerCardsCount };
                }
            }
            return { userWin: true, isDraw: false, finalDealerScore: dealerScores[dealerScores.length - 1], dealerCardsCount: dealerScores.length + 1 };
        };

        const handleHit = async (buttonInteraction: ButtonInteraction) => {
            gameState.countHits += 1;
            const currentPlayerScore = gameState.playerScores[gameState.countHits];
            const playerCardsCount = gameState.countHits + 2;
            
            if (currentPlayerScore > 21) {
                const result = await endGame(false, false, currentPlayerScore, removeLetters(gameState.dealerCards[0].emoji), playerCardsCount, 1);
                return buttonInteraction.update({
                    content: '',
                    embeds: [result.embed],
                    components: result.components
                });
            }

            if (currentPlayerScore === 21) {
                const result = await endGame(true, false, currentPlayerScore, removeLetters(gameState.dealerCards[0].emoji), playerCardsCount, 1);
                return buttonInteraction.update({
                    content: '',
                    embeds: [result.embed],
                    components: result.components
                });
            }

            const isLastPlay = gameState.countHits >= 3;
            const draw_translate = createDrawTranslate(playerCardsCount, 1, currentPlayerScore, removeLetters(gameState.dealerCards[0].emoji));

            buttonInteraction.update({
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
                ],
                components: [createButtons(isLastPlay)]
            });
        };

        const handleStand = async (buttonInteraction: ButtonInteraction) => {
            const currentPlayerScore = gameState.playerScores[gameState.countHits];
            const playerCardsCount = gameState.countHits + 2;
            const { userWin, isDraw, finalDealerScore, dealerCardsCount } = compareScores(currentPlayerScore, gameState.dealerScores, playerCardsCount);
            
            const result = await endGame(userWin, isDraw, currentPlayerScore, finalDealerScore, playerCardsCount, dealerCardsCount);
            buttonInteraction.update({
                content: '',
                embeds: [result.embed],
                components: result.components
            });
        };

        const embed = new EmbedBuilder({
            title: "Blackjack",
            author: {
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL() || undefined,
            },
            description: t.translate(storedPlay ? "BLACKJACK_BET_PLAY_EMBED" : "BLACKJACK_PLAY_EMBED", {
                UserTotalSum: gameState.playerScores[0],
                FirstPlayerCard: gameState.playerCards[0].value,
                SecondPlayerCard: gameState.playerCards[1].value,
                DealerTotalSum: removeLetters(gameState.dealerCards[0].emoji),
                FirstDealerCard: gameState.dealerCards[0].value,
                Bet: blackjackService.formatedCash(storedPlay?.bet)
            })
        });

        const msg = await interaction.reply({
            content: storedPlay ? t.translate("BLACKJACK_CONTINUE_PLAY_MESSAGE") : "",
            embeds: [embed.toJSON()],
            components: [createButtons()],
            fetchReply: true
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button
        });

        collector.on('collect', async (buttonInteraction) => {
            const lastMessageId = interaction.channel?.lastMessageId;
            const buttonInteracionMessageId = buttonInteraction.message.id;

            if (lastMessageId !== buttonInteracionMessageId) {
                buttonInteraction.update({ 
                    content: t.translate('GENERIC_INVALID_COMMAND_INTERACTION'), 
                    embeds: [], 
                    components: [] 
                });
                return;
            }

            if (buttonInteraction.user.id !== member.id) return;

            switch (buttonInteraction.customId) {
                case 'hit':
                    await handleHit(buttonInteraction);
                    break;
                case 'stand':
                    await handleStand(buttonInteraction);
                    break;
                case 'double':
                    buttonInteraction.update({ content: "clicou no double" });
                    break;
            }
        });
    }
});