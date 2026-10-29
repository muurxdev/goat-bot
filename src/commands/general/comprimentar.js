/**
 * Comando .comprimentar — dá boas-vindas a alguém (ou a todos) na taverna.
 */
const F = require('../../utils/formato')

const SAUDACOES = [
    'Puxe um banco, junte-se ao time e fique à vontade!',
    'A camisa 10 está pronta para você no vestiário!',
    'Chegou na hora certa: o treino tático e a resenha vão começar.'
]

module.exports = {
    name: "comprimentar",
    aliases: ["comprimentar-cmd","cmd-comprimentar"],
    category: "general",
    subcategory: "Interação",
    description: "Dá as boas-vindas do time a alguém ou a todo o grupo",
    usage: "[@pessoa ou nome]",
    examples: [" — cumprimenta todo mundo", "@pessoa — dá boas-vindas a alguém", "➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — usa um nome qualquer"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const marcado = Array.isArray(mentionedJid) ? mentionedJid[0] : mentionedJid
        const nome = args.filter(a => !String(a).startsWith('@')).join(' ').trim()
        const alvo = marcado ? '@' + String(marcado).split('@')[0] : (nome ? `*${nome}*` : 'pessoal')
        const saudacao = SAUDACOES[Math.floor(Math.random() * SAUDACOES.length)]
        const autor = '@' + String(sender || '').split('@')[0]
        return reply(F.tela({
            emoji: '👋',
            titulo: 'Bem-vindo ao Time dos Campeões',
            intro: `"Olá, ${alvo}! ${saudacao}"`,
            secoes: [{ emoji: '⚽', titulo: 'Quem recebeu', linhas: [
                F.campo('Saudação de', autor),
                F.campo('Para', marcado || nome ? alvo : 'todo o grupo')
            ] }],
            dica: marcado || nome ? 'Um toque de bola deixa a recepção completa.' : `Marque alguém para uma recepção especial: ${F.cmd(prefix, 'comprimentar', '@pessoa')}`,
            proximos: [
                { nome: 'apertodemao', args: '@pessoa', oque: 'trocar um aperto de mão' }
            ],
            prefix
        }), [sender, marcado].filter(Boolean))
    }
};
