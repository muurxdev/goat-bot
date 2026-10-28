const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rawPins = JSON.parse(fs.readFileSync('temp/user_board_pins.json', 'utf8'));
const outDir = path.resolve('temp/user_board');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadPins() {
    const formattedUrls = new Set();

    for (const p of rawPins) {
        const m = p.match(/([0-9a-f]{32})\.(jpg|jpeg|png)/i);
        if (m) {
            const h = m[1];
            const ext = m[2];
            const pathPart = `${h.slice(0, 2)}/${h.slice(2, 4)}/${h.slice(4, 6)}/${h}.${ext}`;
            formattedUrls.add(pathPart);
        }
    }

    console.log(`Processing ${formattedUrls.size} unique pins from user's board...`);
    const results = [];
    let count = 0;

    for (const pathPart of formattedUrls) {
        count++;
        const filename = `board_${String(count).padStart(2, '0')}.jpg`;
        const localPath = path.join(outDir, filename);

        const origUrl = `https://i.pinimg.com/originals/${pathPart}`;
        const x736Url = `https://i.pinimg.com/736x/${pathPart}`;

        let buf = null;
        let usedUrl = '';

        try {
            const resOrig = await fetch(origUrl);
            if (resOrig.ok) {
                const ab = await resOrig.arrayBuffer();
                buf = Buffer.from(ab);
                usedUrl = origUrl;
            }
        } catch (_) {}

        if (!buf) {
            try {
                const res736 = await fetch(x736Url);
                if (res736.ok) {
                    const ab = await res736.arrayBuffer();
                    buf = Buffer.from(ab);
                    usedUrl = x736Url;
                }
            } catch (_) {}
        }

        if (buf && buf.length > 5000) {
            try {
                const meta = await sharp(buf).metadata();
                fs.writeFileSync(localPath, buf);
                results.push({
                    index: count,
                    filename,
                    width: meta.width,
                    height: meta.height,
                    ratio: (meta.width / meta.height).toFixed(2),
                    url: usedUrl
                });
                console.log(`[${count}/${formattedUrls.size}] ✅ Saved ${filename}: ${meta.width}x${meta.height} (ratio: ${(meta.width / meta.height).toFixed(2)})`);
            } catch (err) {
                console.error(`[${count}] Sharp error: ${err.message}`);
            }
        } else {
            console.warn(`[${count}] Failed to download: ${pathPart}`);
        }
    }

    fs.writeFileSync('temp/user_board_meta.json', JSON.stringify(results, null, 2));
    console.log(`Successfully saved ${results.length} images to temp/user_board/`);
}

downloadPins();
