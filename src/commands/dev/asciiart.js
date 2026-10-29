/**
 * Comando .asciiart
 * Gera um banner simples em arte ASCII com o texto pedido.
 *
 * Antes respondia sempre o mesmo banner fixo com o nome antigo do bot,
 * ignorando o que a pessoa digitava.
 */

const { getBotName } = require("../../config/botConfig");
const F = require("../../utils/formato");

const LIMITE = 24;

/** Nome do bot só com letras ASCII (o nome estilizado usa letras decorativas). */
function nomeSimples() {
    const n = String(getBotName() || '').normalize('NFKC');
    const palavra = n.match(/[A-Z][a-z]{2,}/);
    return palavra ? palavra[0] : '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤';
}

module.exports = {
    name: "asciiart",
    aliases: ["gerarascii","arteascii","cmd_asciiart","alt_asciiart","atalho_asciiart","abrev_asciiart","call_asciiart","func_asciiart"],
    category: "dev",
    subcategory: "Texto",
    description: "Gera um banner em arte ASCII com o texto que você escrever",
    usage: '[texto]',
    examples: [' — banner com o meu nome', 'Reino — banner com a palavra Reino', 'Deploy OK — funciona com espaços'],
    cooldownMs: 2000,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const pedido = args.join(' ').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
        const texto = (pedido || nomeSimples()).slice(0, LIMITE).toUpperCase();
        const miolo = texto.split('').join(' ');
        const borda = '+' + '-'.repeat(miolo.length + 4) + '+';
        const banner = [borda, '|  ' + miolo + '  |', borda].join('\n');

        return reply(F.tela({
            emoji: '🎨',
            titulo: 'Banner em arte ASCII',
            intro: '```\n' + banner + '\n```',
            secoes: [{
                emoji: '📋', titulo: 'Detalhes',
                linhas: [
                    F.campo('Texto', texto),
                    F.campo('Largura', `${borda.length} colunas`),
                    args.length && pedido.length > LIMITE ? F.campo('Aviso', `cortei em ${LIMITE} letras`) : null
                ]
            }],
            dica: 'Acentos e emojis saem do banner porque não existem na tabela ASCII. No celular, vire a tela se a moldura quebrar.',
            proximos: [
                { nome: 'asciiart', args: 'Reino', oque: 'banner com outro texto' },
                { nome: 'zalgotext', args: 'texto', oque: 'texto com efeito bagunçado' }
            ],
            prefix
        }));
    }
};
