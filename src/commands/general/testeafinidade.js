/**
 * Comando .testeafinidade — Mede no cristal a sua sintonia com alguém.
 */
const F = require('../../utils/formato')

/** Quem recebe o gesto: a pessoa marcada ou o nome digitado. */
function alvoDe(mentionedJid, args, sender) {
    const marcado = Array.isArray(mentionedJid) ? mentionedJid[0] : mentionedJid
    if (marcado && marcado !== sender) return { texto: '@' + String(marcado).split('@')[0], mencoes: [marcado] }
    const nome = (args || []).filter(a => !String(a).startsWith('@')).join(' ').trim()
    return nome ? { texto: '*' + nome + '*', mencoes: [] } : null
}

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)]

module.exports = {
    name: "testeafinidade",
    aliases: ["testeafinidade-cmd","cmd-testeafinidade"],
    category: "general",
    subcategory: "Social",
    description: "Mede no cristal a sua sintonia com alguém",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "GOAT — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "🔮",
                titulo: "Cristal de sintonia",
                intro: "O cristal mágico da taverna mede a sintonia entre duas almas. O resultado é sorteado a cada consulta. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "testeafinidade", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "testeafinidade", 'GOAT')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "darbeijo", args: "@pessoa", oque: "mandar um beijo de afeto" },
                { nome: "selaralianca", args: "@pessoa", oque: "selar uma aliança" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const pct = Math.floor(Math.random() * 40) + 60
        const leitura = pct >= 90 ? 'Almas gêmeas: o cristal quase rachou de tanto brilho.'
            : pct >= 75 ? 'Sintonia forte: lutam bem lado a lado.'
            : 'Sintonia boa, mas ainda tem caminho para trilhar juntos.'
        return reply(F.tela({
            emoji: "🔮",
            titulo: `Sintonia de ${pct}%`,
            intro: `${autor} consultou o cristal com ${alvo.texto} e o brilho marcou *${pct}%*.`,
            secoes: [{ emoji: '💞', titulo: 'Leitura do cristal', linhas: [F.barra(pct / 100), leitura] }],
            dica: "O cristal muda de humor: cada consulta dá um número novo.",
            proximos: [
                { nome: "darbeijo", args: "@pessoa", oque: "mandar um beijo de afeto" },
                { nome: "selaralianca", args: "@pessoa", oque: "selar uma aliança" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
