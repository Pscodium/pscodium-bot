import { EmbedBuilder, ColorResolvable } from 'discord.js';

/**
 * Arquivo de exemplo para testar o EmbedBuilder do Discord.js localmente
 * Execute: npx ts-node tests/examples/embedBuilder-examples.ts
 */

interface GameData {
    name: string;
    igdbUrl?: string;
    summary: string;
    releaseDate: string;
    rating: number;
    genres: string;
    platforms: string;
    isOnline: boolean;
    isMultiplayer: boolean;
    isCoop: boolean;
    multiplayerInfo?: string;
    coverImage?: string;
    backgroundImage?: string;
}

// Função para simular diferentes tipos de embeds de jogos
function createGameEmbed(gameData: GameData): EmbedBuilder {
    // Lógica de cor baseada no rating (igual ao seu gameQueueJob)
    const color = gameData.rating >= 8
        ? 0x57f287 // verde - jogos excelentes (8-10)
        : gameData.rating >= 6.5
            ? 0x5865f2 // azul - jogos muito bons (6.5-8)
            : gameData.rating >= 5
                ? 0xfee75c // amarelo - jogos bons (5-6.5)
                : 0xffa500; // laranja - jogos aceitáveis (3-5)

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(gameData.name)
        .setURL(gameData.igdbUrl || 'https://www.igdb.com')
        .setDescription(
            `📖 **Resumo:**\n${gameData.summary.substring(0, 180)}${gameData.summary.length > 180 ? '...' : ''}\n\n` +
            `🎮 **Lançamento:** ${gameData.releaseDate}\n` +
            `⭐ **Nota IGDB:** ${gameData.rating > 0 ? `${gameData.rating.toFixed(1)}/10` : 'Sem avaliação'}${gameData.rating >= 8 ? ' 🏆' : gameData.rating >= 6.5 ? ' ⭐' : ''}\n` +
            `🧩 **Gêneros:** ${gameData.genres}\n` +
            `💻 **Plataformas:** ${gameData.platforms}\n\n` +
            `${gameData.isOnline ? '🌐' : '📱'} **Online:** ${gameData.isOnline ? 'Sim' : 'Não'}\n` +
            `${gameData.isMultiplayer ? '👥' : '👤'} **Multiplayer:** ${gameData.isMultiplayer ? 'Sim' : 'Não'}\n` +
            `${gameData.isCoop ? '🤝' : '🚫'} **Co-op:** ${gameData.isCoop ? 'Sim' : 'Não'}\n` +
            (gameData.isMultiplayer ? `🎯 **Detalhes:** ${gameData.multiplayerInfo || 'N/A'}` : '')
        )
        .setFooter({
            text: "Fonte: IGDB.com",
            iconURL: "https://www.igdb.com/favicon.ico",
        })
        .setTimestamp();

    if (gameData.coverImage) embed.setThumbnail(gameData.coverImage);
    if (gameData.backgroundImage) embed.setImage(gameData.backgroundImage);

    return embed;
}

// Função para criar embed simples
function createSimpleEmbed(title: string, description: string, color?: ColorResolvable): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
    
    if (color) embed.setColor(color);
    
    return embed;
}

// Função para criar embed com campos
function createEmbedWithFields(): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('Estatísticas do Servidor')
        .setDescription('Informações detalhadas do servidor Discord')
        .setColor(0x00AE86)
        .addFields(
            { name: '👥 Membros', value: '1,234', inline: true },
            { name: '📝 Canais', value: '56', inline: true },
            { name: '🎭 Cargos', value: '23', inline: true },
            { name: '📊 Mensagens hoje', value: '8,756', inline: false },
            { name: '🆕 Novos membros', value: '12 hoje', inline: true },
            { name: '🔥 Membros ativos', value: '234', inline: true }
        )
        .setFooter({ text: 'Atualizado em tempo real' })
        .setTimestamp();
}

// Exemplos de dados de jogos para teste
const gamesExamples = [
    {
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
        coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
        backgroundImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6aut.jpg'
    },
    {
        name: 'Among Us',
        igdbUrl: 'https://www.igdb.com/games/among-us',
        summary: 'Among Us is a multiplayer social deduction game where players work together to complete tasks while trying to identify the impostor among them.',
        releaseDate: '2018-06-15',
        rating: 7.2,
        genres: 'Party, Strategy',
        platforms: 'PC, Mobile, Nintendo Switch',
        isOnline: true,
        isMultiplayer: true,
        isCoop: true,
        multiplayerInfo: '4-15 jogadores online',
        coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg',
        backgroundImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scfhbz.jpg'
    },
    {
        name: 'Pong',
        igdbUrl: 'https://www.igdb.com/games/pong',
        summary: 'Pong is one of the earliest arcade video games. It is a simple tennis-like game featuring two paddles and a ball.',
        releaseDate: '1972-11-29',
        rating: 4.8,
        genres: 'Arcade, Sport',
        platforms: 'Arcade',
        isOnline: false,
        isMultiplayer: true,
        isCoop: false,
        multiplayerInfo: '2 jogadores local',
        coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7fxi.jpg'
    },
    {
        name: 'Cyberpunk 2077',
        igdbUrl: 'https://www.igdb.com/games/cyberpunk-2077',
        summary: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
        releaseDate: '2020-12-10',
        rating: 6.1,
        genres: 'RPG, Action, Adventure',
        platforms: 'PC, PlayStation 4, PlayStation 5, Xbox One, Xbox Series X/S',
        isOnline: false,
        isMultiplayer: false,
        isCoop: false,
        coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dpv.jpg',
        backgroundImage: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scmhpy.jpg'
    }
];

console.log('🎮 Testando EmbedBuilder do Discord.js\n');

// Teste 1: Embeds de jogos com diferentes ratings
console.log('📊 Teste 1: Embeds de jogos com diferentes ratings');
gamesExamples.forEach((game, index) => {
    const embed = createGameEmbed(game);
    const embedData = embed.toJSON();
    
    console.log(`\n${index + 1}. ${game.name}`);
    console.log(`   Rating: ${game.rating}/10`);
    console.log(`   Cor: #${embedData.color?.toString(16).padStart(6, '0').toUpperCase()}`);
    console.log(`   Título: ${embedData.title}`);
    console.log(`   Descrição (primeiros 100 chars): ${embedData.description?.substring(0, 100)}...`);
    console.log(`   Footer: ${embedData.footer?.text}`);
    console.log(`   Timestamp: ${embedData.timestamp}`);
    console.log(`   Thumbnail: ${embedData.thumbnail?.url ? 'Sim' : 'Não'}`);
    console.log(`   Image: ${embedData.image?.url ? 'Sim' : 'Não'}`);
});

// Teste 2: Embeds simples com diferentes cores
console.log('\n\n🎨 Teste 2: Embeds simples com diferentes cores');
const simpleEmbeds = [
    { title: 'Sucesso', desc: 'Operação realizada com sucesso!', color: 0x57f287 },
    { title: 'Aviso', desc: 'Atenção: esta ação não pode ser desfeita.', color: 0xfee75c },
    { title: 'Erro', desc: 'Algo deu errado. Tente novamente.', color: 0xed4245 },
    { title: 'Info', desc: 'Informação importante sobre o sistema.', color: 0x5865f2 }
];

simpleEmbeds.forEach((embedInfo, index) => {
    const embed = createSimpleEmbed(embedInfo.title, embedInfo.desc, embedInfo.color);
    const embedData = embed.toJSON();
    
    console.log(`${index + 1}. ${embedInfo.title}`);
    console.log(`   Cor: #${embedData.color?.toString(16).padStart(6, '0').toUpperCase()}`);
    console.log(`   Descrição: ${embedData.description}`);
});

// Teste 3: Embed com campos
console.log('\n\n📋 Teste 3: Embed com campos');
const fieldsEmbed = createEmbedWithFields();
const fieldsEmbedData = fieldsEmbed.toJSON();

console.log(`Título: ${fieldsEmbedData.title}`);
console.log(`Cor: #${fieldsEmbedData.color?.toString(16).padStart(6, '0').toUpperCase()}`);
console.log(`Número de campos: ${fieldsEmbedData.fields?.length}`);
fieldsEmbedData.fields?.forEach((field, index) => {
    console.log(`   Campo ${index + 1}: ${field.name} = ${field.value} (inline: ${field.inline})`);
});

// Teste 4: Validação de tamanhos
console.log('\n\n📏 Teste 4: Validação de tamanhos');
const longText = 'A'.repeat(4096); // Limite do Discord
const longEmbed = createSimpleEmbed('Teste de Tamanho', longText, 0x9932cc);
const longEmbedData = longEmbed.toJSON();

console.log(`Tamanho da descrição: ${longEmbedData.description?.length} caracteres`);
console.log(`Limite do Discord: 4096 caracteres`);
console.log(`Está dentro do limite: ${(longEmbedData.description?.length || 0) <= 4096 ? 'Sim' : 'Não'}`);

// Teste 5: Embed completo com todos os componentes
console.log('\n\n🎯 Teste 5: Embed completo');
const completeEmbed = new EmbedBuilder()
    .setTitle('🎮 Bot de Jogos Premium')
    .setDescription('O melhor bot de Discord para gamers! Descubra novos jogos, compete com amigos e muito mais.')
    .setColor(0x9932cc)
    .setURL('https://example.com/bot')
    .setAuthor({ 
        name: 'GameBot', 
        iconURL: 'https://cdn.discordapp.com/avatars/123456789/avatar.png',
        url: 'https://example.com/author'
    })
    .setThumbnail('https://cdn.discordapp.com/avatars/987654321/avatar.png')
    .setImage('https://images.igdb.com/igdb/image/upload/t_original/scmhpy.jpg')
    .addFields(
        { name: '🎲 Comandos de Jogos', value: '25+', inline: true },
        { name: '🏆 Conquistas', value: '150+', inline: true },
        { name: '👥 Servidores', value: '1,337', inline: true },
        { name: '📊 Uptime', value: '99.9%', inline: false }
    )
    .setFooter({ 
        text: 'GameBot v2.0 | Criado com ❤️', 
        iconURL: 'https://example.com/footer-icon.png' 
    })
    .setTimestamp();

const completeEmbedData = completeEmbed.toJSON();
console.log('Embed Completo:');
console.log(`✓ Título: ${completeEmbedData.title ? 'Sim' : 'Não'}`);
console.log(`✓ Descrição: ${completeEmbedData.description ? 'Sim' : 'Não'}`);
console.log(`✓ Cor: ${completeEmbedData.color ? 'Sim' : 'Não'}`);
console.log(`✓ URL: ${completeEmbedData.url ? 'Sim' : 'Não'}`);
console.log(`✓ Autor: ${completeEmbedData.author ? 'Sim' : 'Não'}`);
console.log(`✓ Thumbnail: ${completeEmbedData.thumbnail ? 'Sim' : 'Não'}`);
console.log(`✓ Imagem: ${completeEmbedData.image ? 'Sim' : 'Não'}`);
console.log(`✓ Campos: ${completeEmbedData.fields?.length || 0}`);
console.log(`✓ Footer: ${completeEmbedData.footer ? 'Sim' : 'Não'}`);
console.log(`✓ Timestamp: ${completeEmbedData.timestamp ? 'Sim' : 'Não'}`);

console.log('\n🎉 Testes concluídos com sucesso!');
console.log('\n💡 Para executar os testes unitários, use: npm test');
console.log('💡 Para executar este arquivo, use: npx ts-node tests/examples/embedBuilder-examples.ts');