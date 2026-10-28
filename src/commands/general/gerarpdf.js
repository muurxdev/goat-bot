const PDFDocument = require('pdfkit');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');
const F = require('../../utils/formato');

/** Monta o PDF inteiro em memória e só devolve quando o arquivo terminou. */
function montarPdf(titulo, conteudo) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const partes = [];
        doc.on('data', b => partes.push(b));
        doc.on('end', () => resolve(Buffer.concat(partes)));
        doc.on('error', reject);
        doc.fontSize(20).text(titulo, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(conteudo);
        doc.end();
    });
}

module.exports = {
    name: 'gerarpdf',
    aliases: ['pdfia', 'criarpdf', 'documentopdf'],
    category: 'livros',
    subcategory: 'Livros & Materiais',
    description: 'Transforma o texto que você mandar em um arquivo PDF',
    usage: '<texto>',
    examples: [
        'Lista de compras: pão, leite e café — vira um PDF pronto para enviar',
        'Ata da reunião de hoje — cria o documento com esse texto'
    ],
    cooldownMs: 4000,
    execute: async ({ client, from, text, reply, info, prefix = '.' }) => {
        const botName = getBotName();
        const conteudo = String(text || '').trim();

        if (!conteudo) {
            // Antes gerava um PDF com texto padrão e o envio rodava solto num
            // evento, sem await: sem texto a pessoa não recebia nada.
            return reply(F.tela({
                emoji: '📄',
                titulo: 'Gerar PDF',
                intro: 'Eu transformo o texto que você mandar em um arquivo PDF, pronto para baixar e compartilhar.',
                secoes: [{
                    emoji: '✍️', titulo: 'Digite assim',
                    linhas: [
                        `${F.cmd(prefix, 'gerarpdf', '<texto>')}`,
                        `• ${F.cmd(prefix, 'gerarpdf', 'Lista de compras: pão, leite e café')}`,
                        `• ${F.cmd(prefix, 'gerarpdf', 'Ata da reunião: decidimos mudar o horário')}`
                    ]
                }],
                dica: 'Textos longos funcionam bem: pode colar vários parágrafos de uma vez.',
                proximos: [
                    { nome: 'livro', args: '<título>', oque: 'buscar um livro em PDF' },
                    { nome: 'resumolivro', args: '<título>', oque: 'ler a sinopse de uma obra' }
                ],
                prefix
            }));
        }

        try {
            const pdf = await montarPdf(`${botName} — Documento`, conteudo);
            const palavras = conteudo.split(/\s+/).filter(Boolean).length;
            await client.sendMessage(from, {
                document: pdf,
                mimetype: 'application/pdf',
                fileName: 'documento_' + Date.now() + '.pdf',
                caption: `📄 *Seu PDF está pronto*\n\n*Palavras:* ${palavras}\n*Tamanho:* ${Math.max(1, Math.round(pdf.length / 1024))} KB`
            }, { quoted: info });
        } catch (err) {
            logger.error(`[GERARPDF] falha ao gerar ou enviar o PDF em ${from}: ${err.message}`);
            return reply(`😕 *Não consegui montar o seu PDF agora.*\n\nTente de novo em instantes. Se o texto for muito grande, divida em partes.\n\n📌 *Exemplo:* ${F.cmd(prefix, 'gerarpdf', 'Minhas anotações de hoje')}`);
        }
    }
};
