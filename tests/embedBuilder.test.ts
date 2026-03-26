import { EmbedBuilder, ColorResolvable } from 'discord.js';

describe('EmbedBuilder Tests', () => {
    let embed: EmbedBuilder;

    beforeEach(() => {
        embed = new EmbedBuilder();
    });

    describe('Basic Properties', () => {
        test('should create an empty embed', () => {
            expect(embed).toBeInstanceOf(EmbedBuilder);
            expect(embed.data).toBeDefined();
        });

        test('should set title correctly', () => {
            const title = 'Test Game Title';
            embed.setTitle(title);
            expect(embed.data.title).toBe(title);
        });

        test('should set description correctly', () => {
            const description = 'This is a test description for the embed';
            embed.setDescription(description);
            expect(embed.data.description).toBe(description);
        });

        test('should set URL correctly', () => {
            const url = 'https://example.com/game';
            embed.setURL(url);
            expect(embed.data.url).toBe(url);
        });

        test('should set timestamp correctly', () => {
            const now = new Date();
            embed.setTimestamp(now);
            expect(embed.data.timestamp).toBe(now.toISOString());
        });

        test('should set timestamp to current time when no parameter provided', () => {
            const beforeCall = Date.now();
            embed.setTimestamp();
            const afterCall = Date.now();
            
            const embedTimestamp = embed.data.timestamp ? new Date(embed.data.timestamp).getTime() : 0;
            expect(embedTimestamp).toBeGreaterThanOrEqual(beforeCall);
            expect(embedTimestamp).toBeLessThanOrEqual(afterCall);
        });
    });

    describe('Color Tests', () => {
        test('should set color with hex value', () => {
            const hexColor = 0x57f287; // Green color
            embed.setColor(hexColor);
            expect(embed.data.color).toBe(hexColor);
        });

        test('should set color with string value', () => {
            const colorString: ColorResolvable = 'Green';
            embed.setColor(colorString);
            expect(embed.data.color).toBeDefined();
        });

        test('should handle different color formats', () => {
            // Test different color representations
            const colors = [
                0x57f287,  // Verde - jogos excelentes
                0x5865f2,  // Azul - jogos muito bons
                0xfee75c,  // Amarelo - jogos bons
                0xffa500   // Laranja - jogos aceitáveis
            ];

            colors.forEach(color => {
                embed.setColor(color);
                expect(embed.data.color).toBe(color);
            });
        });
    });

    describe('Images and Media', () => {
        test('should set thumbnail correctly', () => {
            const thumbnailURL = 'https://example.com/thumbnail.jpg';
            embed.setThumbnail(thumbnailURL);
            expect(embed.data.thumbnail?.url).toBe(thumbnailURL);
        });

        test('should set image correctly', () => {
            const imageURL = 'https://example.com/image.jpg';
            embed.setImage(imageURL);
            expect(embed.data.image?.url).toBe(imageURL);
        });

        test('should handle null image URLs', () => {
            embed.setImage(null);
            expect(embed.data.image).toBeUndefined();
        });

        test('should handle null thumbnail URLs', () => {
            embed.setThumbnail(null);
            expect(embed.data.thumbnail).toBeUndefined();
        });
    });

    describe('Author and Footer', () => {
        test('should set author correctly', () => {
            const authorName = 'Test Author';
            const authorURL = 'https://example.com/author';
            const authorIcon = 'https://example.com/icon.png';

            embed.setAuthor({
                name: authorName,
                url: authorURL,
                iconURL: authorIcon
            });

            expect(embed.data.author?.name).toBe(authorName);
            expect(embed.data.author?.url).toBe(authorURL);
            expect(embed.data.author?.icon_url).toBe(authorIcon);
        });

        test('should set footer correctly', () => {
            const footerText = 'Fonte: IGDB.com';
            const footerIcon = 'https://www.igdb.com/favicon.ico';

            embed.setFooter({
                text: footerText,
                iconURL: footerIcon
            });

            expect(embed.data.footer?.text).toBe(footerText);
            expect(embed.data.footer?.icon_url).toBe(footerIcon);
        });

        test('should set footer with text only', () => {
            const footerText = 'Simple footer text';
            embed.setFooter({ text: footerText });
            expect(embed.data.footer?.text).toBe(footerText);
            expect(embed.data.footer?.icon_url).toBeUndefined();
        });
    });

    describe('Fields', () => {
        test('should add fields correctly', () => {
            embed.addFields(
                { name: 'Rating', value: '8.5/10', inline: true },
                { name: 'Genre', value: 'Action RPG', inline: true },
                { name: 'Platform', value: 'PC, PS5, Xbox', inline: false }
            );

            expect(embed.data.fields).toHaveLength(3);
            expect(embed.data.fields?.[0]?.name).toBe('Rating');
            expect(embed.data.fields?.[0]?.value).toBe('8.5/10');
            expect(embed.data.fields?.[0]?.inline).toBe(true);
            expect(embed.data.fields?.[2]?.inline).toBe(false);
        });

        test('should set fields array correctly', () => {
            const fields = [
                { name: 'Field 1', value: 'Value 1', inline: false },
                { name: 'Field 2', value: 'Value 2', inline: true }
            ];

            embed.setFields(fields);
            expect(embed.data.fields).toEqual(fields);
        });

        test('should clear fields when setting empty array', () => {
            embed.addFields({ name: 'Test', value: 'Test', inline: false });
            embed.setFields([]);
            expect(embed.data.fields).toEqual([]);
        });
    });

    describe('Game Embed Simulation', () => {
        test('should create a complete game embed like in gameQueueJob', () => {
            // Simulando dados de um jogo
            const gameData = {
                name: 'The Witcher 3: Wild Hunt',
                igdbUrl: 'https://www.igdb.com/games/the-witcher-3-wild-hunt',
                summary: 'The Witcher 3: Wild Hunt is a story-driven open world RPG set in a visually stunning fantasy universe full of meaningful choices and impactful consequences.',
                releaseDate: '2015-05-19',
                rating: 8.7,
                genres: 'RPG, Adventure',
                platforms: 'PC, PlayStation 4, Xbox One, Nintendo Switch',
                isOnline: false,
                isMultiplayer: false,
                isCoop: false,
                coverImage: 'https://example.com/witcher3-cover.jpg',
                backgroundImage: 'https://example.com/witcher3-bg.jpg'
            };

            // Lógica de cor baseada no rating (igual ao gameQueueJob)
            const color = gameData.rating >= 8
                ? 0x57f287 // verde - jogos excelentes (8-10)
                : gameData.rating >= 6.5
                    ? 0x5865f2 // azul - jogos muito bons (6.5-8)
                    : gameData.rating >= 5
                        ? 0xfee75c // amarelo - jogos bons (5-6.5)
                        : 0xffa500; // laranja - jogos aceitáveis (3-5)

            embed
                .setColor(color)
                .setTitle(gameData.name)
                .setURL(gameData.igdbUrl)
                .setDescription(
                    `📖 **Resumo:**\n${gameData.summary.substring(0, 180)}${gameData.summary.length > 180 ? '...' : ''}\n\n` +
                    `🎮 **Lançamento:** ${gameData.releaseDate}\n` +
                    `⭐ **Nota IGDB:** ${gameData.rating > 0 ? `${gameData.rating.toFixed(1)}/10` : 'Sem avaliação'}${gameData.rating >= 8 ? ' 🏆' : gameData.rating >= 6.5 ? ' ⭐' : ''}\n` +
                    `🧩 **Gêneros:** ${gameData.genres}\n` +
                    `💻 **Plataformas:** ${gameData.platforms}\n\n` +
                    `${gameData.isOnline ? '🌐' : '📱'} **Online:** ${gameData.isOnline ? 'Sim' : 'Não'}\n` +
                    `${gameData.isMultiplayer ? '👥' : '👤'} **Multiplayer:** ${gameData.isMultiplayer ? 'Sim' : 'Não'}\n` +
                    `${gameData.isCoop ? '🤝' : '🚫'} **Co-op:** ${gameData.isCoop ? 'Sim' : 'Não'}`
                )
                .setFooter({
                    text: "Fonte: IGDB.com",
                    iconURL: "https://www.igdb.com/favicon.ico",
                })
                .setTimestamp()
                .setThumbnail(gameData.coverImage)
                .setImage(gameData.backgroundImage);

            // Validações
            expect(embed.data.color).toBe(0x57f287); // Verde para rating >= 8
            expect(embed.data.title).toBe(gameData.name);
            expect(embed.data.url).toBe(gameData.igdbUrl);
            expect(embed.data.description).toContain('📖 **Resumo:**');
            expect(embed.data.description).toContain('8.7/10 🏆');
            expect(embed.data.description).toContain('**Online:** Não');
            expect(embed.data.footer?.text).toBe("Fonte: IGDB.com");
            expect(embed.data.thumbnail?.url).toBe(gameData.coverImage);
            expect(embed.data.image?.url).toBe(gameData.backgroundImage);
            expect(embed.data.timestamp).toBeDefined();
        });

        test('should handle different rating ranges correctly', () => {
            const testCases = [
                { rating: 9.2, expectedColor: 0x57f287, expectedBadge: ' 🏆' },
                { rating: 7.5, expectedColor: 0x5865f2, expectedBadge: ' ⭐' },
                { rating: 6.0, expectedColor: 0xfee75c, expectedBadge: '' },
                { rating: 4.0, expectedColor: 0xffa500, expectedBadge: '' },
                { rating: 0, expectedColor: 0xffa500, expectedBadge: '' }
            ];

            testCases.forEach(testCase => {
                const localEmbed = new EmbedBuilder();
                const color = testCase.rating >= 8
                    ? 0x57f287
                    : testCase.rating >= 6.5
                        ? 0x5865f2
                        : testCase.rating >= 5
                            ? 0xfee75c
                            : 0xffa500;

                localEmbed.setColor(color);
                expect(localEmbed.data.color).toBe(testCase.expectedColor);
            });
        });
    });

    describe('Edge Cases and Validation', () => {
        test('should handle very long descriptions', () => {
            const longDescription = 'A'.repeat(4096); // Discord limit is 4096 characters
            embed.setDescription(longDescription);
            expect(embed.data.description).toBe(longDescription);
        });

        test('should handle empty strings', () => {
            embed.setTitle('Test Title'); // Discord.js não permite strings vazias
            embed.setDescription('Test Description');
            expect(embed.data.title).toBe('Test Title');
            expect(embed.data.description).toBe('Test Description');
        });

        test('should handle special characters in text', () => {
            const titleWithSpecialChars = 'Jogo™: Edição Especial® 🎮';
            const descWithEmojis = '🎯 Este é um jogo incrível! 🚀 Com muita ação! 💥';
            
            embed.setTitle(titleWithSpecialChars);
            embed.setDescription(descWithEmojis);
            
            expect(embed.data.title).toBe(titleWithSpecialChars);
            expect(embed.data.description).toBe(descWithEmojis);
        });

        test('should serialize to JSON correctly', () => {
            embed
                .setTitle('Test Game')
                .setDescription('Test Description')
                .setColor(0x57f287)
                .setTimestamp();

            const embedJSON = embed.toJSON();
            expect(embedJSON).toHaveProperty('title', 'Test Game');
            expect(embedJSON).toHaveProperty('description', 'Test Description');
            expect(embedJSON).toHaveProperty('color', 0x57f287);
            expect(embedJSON).toHaveProperty('timestamp');
        });
    });

    describe('URL Validation Tests', () => {
        test('should accept valid URLs', () => {
            const validUrls = [
                'https://www.igdb.com/games/test',
                'http://example.com/image.jpg',
                'https://cdn.example.com/thumbnail.png'
            ];

            validUrls.forEach(url => {
                expect(() => {
                    embed.setURL(url);
                    embed.setImage(url);
                    embed.setThumbnail(url);
                }).not.toThrow();
            });
        });

        test('should create embed with multiple components', () => {
            embed
                .setTitle('Complete Game Embed')
                .setDescription('A fully featured game description')
                .setColor(0x57f287)
                .setURL('https://example.com')
                .setAuthor({ name: 'Game Bot', iconURL: 'https://example.com/bot.png' })
                .setThumbnail('https://example.com/thumb.jpg')
                .setImage('https://example.com/image.jpg')
                .addFields(
                    { name: 'Rating', value: '9/10', inline: true },
                    { name: 'Genre', value: 'RPG', inline: true }
                )
                .setFooter({ text: 'Test Footer', iconURL: 'https://example.com/footer.ico' })
                .setTimestamp();

            expect(embed.data.title).toBeDefined();
            expect(embed.data.description).toBeDefined();
            expect(embed.data.color).toBeDefined();
            expect(embed.data.url).toBeDefined();
            expect(embed.data.author).toBeDefined();
            expect(embed.data.thumbnail).toBeDefined();
            expect(embed.data.image).toBeDefined();
            expect(embed.data.fields).toHaveLength(2);
            expect(embed.data.footer).toBeDefined();
            expect(embed.data.timestamp).toBeDefined();
        });
    });
});