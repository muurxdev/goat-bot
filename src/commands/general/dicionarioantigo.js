/**
 * Comando .dicionarioantigo — significado de termos antigos do Reino.
 */
const F = require('../../utils/formato')

const DICIONARIO = {
    reino: "Antiga terra mística onde convivem humanos, fadas, gigantes, deusas e demônios.",
    purgatorio: "Dimensão de escuridão extrema onde o tempo passa milhares de vezes mais rápido.",
    mandamento: "Fragmento do poder absoluto que o Rei Demônio concedeu aos seus guerreiros de elite.",
    graca: "Bênção divina que a Deusa Suprema dividiu entre os Quatro Arcanjos."
}

const TITULOS = { reino: 'Reino', purgatorio: 'Purgatório', mandamento: 'Mandamento', graca: 'Graça' }

const semAcento = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

module.exports = {
    name: "dicionarioantigo",
    aliases: ["dicionarioantigo-cmd","cmd-dicionarioantigo"],
    category: "general",
    subcategory: "Conhecimento",
    description: "Explica termos antigos do Reino, como mandamento e graça",
    usage: "<termo>",
    examples: ["mandamento — o poder do Rei Demônio", "purgatorio — a dimensão da escuridão"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const termo = semAcento(args[0])
        const termos = Object.keys(DICIONARIO)
        const listaTermos = termos.map(t => `• ${F.cmd(prefix, 'dicionarioantigo', t)}`)

        if (!termo) {
            return reply(F.tela({
                emoji: '📖',
                titulo: 'Dicionário arcano',
                intro: 'Os manuscritos da biblioteca de Mago guardam o significado das palavras antigas do Reino. Escolha um termo:',
                secoes: [{ emoji: '📜', titulo: 'Termos guardados', linhas: listaTermos }],
                dica: 'Pode digitar com ou sem acento.',
                prefix
            }))
        }

        const desc = DICIONARIO[termo]
        if (!desc) {
            return reply(F.tela({
                emoji: '📖',
                titulo: 'Termo não encontrado',
                intro: `Procurei *${args[0]}* nos manuscritos de Mago, mas essa palavra ainda não foi registrada.`,
                secoes: [{ emoji: '📜', titulo: 'Termos que eu conheço', linhas: listaTermos }],
                prefix
            }))
        }

        const outros = termos.filter(t => t !== termo).slice(0, 2)
        return reply(F.tela({
            emoji: '📖',
            titulo: TITULOS[termo],
            intro: desc,
            dica: 'Palavra registrada nos manuscritos da biblioteca de Mago.',
            proximos: outros.map(t => ({ nome: 'dicionarioantigo', args: t, oque: 'ver outro termo' })),
            prefix
        }))
    }
};
