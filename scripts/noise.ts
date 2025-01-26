// scripts/generateNoise.ts
import { createCanvas } from 'canvas';
import * as path from 'path';
import * as fs from 'fs'

function generateNoiseTexture(
    width: number = 128,
    height: number = 128
): Buffer {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Optional: fill with black or transparent to begin
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // For each pixel, set random gray-ish noise
    for (let i = 0; i < data.length; i += 4) {
        // For subtle noise, pick a random near-white or near-black
        // or vary the alpha for subtlety
        const val = Math.floor(Math.random() * 255);

        // Subtle noise is often near grayscale – you can tweak
        // these so the effect is less harsh:
        data[i]   = val; // R
        data[i+1] = val; // G
        data[i+2] = val; // B
        data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Return as Buffer (PNG)
    return canvas.toBuffer('image/png');
}

// Main script entry
function main() {
    const buffer = generateNoiseTexture(512, 512);

    // Save to disk if you want the raw file:
    const outPath = path.join(process.cwd(), 'public', 'noise.png');
    fs.writeFileSync(outPath, buffer);
    console.log(`Noise texture generated at: ${outPath}`);
}

main();
