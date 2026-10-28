const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function makeBoardSheets() {
  const dir = 'temp/user_board';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).sort();
  
  const cols = 5;
  const thumbWidth = 250;
  const thumbHeight = 160;

  async function sheet(slice, outName) {
    const rows = Math.ceil(slice.length / cols);
    const sheetWidth = cols * thumbWidth;
    const sheetHeight = rows * (thumbHeight + 25);

    const composites = [];
    for (let i = 0; i < slice.length; i++) {
      const file = slice[i];
      const fullPath = path.join(dir, file);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const left = col * thumbWidth;
      const top = row * (thumbHeight + 25);

      const thumbBuf = await sharp(fullPath)
        .resize(thumbWidth, thumbHeight, { fit: 'cover', position: 'attention' })
        .toBuffer();

      composites.push({ input: thumbBuf, left, top });

      const svgLabel = Buffer.from(
        `<svg width="${thumbWidth}" height="25">
          <rect width="100%" height="100%" fill="#111" />
          <text x="50%" y="17" font-size="12" font-family="sans-serif" fill="#FFF" text-anchor="middle" font-weight="bold">${file}</text>
        </svg>`
      );
      composites.push({ input: svgLabel, left, top: top + thumbHeight });
    }

    await sharp({
      create: {
        width: sheetWidth,
        height: sheetHeight,
        channels: 3,
        background: { r: 20, g: 20, b: 20 }
      }
    })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(outName);

    console.log('Created:', outName);
  }

  await sheet(files.slice(0, 25), 'temp/board_sheet_1.jpg');
  await sheet(files.slice(25, 50), 'temp/board_sheet_2.jpg');
  await sheet(files.slice(50), 'temp/board_sheet_3.jpg');
}

makeBoardSheets().catch(console.error);
