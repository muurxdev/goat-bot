/**
 * Comando .codificar / .decodificar
 * Codificador e Decodificador multi-formato (Base64, Hex, Binário, Morse, URL, Rot13)
 */
const F = require('../../utils/formato');

const MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/'
};
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));

module.exports = {
    name: 'codificar',
    aliases: ["decodificar","cifrador","cifratexto","cmd_codificar","alt_codificar","atalho_codificar","abrev_codificar","call_codificar","func_codificar"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Codifica ou decodifica textos em Base64, Hex, Binário, Morse, URL ou Rot13',
    usage: '<tipo> <texto>',
    examples: ['base64 Olá Mundo — codifica em Base64', 'morse SOS — vira código Morse', 'rot13 segredo — embaralha as letras'],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        // O contexto entrega o nome digitado em commandName; "command" nunca existiu
        // e o comando lançava TypeError em toda chamada.
        const isDecode = String(commandName).toLowerCase().startsWith('deco') || (args[0] || '').toLowerCase() === 'decode';
        const type = (isDecode && args[0]?.toLowerCase() === 'decode' ? args[1] : args[0])?.toLowerCase();
        const textArgs = isDecode && args[0]?.toLowerCase() === 'decode' ? args.slice(2) : args.slice(1);
        const text = textArgs.join(' ').trim();

        const validTypes = ['base64', 'hex', 'binario', 'bin', 'morse', 'url', 'rot13'];

        if (!type || !validTypes.includes(type) || !text) {
            // Nomes dos formatos em crase: fora dela o tradutor de termos troca a palavra.
            return reply(F.tela({
                emoji: '🔐', titulo: 'Codificar e decodificar', prefix,
                intro: 'Transformo um texto em outro formato (e desfaço depois). Diga o formato e o texto.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        F.cmd(prefix, 'codificar', '<formato> <texto>'),
                        F.cmd(prefix, 'decodificar', '<formato> <texto>')
                    ] },
                    { emoji: '🧩', titulo: 'Formatos', linhas: [
                        '• `base64` — texto embaralhado em letras e números',
                        '• `hex` — cada letra vira um código de dois dígitos',
                        '• `bin` — zeros e uns',
                        '• `morse` — pontos e traços',
                        '• `url` — texto seguro para colocar em link',
                        '• `rot13` — troca cada letra pela 13ª seguinte'
                    ] }
                ],
                dica: 'Nada disso é senha: qualquer pessoa desfaz. Serve para brincadeira, desafio ou link.',
                proximos: [
                    { nome: 'codificar', args: 'base64 Olá Mundo', oque: 'codifica um texto' },
                    { nome: 'decodificar', args: 'base64 T2zDoSBNdW5kbw==', oque: 'desfaz a codificação' },
                    { nome: 'codificar', args: 'morse SOS', oque: 'vira código Morse' }
                ]
            }));
        }

        let result = '';
        try {
            if (!isDecode) {
                switch (type) {
                    case 'base64':
                        result = Buffer.from(text, 'utf-8').toString('base64');
                        break;
                    case 'hex':
                        result = Buffer.from(text, 'utf-8').toString('hex');
                        break;
                    case 'binario':
                    case 'bin':
                        result = Array.from(Buffer.from(text, 'utf-8'))
                            .map(b => b.toString(2).padStart(8, '0'))
                            .join(' ');
                        break;
                    case 'morse':
                        result = text.toUpperCase().split('')
                            .map(char => MORSE_MAP[char] || char)
                            .join(' ');
                        break;
                    case 'url':
                        result = encodeURIComponent(text);
                        break;
                    case 'rot13':
                        result = text.replace(/[a-zA-Z]/g, c => {
                            const base = c <= 'Z' ? 65 : 97;
                            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
                        });
                        break;
                }
            } else {
                switch (type) {
                    case 'base64':
                        result = Buffer.from(text, 'base64').toString('utf-8');
                        break;
                    case 'hex':
                        result = Buffer.from(text.replace(/\s+/g, ''), 'hex').toString('utf-8');
                        break;
                    case 'binario':
                    case 'bin':
                        result = Buffer.from(text.trim().split(/\s+/).map(b => parseInt(b, 2))).toString('utf-8');
                        break;
                    case 'morse':
                        result = text.trim().split(/\s+/).map(code => REVERSE_MORSE[code] || (code === '/' ? ' ' : code)).join('');
                        break;
                    case 'url':
                        result = decodeURIComponent(text);
                        break;
                    case 'rot13':
                        result = text.replace(/[a-zA-Z]/g, c => {
                            const base = c <= 'Z' ? 65 : 97;
                            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
                        });
                        break;
                }
            }
        } catch (err) {
            require('../../core/logger').warn(`[CODIFICAR] Falha em ${type} (${isDecode ? 'decode' : 'encode'}): ${err.message}`);
            return reply(`❌ Não consegui ${isDecode ? 'decodificar' : 'codificar'} esse texto em *${type}*. ${isDecode ? 'Confira se ele foi copiado inteiro, sem espaços ou letras a mais.' : 'Tente com um texto menor.'}`);
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ${isDecode ? '🔓' : '🔐'} *RESULTADO (${type.toUpperCase()})*   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📌 *Modo:* ${isDecode ? 'Decodificado' : 'Codificado'}\n`;
        doc += `📝 *Original:* \`${text.slice(0, 100)}\`\n\n`;
        doc += `╭━〔 📦 RESULTADO 〕━⬣\n`;
        doc += '┃ ```' + result + '```\n';
        doc += `╰━━━━━━━━━━━━━━━━━━⬣`;
        return reply(doc.trim());
    }
};