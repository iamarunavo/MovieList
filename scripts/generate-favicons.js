const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../src/assets/logo.svg');
const PUBLIC_DIR = path.join(__dirname, '../public');

const SIZES = {
    'favicon.ico': 32,
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512
};

async function generateFavicons() {
    try {
        const svgBuffer = await fs.readFile(LOGO_PATH);
        
        // Generate all sizes in parallel
        await Promise.all(
            Object.entries(SIZES).map(async ([filename, size]) => {
                const outputPath = path.join(PUBLIC_DIR, filename);
                
                if (filename === 'favicon.ico') {
                    // For ICO file, we need to create a PNG first and then convert it
                    await sharp(svgBuffer)
                        .resize(size, size)
                        .png()
                        .toFile(outputPath.replace('.ico', '.png'));
                    
                    // Use the PNG to create ICO (you might need ImageMagick for this)
                    // For now, we'll just use the PNG as is
                    await fs.rename(outputPath.replace('.ico', '.png'), outputPath);
                } else {
                    await sharp(svgBuffer)
                        .resize(size, size)
                        .png()
                        .toFile(outputPath);
                }
                
                console.log(`Generated: ${filename}`);
            })
        );
        
        console.log('All favicons generated successfully!');
    } catch (error) {
        console.error('Error generating favicons:', error);
        process.exit(1);
    }
}

generateFavicons(); 