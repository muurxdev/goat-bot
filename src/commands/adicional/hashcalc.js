/**
 * Comando .hashcalc / .hash
 * Calcula checksums e hashes criptográficos (MD5, SHA1, SHA256, SHA512)
 */

const crypto = require('crypto');
const F = require('../../utils/formato');

module.exports = {
    name: 'hashcalc',
    aliases: ["gerarhash","calchash","checksumgerar","cmd_hashcalc","alt_hashcalc","atalho_hashcalc","abrev_hashcalc","call_hashcalc","func_hashcalc"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Gera os códigos de verificação MD5 e SHA de um texto',
    usage: '<texto>',
    examples: ['taverna — calcula os códigos do texto'],
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = '.' }) => {
        const text = args.join(' ').trim();
        if (!text) {
            return reply(F.tela({
                emoji: '🔐', titulo: 'Código de verificação', prefix,
                intro: 'Mande um texto e eu calculo as "impressões digitais" dele (MD5, SHA-1, SHA-256 e SHA-512). O mesmo texto sempre gera o mesmo código; qualquer letra diferente muda tudo.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'hashcalc', '<texto>')] }],
                dica: 'Não mande senhas reais: a mensagem fica visível na conversa.',
                proximos: [
                    { nome: 'hashcalc', args: 'taverna', oque: 'exemplo pronto' },
                    { nome: 'codificar', oque: 'transforma texto em Morse, binário e outros' }
                ]
            }));
        }

        const md5 = crypto.createHash('md5').update(text).digest('hex');
        const sha1 = crypto.createHash('sha1').update(text).digest('hex');
        const sha256 = crypto.createHash('sha256').update(text).digest('hex');
        const sha512 = crypto.createHash('sha512').update(text).digest('hex');

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    🔐 *HASHES CRIPTOGRÁFICOS* 🔐    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📝 *Entrada:* \`${text.slice(0, 80)}\`\n\n`;
        doc += `╭━〔 🛡️ HASHES GERADOS 〕━⬣\n`;
        doc += `┃ 🔹 *MD5 (128-bit):*\n┃ \`${md5}\`\n\n`;
        doc += `┃ 🔹 *SHA-1 (160-bit):*\n┃ \`${sha1}\`\n\n`;
        doc += `┃ 🔹 *SHA-256 (256-bit):*\n┃ \`${sha256}\`\n\n`;
        doc += `┃ 🔹 *SHA-512 (512-bit):*\n┃ \`${sha512.slice(0, 64)}...\`\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`;
        doc += `💡 _Para conferir um arquivo ou texto, compare o código: se for igual, o conteúdo é o mesmo._`;

        return reply(doc.trim());
    }
};