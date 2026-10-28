const dataService = require('../../services/dataService')
const { initializeUser, aplicarBonusRebirthXp } = require('../../services/xpService')
const { sortearLootMob } = require('../../services/rpgService')
const { mundos } = require('../../utils/constants')
const { formatNumber, moedas, plural, marcar } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'hunt',
    aliases: ['cacar', 'caçar'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Cace monstros do seu mundo para ganhar XP, moedas e espólios',
    examples: [' — caça um monstro do mundo onde você está'],
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const mundoAtual = mundos[user.mundo || 'floresta']

        if (user.level < mundoAtual.minLevel) {
            return reply(F.tela({
                emoji: '🔒',
                titulo: `${mundoAtual.nome} ainda é perigoso demais`,
                intro: `Este mundo pede nível *${mundoAtual.minLevel}* e você está no nível *${user.level}*.`,
                secoes: [{ emoji: '📊', titulo: 'Falta pouco?', linhas: [
                    F.campo('Níveis que faltam', formatNumber(mundoAtual.minLevel - user.level))
                ] }],
                dica: 'Caçar num mundo mais tranquilo rende XP garantido até você alcançar o nível.',
                proximos: [
                    { nome: 'viajar', args: 'floresta', oque: 'voltar para a Floresta' },
                    { nome: 'mundo', oque: 'ver os mundos e o nível de cada um' }
                ]
            }))
        }

        const monstro = mundoAtual.monstros[Math.floor(Math.random() * mundoAtual.monstros.length)]

        const { calcularDanoPlayer } = require('../../services/combatEngine')
        const combat = calcularDanoPlayer(user, monstro)

        // Dano total da carreira: requisito do Lorde das Sombras em .lendaria,
        // que nunca era gravado em lugar nenhum (vai para a coluna extra).
        user.totalDamage = (Number(user.totalDamage) || 0) + (Number(combat.danoFinal) || 0)

        const poderJogador = (user.level * 35) + combat.danoFinal + Math.floor(Math.random() * 80) + 120
        const poderMonstro = Math.floor(monstro.hp / 20) + monstro.dano + Math.floor(Math.random() * 40)

        if (poderJogador >= poderMonstro) {
            const { adicionarXp } = require('../../services/xpService')
            const { xpGanho, lvlRes } = adicionarXp(user, monstro.xp, { source: 'rpg' })
            user.coins = (user.coins || 0) + monstro.coins
            user.wins = (user.wins || 0) + 1

            if (!user.inventario) user.inventario = []

            let lootMob = sortearLootMob(monstro.loot)
            if (lootMob) {
                if (user.inventario.length >= (user.mochila || 20)) {
                    lootMob = null
                } else {
                    user.inventario.push(lootMob)
                }
            }

            // Drop raro de EQUIPAMENTO do catálogo, escalado pelo nível. Sem isto os
            // 65 itens só saíam comprando na loja — caçar nunca dava equipamento.
            let equipDrop = null
            if (Math.random() < 0.08 && user.inventario.length < (user.mochila || 20)) {
                const { sortearEquipamentoDrop } = require('../../services/rpgEquipmentService')
                equipDrop = sortearEquipamentoDrop(user.level || 1)
                if (equipDrop) user.inventario.push({ ...equipDrop })
            }

            dataService.saveUser(user)
            logger.info('[HUNT] User ' + sender + ' venceu ' + monstro.nome)

            const golpe = combat.isCritico ? ' com um acerto crítico' : (combat.isDobro ? ' com um golpe duplo' : '')
            const rebirths = user.rebirthCount || user.rebirth_count
            const rebTag = rebirths ? ` (inclui +${rebirths * 25}% da reencarnação)` : ''

            const linhasEquip = equipDrop
                ? [`${equipDrop.raridade} *${equipDrop.nome}*`, `ATK +${formatNumber(equipDrop.atk)} · DEF +${formatNumber(equipDrop.def)} · ${formatNumber(equipDrop.cp)} de poder`, `Vista com ${F.cmd('.', 'equipar', equipDrop.id)}`]
                : []
            const linhasNivel = (lvlRes && lvlRes.subiu)
                ? [`Agora você está no *nível ${formatNumber(user.level)}*${lvlRes.levelsGanhos > 1 ? ` (${plural(lvlRes.levelsGanhos, 'nível', 'níveis')} de uma vez)` : ''}`, `+${formatNumber(lvlRes.ganhoHp)} HP de vida máxima · +${moedas(lvlRes.ganhoCoins)}`]
                : []
            const mochilaCheia = !lootMob && user.inventario.length >= (user.mochila || 20)

            const doc = F.tela({
                emoji: '🗡️',
                titulo: `Caçada vencida em ${mundoAtual.nome}`,
                intro: `${marcar(sender)}, você derrubou *${monstro.nome}*${golpe} e ganhou *${moedas(monstro.coins)}* e *+${formatNumber(xpGanho)} XP*.`,
                secoes: [
                    { emoji: '📜', titulo: 'Relatório da caçada', linhas: [
                        F.campo('Dano causado', formatNumber(combat.danoFinal)),
                        F.campo('XP', `+${formatNumber(xpGanho)}${rebTag}`),
                        F.campo('Moedas', `+${moedas(monstro.coins)} (total ${moedas(user.coins)})`),
                        F.campo('Espólio', lootMob || (mochilaCheia ? 'perdido, sua mochila está cheia' : 'nenhum desta vez')),
                        F.campo('Vitórias', formatNumber(user.wins))
                    ] },
                    { emoji: '🎁', titulo: 'Equipamento encontrado', linhas: linhasEquip },
                    { emoji: '🆙', titulo: 'Subiu de nível', linhas: linhasNivel }
                ],
                dica: mochilaCheia ? 'Libere espaço vendendo itens ou aumente a mochila com .mochila.' : 'Equipamentos melhores aumentam o dano e a chance de vencer monstros fortes.',
                proximos: [
                    { nome: 'hunt', oque: 'caçar de novo' },
                    equipDrop ? { nome: 'equipar', args: equipDrop.id, oque: 'vestir o que caiu' } : { nome: 'inv', oque: 'ver sua mochila' },
                    { nome: 'dungeon', oque: 'encarar uma masmorra' }
                ]
            })

            return reply(doc, [sender])
        }

        const perdaCoins = Math.min(user.coins || 0, 20)
        user.coins = Math.max(0, (user.coins || 0) - perdaCoins)
        user.losses = (user.losses || 0) + 1

        dataService.saveUser(user)
        logger.info('[HUNT] User ' + sender + ' foi derrotado por ' + monstro.nome)

        const perda = perdaCoins > 0 ? `e levou *${moedas(perdaCoins)}*` : 'mas você escapou sem perder moedas'
        return reply(F.tela({
            emoji: '💀',
            titulo: 'A caçada deu errado',
            intro: `*${monstro.nome}* pegou ${marcar(sender)} de surpresa ${perda}.`,
            secoes: [{ emoji: '📜', titulo: 'Relatório da caçada', linhas: [
                F.campo('Mundo', mundoAtual.nome),
                F.campo('Seu dano', formatNumber(combat.danoFinal)),
                F.campo('Moedas agora', moedas(user.coins)),
                F.campo('Derrotas', formatNumber(user.losses))
            ] }],
            dica: 'Cada caçada tem sorte envolvida. Com mais poder, a chance de vencer sobe bastante.',
            proximos: [
                { nome: 'hunt', oque: 'tentar de novo' },
                { nome: 'forjar', oque: 'fortalecer seus equipamentos' },
                { nome: 'shoparmas', oque: 'comprar uma arma melhor' }
            ]
        }), [sender])
    }
}
