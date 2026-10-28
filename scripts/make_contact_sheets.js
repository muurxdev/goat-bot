const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function makeContactSheet(fileList, outputFile, cols = 4) {
  const thumbWidth = 320;
  const thumbHeight = 180;
  const rows = Math.ceil(fileList.length / cols);
  const sheetWidth = cols * thumbWidth;
  const sheetHeight = rows * (thumbHeight + 30);

  const composites = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const fullPath = path.join('assets/wallpapers', file);
    if (!fs.existsSync(fullPath)) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = col * thumbWidth;
    const top = row * (thumbHeight + 30);

    const thumbBuf = await sharp(fullPath)
      .resize(thumbWidth, thumbHeight, { fit: 'cover' })
      .toBuffer();

    composites.push({
      input: thumbBuf,
      left: left,
      top: top
    });

    const svgLabel = Buffer.from(
      `<svg width="${thumbWidth}" height="30">
        <rect width="100%" height="100%" fill="#111" />
        <text x="50%" y="20" font-size="14" font-family="sans-serif" fill="#FFF" text-anchor="middle" font-weight="bold">${file}</text>
      </svg>`
    );
    composites.push({
      input: svgLabel,
      left: left,
      top: top + thumbHeight
    });
  }

  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 3,
      background: { r: 15, g: 15, b: 15 }
    }
  })
  .composite(composites)
  .jpeg({ quality: 90 })
  .toFile(outputFile);

  console.log('Created contact sheet:', outputFile);
}

const dir = 'assets/wallpapers';
const all = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') && !f.includes('logo'));
const primaries = all.filter(f => !f.includes('-2'));
const secondaries = all.filter(f => f.includes('-2'));

(async () => {
  await makeContactSheet(primaries.slice(0, 20), 'temp/sheet_primaries_1.jpg', 4);
  await makeContactSheet(primaries.slice(20), 'temp/sheet_primaries_2.jpg', 4);
  await makeContactSheet(secondaries.slice(0, 20), 'temp/sheet_secondaries_1.jpg', 4);
  await makeContactSheet(secondaries.slice(20), 'temp/sheet_secondaries_2.jpg', 4);
})();
