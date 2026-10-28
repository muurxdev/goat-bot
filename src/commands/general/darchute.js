/**
 * Comando .darchute — Dá um chute de brincadeira em alguém do grupo.
 */
const F = require('../../utils/formato')

const FRASES = [
    "{alvo} saiu girando pelo ar e caiu no feno.",
    "{alvo} voou pela janela, igual ao Guardião nos dias ruins.",
    "{alvo} quicou duas vezes e pediu outra cerveja."
]

/** Quem recebe o gesto: a pessoa marcada ou o nome digitado. */
function alvoDe(mentionedJid, args, sender) {
    const marcado = Array.isArray(mentionedJid) ? mentionedJid[0] : mentionedJid
    if (marcado && marcado !== sender) return { texto: '@' + String(marcado).split('@')[0], mencoes: [marcado] }
    const nome = (args || []).filter(a => !String(a).startsWith('@')).join(' ').trim()
    return nome ? { texto: '*' + nome + '*', mencoes: [] } : null
}

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)]

module.exports = {
    name: "darchute",
    aliases: ["darchute-cmd","cmd-darchute"],
    category: "general",
    subcategory: "Interação",
    description: "Dá um chute de brincadeira em alguém do grupo",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "GOAT — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "🦵",
                titulo: "Pontapé cômico",
                intro: "Um chute de desenho animado: a vítima sai voando, mas volta inteira. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "darchute", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "darchute", 'GOAT')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "dartapa", args: "@pessoa", oque: "dar um tapa de brincadeira" },
                { nome: "duelotapao", args: "@pessoa", oque: "desafiar para um duelo de tapas" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "🦵",
            titulo: "Pontapé cômico",
            intro: `${autor} deu um chute de brincadeira em ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Na zoeira vale tudo, menos maltratar de verdade.",
            proximos: [
                { nome: "dartapa", args: "@pessoa", oque: "dar um tapa de brincadeira" },
                { nome: "duelotapao", args: "@pessoa", oque: "desafiar para um duelo de tapas" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
