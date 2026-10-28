/**
 * Script de Expansão para 2000 Comandos — GOATBOT
 * Gera os 969 comandos modulares completando os 2000 comandos oficiais
 * (500 de RPG Saga Épica e 1500 nas demais categorias).
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const dispatcher = require(path.join(ROOT, 'src/handlers/commandDispatcher'));
dispatcher.loadCommands();

const existingCommands = dispatcher.getCommands();
const existingAliases = dispatcher.getAliases();

const taken = new Set();
for (const [name, cmd] of existingCommands.entries()) {
    taken.add(name.toLowerCase());
    if (Array.isArray(cmd.aliases)) {
        cmd.aliases.forEach(a => taken.add(String(a).toLowerCase()));
    }
}
for (const alias of existingAliases.keys()) {
    taken.add(alias.toLowerCase());
}

console.log(`[INFO] Comandos atuais carregados: ${existingCommands.size} (Total de nomes/aliases tomados: ${taken.size})`);

// Helper para sanitizar nome
function cleanName(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

// Helper para criar arquivo de comando com schema válido
function createCommandFile(cat, name, subcat, desc, loreText, extraLogic = '') {
    const safeName = cleanName(name);
    if (!safeName || taken.has(safeName)) return false;

    const dir = path.join(ROOT, 'src', 'commands', cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${safeName}.js`);
    if (fs.existsSync(filePath)) return false;

    const content = `/**
 * Comando .${safeName} — ${desc}
 * Categoria: ${cat} | Subcategoria: ${subcat}
 */

module.exports = {
    name: ${JSON.stringify(safeName)},
    aliases: [],
    category: ${JSON.stringify(cat)},
    subcategory: ${JSON.stringify(subcat)},
    description: ${JSON.stringify(desc)},
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        ${extraLogic}
        const doc = ${JSON.stringify(loreText)};
        return reply(doc);
    }
};
`;

    fs.writeFileSync(filePath, content, 'utf8');
    taken.add(safeName);
    return true;
}

module.exports = {
    cleanName,
    createCommandFile,
    taken,
    existingCommands
};

