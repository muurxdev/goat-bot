const fs = require('fs');

async function listAllPins() {
    const res = await fetch('https://www.pinterest.com/mrodriguesdx18/goat/', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36'
        }
    });
    const html = await res.text();
    const matches = [...html.matchAll(/https?:\/\/[a-z0-9]+\.pinimg\.com\/[^\s"'<>&]+/g)].map(m => m[0]);
    
    const pins = new Set();
    for (let m of matches) {
        m = m.replace(/&amp;/g, '&').replace(/\?.*$/, '');
        if (m.includes('/i.pinimg.com/') && m.match(/\.(jpg|jpeg|png)$/i) && !m.includes('/200x150/')) {
            const idMatch = m.match(/\/([0-9a-f]{32})\.(jpg|jpeg|png)/i) || m.match(/\/([0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32})\.(jpg|jpeg|png)/i);
            if (idMatch) {
                // standardize to 736x
                pins.add(`https://i.pinimg.com/736x/${idMatch[1]}.${idMatch[2]}`);
            }
        }
    }

    const pinList = Array.from(pins);
    console.log(`Unique pins found on user board: ${pinList.length}`);
    fs.writeFileSync('temp/user_board_pins.json', JSON.stringify(pinList, null, 2));
    console.log('Saved to temp/user_board_pins.json');
}

listAllPins();
