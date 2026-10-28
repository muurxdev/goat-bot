/**
 * Comando .bosses — lista os chefes que o jogador já derrotou.
 *
 * O perfil mostrava só um contador ("37 bosses"), sem dizer quais. Aqui vem a
 * lista completa: quantas vezes cada chefe caiu e quando foi a última vez.
 */

const economy = require('../../services/economyService')
const bossHistory = require('../../services/bossHistoryService')
const { formatNumber } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

module.exports = {
    name: 'bosses',
    aliases: ['meusbosses', 'chefes', 'bossderrotados'],
    category: 'rpg',
    subcategory: 'Perfil',
    description: 'Lista os bosses que você já derrotou',
    usage: '[@pessoa]',
    examples: [
        ' — lista os chefes que você derrotou e quantas vezes',
        '@pessoa — mostra os chefes que outra pessoa derrotou'
    ],
    cooldownMs: 3000,
    execute: async ({ sender, info, args, reply, prefix = '.' }) => {
        // Permite consultar o histórico de outra pessoa marcando ela.
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const alvo = mencionado || sender
        const user = economy.carregarUsuario(alvo)
        const quem = mencionado ? `@${alvo.split('@')[0]}` : 'Você'
        const mencoes = mencionado ? [alvo] : []

        const total = Number(user.bossesMortos || 0)
        const lista = bossHistory.resumoOrdenado(user)

        if (!lista.length) {
            // Um veterano de antes deste recurso tem contador mas não tem
            // histórico — dizer "nunca derrotou" seria mentira.
            if (total > 0) {
                return reply(F.tela({
                    emoji: '💀',
                    titulo: 'Chefes derrotados',
                    intro: `${quem} já derrubou *${formatNumber(total)}* chefe(s), mas esses abates são de antes de eu anotar nome e data.`,
                    secoes: [{ emoji: '📜', titulo: 'Histórico', linhas: [
                        F.campo('Total de abates', formatNumber(total)),
                        'Os próximos abates aparecem aqui com o nome do chefe e a data.'
                    ] }],
                    proximos: [
                        { nome: 'boss', args: 'lista', oque: 'ver os chefes que dá para enfrentar' },
                        { nome: 'rankbosses', oque: 'ver quem mais derrubou chefes' }
                    ],
                    prefix
                }), mencoes)
            }
            return reply(F.tela({
                emoji: '💀',
                titulo: 'Chefes derrotados',
                intro: mencionado
                    ? `${quem} ainda não derrotou nenhum chefe. Quando derrotar, aqui aparece cada chefe, quantas vezes caiu e quando foi.`
                    : 'Você ainda não derrotou nenhum chefe. Quando derrotar, aqui aparece cada chefe, quantas vezes caiu e quando foi.',
                secoes: [{ emoji: '🎯', titulo: 'Como enfrentar um chefe', linhas: [
                    `• ${F.cmd(prefix, 'boss', 'lista')} — ver os chefes e onde vivem`,
                    `• ${F.cmd(prefix, 'boss', 'criar <código>')} — invocar um chefe`,
                    `• ${F.cmd(prefix, 'raid', 'criar')} — chamar um titã para enfrentar com o grupo`
                ] }],
                dica: 'Chefes também aparecem a cada 5 andares da masmorra.',
                proximos: [
                    { nome: 'boss', args: 'lista', oque: 'escolher um chefe' },
                    { nome: 'dungeon', oque: 'descer a masmorra' }
                ],
                prefix
            }), mencoes)
        }

        const recentes = bossHistory.historicoRecente(user, 5)
        const favorito = lista[0]

        return reply(F.tela({
            emoji: '💀',
            titulo: 'Chefes derrotados',
            intro: `${quem} tem *${formatNumber(total)}* abate(s) em *${lista.length}* chefe(s) diferente(s). O mais derrubado é *${favorito.nome}* (${favorito.vezes}x).`,
            secoes: [
                { emoji: '📜', titulo: 'Por chefe', linhas: lista.map(b =>
                    `${bossHistory.emojiDe(b.raridade)} *${b.nome}* — ${b.vezes}x, último ${bossHistory.dataRelativa(b.ultimo)}`) },
                { emoji: '⏱️', titulo: 'Últimos abates', linhas: recentes.map(r =>
                    `${r.tipo === 'raid' ? '⚔️' : '💀'} ${r.nome} — ${bossHistory.dataRelativa(r.em)}${r.dano ? ` · dano ${formatNumber(r.dano)}` : ''}`) }
            ],
            dica: 'Chefes de raid contam para todos que participaram.',
            proximos: [
                { nome: 'boss', args: 'lista', oque: 'enfrentar outro chefe' },
                { nome: 'rankbosses', oque: 'ver o ranking de caçadores de chefes' }
            ],
            prefix
        }), mencoes)
    }
}
