/* eslint-disable @typescript-eslint/no-var-requires */
const { createCanvas, Image } = require('canvas');
const fs = require('fs');

const imageUrl = 'https://d1w4uh7ghtlh1q.cloudfront.net/public/images/pin/pin-on.png';
const hex = "#ff0000";

async function changeIconColor(hex, imagePath) {
    const img = new Image();
    img.width = 35;
    img.height = 48;
    img.src = imagePath;
    img.onload = () => {
        const canvas = createCanvas(35, 48);
        const { r, g, b } = hexToRgb(hex);

        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] += r;
            data[i + 1] += g;
            data[i + 2] += b;
        }

        ctx.putImageData(imageData, 0, 0);

        const fileName = `image.png`;
        const out = fs.createWriteStream(fileName);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`Arquivo ${fileName} salvo.`));
    };
}


const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

changeIconColor(hex, imageUrl);
