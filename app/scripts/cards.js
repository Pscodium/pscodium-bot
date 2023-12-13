/* eslint-disable @typescript-eslint/no-var-requires */
const { createCanvas } = require('canvas');
const fs = require('fs');

// Cria um array com os naipes das cartas
const naipes = ['♠', '♥', '♦', '♣'];

// Cria um array com os valores das cartas
const valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Loop para criar as cartas
for (let naipe of naipes) {
    for (let valor of valores) {
        // Cria um canvas para desenhar a carta
        const canvas = createCanvas(150, 200);
        const ctx = canvas.getContext('2d');

        // Define a cor do fundo e preenche o canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Define a cor do texto e desenha o valor da carta
        ctx.fillStyle = naipe === '♥' || naipe === '♦' ? 'red' : 'black';
        ctx.font = 'bold 100px American Typewriter, serif'; // Aumenta o tamanho da fonte do valor
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(valor, canvas.width / 2, canvas.height / 2); // Move o texto um pouco para cima

        // Desenha o naipe da carta
        ctx.fillStyle = naipe === '♥' || naipe === '♦' ? 'red' : 'black';
        ctx.font = 'bold 58px sans-serif'; // Diminui o tamanho da fonte do naipe
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (naipe === '♠' || naipe === '♣') {
            ctx.fillText(naipe, 25, 25); // Move o naipe para o canto superior esquerdo
            ctx.fillText(naipe, canvas.width - 25, canvas.height - 25); // Move o naipe para o canto inferior direito
        } else {
            ctx.fillText(naipe, 25, canvas.height - 25); // Move o naipe para o canto inferior esquerdo
            ctx.fillText(naipe, canvas.width - 25, 25); // Move o naipe para o canto superior direito
        }

        // Salva a imagem da carta em um arquivo
        const fileName = `cards/${valor}_de_${naipe}.png`;
        const out = fs.createWriteStream(fileName);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`Arquivo ${fileName} salvo.`));
    }
}
