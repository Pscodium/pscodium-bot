import { GameJobService } from '../../app/services/jobs/game.job.service';

async function testIGDB() {
    console.log('🧪 Testando integração com IGDB...');
    
    const gameService = new GameJobService();
    
    try {
        const game = await gameService.getRandomGameForEmbed('normal');
        
        if (game) {
            console.log('✅ Jogo encontrado:');
            console.log(`📘 Nome: ${game.name}`);
            console.log(`📅 Lançamento: ${game.releaseDate}`);
            console.log(`⭐ Rating: ${game.rating}/10`);
            console.log(`🧩 Gêneros: ${game.genres}`);
            console.log(`💻 Plataformas: ${game.platforms}`);
            console.log(`🔗 URL: ${game.igdbUrl}`);
            console.log(`🖼️ Capa: ${game.coverImage}`);
        } else {
            console.log('❌ Nenhum jogo encontrado');
        }
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testIGDB();