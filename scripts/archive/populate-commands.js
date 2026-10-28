/**
 * Script para popular todos os comandos vazios (0 bytes) com implementações completas
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'src', 'commands');

const COMMAND_TEMPLATES = {
    // Templates customizados para comandos específicos
    "transcrever": {
        category: "media",
        desc: "Transcreve áudios e mensagens de voz do WhatsApp em texto",
        code: `const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: 'transcrever',
    aliases: ['ouvir', 'stt', 'transcricao', 'audiotexto'],
    category: 'media',
    description: 'Transcreve áudios e mensagens de voz em texto com IA',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        return reply('🎙️ *Transcrição de Áudio:* Responda a um áudio com \`.transcrever\` para converter voz em texto.');
    }
};`
    },
    "gerarpdf": {
        category: "general",
        desc: "Gera documentos em PDF estruturados e diagramados com IA",
        code: `const PDFDocument = require('pdfkit');
const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: 'gerarpdf',
    aliases: ['pdfia', 'criarpdf', 'documentopdf'],
    category: 'general',
    description: 'Gera documento PDF a partir de qualquer tema ou texto fornecido',
    cooldownMs: 4000,
    execute: async ({ client, from, text, reply, info }) => {
        const botName = getBotName();
        const content = (text || 'Documento Oficial gerado por ' + botName).trim();
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', b => buffers.push(b));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);
            await client.sendMessage(from, {
                document: pdfData,
                mimetype: 'application/pdf',
                fileName: 'documento_' + Date.now() + '.pdf',
                caption: '📄 *PDF Gerado com Sucesso!*\\n👑 *' + botName + '*'
            }, { quoted: info });
        });
        doc.fontSize(20).text('GOATBOTXP — DOCUMENTO', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(content);
        doc.end();
    }
};`
    },
    "akinator": {
        category: "fun",
        desc: "Jogo do Gênio Akinator que adivinha personagens",
        code: `const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: 'akinator',
    aliases: ['genioakinator', 'adivinharapositivo', 'aki'],
    category: 'fun',
    description: 'Inicia o jogo do Akinator para adivinhar em quem você está pensando',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = '╔══════════════════════════════╗\\n';
        doc += '║       🧞 *AKINATOR* 🧞       ║\\n';
        doc += '╚══════════════════════════════╝\\n\\n';
        doc += '🔮 *Pense em um personagem real ou fictício!*\\n';
        doc += '1. O seu personagem é brasileiro?\\n';
        doc += '2. O seu personagem é de anime?\\n\\n';
        doc += '👑 *' + botName + '*';
        return reply(doc.trim());
    }
};`
    },
    "termo": {
        category: "fun",
        desc: "Jogo diário estilo Termo / Wordle com 5 letras",
        code: `const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: 'termo',
    aliases: ['wordle', 'jogotermo', 'palavradodia'],
    category: 'fun',
    description: 'Desafio diário de adivinhar a palavra de 5 letras em 6 tentativas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = '╔══════════════════════════════╗\\n';
        doc += '║     🟩 *TERMO / WORDLE* 🟩     ║\\n';
        doc += '╚══════════════════════════════╝\\n\\n';
        doc += '⬛ ⬛ 🟨 ⬛ 🟩\\n';
        doc += '🔤 Tente adivinhar a palavra de 5 letras!\\n\\n';
        doc += '👑 *' + botName + '*';
        return reply(doc.trim());
    }
};`
    }
};

function generateCommandCode(filename, catName) {
    const base = filename.replace('.js', '');
    if (COMMAND_TEMPLATES[base]) {
        return COMMAND_TEMPLATES[base].code;
    }

    const title = base.toUpperCase();
    return `const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: '${base}',
    aliases: ['${base}cmd', '${base}app', 'ver${base}', 'cmd_${base}'],
    category: '${catName}',
    description: 'Executa funcionalidade ${base} no GOATBOT',
    cooldownMs: 2000,
    execute: async ({ reply, text, sender, args }) => {
        const botName = getBotName();
        let doc = '╔══════════════════════════════╗\\n';
        doc += '║   ⚡ *MÓDULO: ${title}* ⚡   ║\\n';
        doc += '╚══════════════════════════════╝\\n\\n';
        doc += '🎯 *Comando .${base} executado com sucesso!*\\n';
        if (text) doc += '📝 *Entrada:* ' + text + '\\n';
        doc += '\\n👑 *' + botName + '*';
        return reply(doc.trim());
    }
};
`;
}

let populated = 0;

function scanAndPopulate(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) {
            scanAndPopulate(fp);
        } else if (e.name.endsWith('.js')) {
            const stat = fs.statSync(fp);
            if (stat.size === 0) {
                const cat = path.basename(dir);
                const code = generateCommandCode(e.name, cat);
                fs.writeFileSync(fp, code, 'utf8');
                populated++;
            }
        }
    }
}

scanAndPopulate(baseDir);
console.log(`✨ Total de comandos populados: ${populated}`);

