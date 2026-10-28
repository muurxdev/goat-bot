/**
 * Comando .asciiart / .ascii
 * Transforma textos em banners estilizados em ASCII
 */
const F = require('../../utils/formato');

const FONT_BLOCKS = {
    'A': [' ▄▀█ ', '█▀█ ', '▀ ▀ '],
    'B': ['█▀▄ ', '█▀▄ ', '▀▀  '],
    'C': ['█▀▀ ', '█▄▄ ', ' ▀▀ '],
    'D': ['█▀▄ ', '█ █ ', '▀▀  '],
    'E': ['█▀▀ ', '██▄ ', '▀▀▀ '],
    'F': ['█▀▀ ', '█▀  ', '▀   '],
    'G': ['█▀▀█', '█ ▄█', ' ▀▀▀'],
    'H': ['█ █ ', '█▀█ ', '▀ ▀ '],
    'I': ['█ ', '█ ', '▀ '],
    'J': ['  █ ', '▄ █ ', ' ▀  '],
    'K': ['█▄▀ ', '█ █ ', '▀ ▀ '],
    'L': ['█   ', '█▄▄ ', '▀▀▀ '],
    'M': ['█▀▄▀█', '█ ▀ █', '▀   ▀'],
    'N': ['█▄ █', '█ ▀█', '▀  ▀'],
    'O': ['█▀█ ', '█▄█ ', ' ▀▀ '],
    'P': ['█▀█ ', '█▀▀ ', '▀   '],
    'Q': ['█▀█ ', '█▄█▄', ' ▀▀ '],
    'R': ['█▀█ ', '█▀▄ ', '▀ ▀ '],
    'S': ['█▀▀ ', '▄▄█ ', '▀▀▀ '],
    'T': ['▀█▀ ', ' █  ', ' ▀  '],
    'U': ['█ █ ', '█▄█ ', ' ▀▀ '],
    'V': ['█ █ ', '▀▄▀ ', ' ▀  '],
    'W': ['█ █ █', '▀▄▀▄▀', ' ▀ ▀ '],
    'X': ['▀▄▀ ', '█ █ ', '▀ ▀ '],
    'Y': ['█▄█ ', ' █  ', ' ▀  '],
    'Z': ['▀▀█ ', '▄▄█ ', '▀▀▀ '],
    ' ': ['  ', '  ', '  '],
    '0': ['█▀█', '█▄█', ' ▀▀'],
    '1': [' █ ', ' █ ', ' ▀ '],
    '2': ['▀▀█', '█▄▄', '▀▀▀'],
    '3': ['▀▀█', '▄▄█', '▀▀▀'],
    '4': ['█ █', '█▀█', '  ▀'],
    '5': ['█▀▀', '▀▀█', '▀▀▀'],
    '6': ['█▀▀', '█▄█', '▀▀▀'],
    '7': ['▀▀█', '  █', '  ▀'],
    '8': ['█▀█', '█▀█', '▀▀▀'],
    '9': ['█▀█', '▀▀█', '▀▀▀'],
    '!': ['█', '█', '▀'],
    '?': ['▀█', ' █', ' ▀']
};

module.exports = {
    name: 'bannerascii',
    aliases: ["textobanner","asciiplus","letrabanner","cmd_bannerascii","alt_bannerascii","atalho_bannerascii","abrev_bannerascii","call_bannerascii","func_bannerascii"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Transforma uma palavra num letreiro grande feito de blocos',
    usage: '<palavra>',
    examples: ['TAVERNA — letreiro com a palavra', 'OI 2026 — letras e números'],
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = '.' }) => {
        const text = args.join(' ').trim().toUpperCase();
        if (!text) {
            return reply(F.tela({
                emoji: '🎨', titulo: 'Letreiro de blocos', prefix,
                intro: 'Escreva uma palavra e eu devolvo ela em letras grandes, feitas de blocos, prontas para copiar.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'bannerascii', '<palavra>')] }],
                dica: 'Até 15 caracteres. Letras sem acento, números, ! e ? saem melhor; no celular, palavras curtas cabem numa linha só.',
                proximos: [
                    { nome: 'bannerascii', args: 'TAVERNA', oque: 'exemplo pronto' },
                    { nome: 'bannerascii', args: 'OI 2026', oque: 'com números' }
                ]
            }));
        }

        if (text.length > 15) {
            return reply('⚠️ Para melhor visualização no celular, envie no máximo 15 caracteres.');
        }

        const lines = ['', '', ''];
        for (const char of text) {
            const block = FONT_BLOCKS[char] || [' ', ' ', ' '];
            lines[0] += block[0] + ' ';
            lines[1] += block[1] + ' ';
            lines[2] += block[2] + ' ';
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║      🎨 *ARTE ASCII BANNER* 🎨     ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += '```\n' + lines.join('\n') + '\n```\n\n';
        doc += `✨ *Texto:* _${text}_`;

        return reply(doc.trim());
    }
};