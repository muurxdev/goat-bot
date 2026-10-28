/**
 * Comando .lendaria / .classelendaria / .lendarias
 * Classes lendárias supremas — visualização, info e desbloqueio
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classesLendarias } = require('../../utils/constants')
const { formatNumber } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** Item do inventário casa com o nome de um espólio pedido. */
function casaItem(i, item) {
    if (typeof i === 'object' && i !== null) {
        return (i.nome && i.nome.includes(item)) || (i.id && i.id.includes(item))
    }
    return typeof i === 'string' && i.includes(item)
}

/** Tela de classe não encontrada / nome faltando. */
function telaNome(p, acao, intro) {
    const ids = Object.keys(classesLendarias)
    return F.tela({
        emoji: '🔮',
        titulo: 'Qual classe lendária?',
        intro,
        secoes: [{ emoji: '📜', titulo: 'Nomes que eu conheço', linhas: ids.map(id => `• ${F.cmd(p, 'lendaria', `${acao} ${id}`)} — ${classesLendarias[id].nome}`) }],
        prefix: p,
        proximos: [{ nome: 'lendaria', oque: 'ver todas com requisitos' }]
    })
}

module.exports = {
    name: 'lendaria',
    aliases: ['classelendaria', 'lendarias'],
    category: 'rpg',
    subcategory: 'Classes',
    description: 'Classes lendárias supremas com habilidades passivas de combate',
    usage: '[lista | info <nome> | desbloquear <nome>]',
    examples: [
        ' — lista as classes lendárias e o que cada uma pede',
        'info dragonite — detalhes e espólios do Cavaleiro Dracônico',
        'desbloquear dragonite — vira Cavaleiro Dracônico se cumprir tudo'
    ],
    cooldownMs: 2000,
    execute: async ({ args, sender, reply, prefix }) => {
        const p = prefix || '.'
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nome = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const atual = user.classeLendaria ? classesLendarias[user.classeLendaria] : null

        if (!acao || acao === 'lista') {
            const secoes = Object.entries(classesLendarias).map(([id, l]) => ({
                emoji: user.classeLendaria === id ? '✅' : '🔮',
                titulo: l.nome,
                linhas: [
                    F.campo('Requisito', l.requisito),
                    F.campo('Habilidade', l.habilidade),
                    l.loots && l.loots.length ? F.campo('Espólios', l.loots.join(', ')) : null,
                    user.classeLendaria === id ? 'É a sua classe atual.' : `Desbloquear: ${F.cmd(p, 'lendaria', 'desbloquear ' + id)}`
                ]
            }))
            return reply(F.tela({
                emoji: '👑',
                titulo: 'Classes lendárias',
                intro: atual
                    ? `Sua classe lendária é *${atual.nome}*. Estas são todas as que existem no Reino.`
                    : 'Classes lendárias dão habilidades poderosas em combate. Cada uma pede nível, feitos e espólios raros, que são consumidos no desbloqueio.',
                secoes,
                dica: 'Espólios raros caem de chefes, raids e da masmorra. Use info para ver exatamente o que falta.',
                prefix: p,
                proximos: [
                    { nome: 'lendaria', args: 'info dragonite', oque: 'ver os detalhes de uma classe' },
                    { nome: 'inv', oque: 'conferir os espólios na mochila' }
                ]
            }))
        }

        if (acao === 'info') {
            if (!nome) return reply(telaNome(p, 'info', 'Diga o nome da classe que você quer conhecer.'))
            const l = classesLendarias[nome]
            if (!l) return reply(telaNome(p, 'info', `Não conheço a classe "${args[1]}". Confira os nomes abaixo.`))

            const inventario = Array.isArray(user.inventario) ? user.inventario : []
            const linhasLoot = (l.loots || []).map(item => `${inventario.some(i => casaItem(i, item)) ? '✅' : '⬜'} ${item}`)

            return reply(F.tela({
                emoji: '🔮',
                titulo: l.nome,
                intro: l.habilidade,
                secoes: [
                    { emoji: '📜', titulo: 'Requisitos', linhas: [
                        F.campo('Pede', l.requisito),
                        F.campo('Seu nível', formatNumber(user.level || 1)),
                        F.campo('Chefes derrotados', formatNumber(user.bossesMortos || 0)),
                        F.campo('Vitórias', formatNumber(user.wins || 0))
                    ] },
                    { emoji: '📦', titulo: 'Espólios consumidos', linhas: linhasLoot }
                ],
                dica: user.classeLendaria === nome
                    ? 'Esta já é a sua classe lendária.'
                    : 'Os espólios marcados com ✅ já estão na sua mochila.',
                prefix: p,
                proximos: [
                    user.classeLendaria === nome ? null : { nome: 'lendaria', args: 'desbloquear ' + nome, oque: 'desbloquear esta classe' },
                    { nome: 'lendaria', oque: 'ver todas as classes' }
                ].filter(Boolean)
            }))
        }

        if (acao === 'desbloquear') {
            if (!nome) return reply(telaNome(p, 'desbloquear', 'Diga o nome da classe que você quer desbloquear.'))
            const lendariaEscolhida = classesLendarias[nome]
            if (!lendariaEscolhida) return reply(telaNome(p, 'desbloquear', `Não conheço a classe "${args[1]}". Confira os nomes abaixo.`))

            // Desbloquear de novo a classe atual consumia os espólios outra vez (e,
            // no goat_assault, somava +200 de vida a cada repetição).
            if (user.classeLendaria === nome) {
                return reply(F.tela({
                    emoji: '✅',
                    titulo: 'Essa já é a sua classe',
                    intro: `Você já é *${lendariaEscolhida.nome}*. Não consumi nenhum espólio.`,
                    secoes: [{ emoji: '⚔️', titulo: 'Habilidade', linhas: [lendariaEscolhida.habilidade] }],
                    dica: 'Para trocar, desbloqueie outra classe lendária: a atual é substituída.',
                    prefix: p,
                    proximos: [
                        { nome: 'lendaria', oque: 'ver as outras classes' },
                        { nome: 'perfil', oque: 'ver seu perfil' }
                    ]
                }))
            }

            const faltaRequisito = (oQueFalta, atualTxt) => reply(F.tela({
                emoji: '🔒',
                titulo: 'Requisito não cumprido',
                intro: `Para ser *${lendariaEscolhida.nome}*, você precisa ${oQueFalta}.`,
                secoes: [{ emoji: '📊', titulo: 'Onde você está', linhas: [
                    F.campo('Pede', lendariaEscolhida.requisito),
                    atualTxt
                ] }],
                dica: 'Nada foi consumido. Volte quando cumprir tudo.',
                prefix: p,
                proximos: [
                    { nome: 'lendaria', args: 'info ' + nome, oque: 'ver tudo o que esta classe pede' },
                    { nome: 'boss', oque: 'derrotar chefes' }
                ]
            }))
            const nivelTxt = F.campo('Seu nível', formatNumber(user.level || 1))
            const bossTxt = F.campo('Chefes derrotados', formatNumber(user.bossesMortos || 0))

            // Verificar requisitos
            if (nome === 'dragonite') {
                if (user.level < 60) return faltaRequisito('chegar ao nível 60', nivelTxt)
                if ((user.bossesMortos || 0) < 30) return faltaRequisito('derrotar 30 chefes', bossTxt)
            }
            if (nome === 'lordesombras') {
                if (user.level < 50) return faltaRequisito('chegar ao nível 50', nivelTxt)
                const totalDano = (user.totalDamage || user.total_damage || 0)
                if (totalDano < 1000) return faltaRequisito('causar 1.000 de dano no total', F.campo('Seu dano total', formatNumber(totalDano)))
            }
            if (nome === 'arcanosupremo') {
                if (user.level < 80) return faltaRequisito('chegar ao nível 80', nivelTxt)
                if ((user.bossesMortos || 0) < 50) return faltaRequisito('derrotar 50 chefes', bossTxt)
            }
            if (nome === 'sentinela') {
                if (user.level < 70) return faltaRequisito('chegar ao nível 70', nivelTxt)
                const totalDef = (user.totalDef || user.total_def || 0)
                if (totalDef < 200) return faltaRequisito('acumular 200 de defesa total', F.campo('Sua defesa acumulada', formatNumber(totalDef)))
            }
            if (nome === 'pecado_ira') {
                if (user.level < 60) return faltaRequisito('chegar ao nível 60', nivelTxt)
                if ((user.bossesMortos || 0) < 30) return faltaRequisito('derrotar 30 chefes', bossTxt)
            }
            if (nome === 'goat_assault') {
                if (user.level < 80) return faltaRequisito('chegar ao nível 80', nivelTxt)
                if ((user.bossesMortos || 0) < 100) return faltaRequisito('derrotar 100 chefes', bossTxt)
                if ((user.wins || 0) < 50) return faltaRequisito('ter 50 vitórias', F.campo('Suas vitórias', formatNumber(user.wins || 0)))
            }

            // Verificar loots necessários
            if (lendariaEscolhida.loots && lendariaEscolhida.loots.length > 0) {
                const inventario = Array.isArray(user.inventario) ? user.inventario : []
                const faltando = lendariaEscolhida.loots.filter(item => !inventario.some(i => casaItem(i, item)))

                if (faltando.length > 0) {
                    const temos = lendariaEscolhida.loots.filter(item => !faltando.includes(item))
                    return reply(F.tela({
                        emoji: '📦',
                        titulo: 'Faltam espólios',
                        intro: `Você cumpre os requisitos de *${lendariaEscolhida.nome}*, mas ainda faltam *${faltando.length}* espólio(s) na mochila.`,
                        secoes: [
                            { emoji: '⬜', titulo: 'Faltam', linhas: F.lista(faltando) },
                            { emoji: '✅', titulo: 'Já tem', linhas: F.lista(temos) }
                        ],
                        dica: 'Espólios raros caem de chefes, raids e dos andares com chefe da masmorra. Nada foi consumido.',
                        prefix: p,
                        proximos: [
                            { nome: 'boss', oque: 'caçar espólios em chefes' },
                            { nome: 'raid', args: 'criar', oque: 'chamar um titã com o grupo' },
                            { nome: 'inv', oque: 'conferir sua mochila' }
                        ]
                    }))
                }

                // Remover loots do inventário
                lendariaEscolhida.loots.forEach(item => {
                    const idx = user.inventario.findIndex(i => casaItem(i, item))
                    if (idx !== -1) user.inventario.splice(idx, 1)
                })
            }

            const anterior = atual
            user.classeLendaria = nome
            if (nome === 'goat_assault') {
                user.hpMax = (user.hpMax || 100) + 200
                user.hp = user.hpMax
            }
            // Se os espólios eram tudo o que havia na mochila, ela fica '[]', que o
            // save normal ignora (preserva o inventário antigo): os espólios nunca
            // eram consumidos de verdade. Nesse caso grava com force.
            dataService.saveUser(user, user.inventario.length ? undefined : { force: true })
            logger.info(`[LENDARIA] ${sender} desbloqueou classe lendária ${nome}`)

            return reply(F.tela({
                emoji: '🌟',
                titulo: 'Classe lendária desbloqueada',
                intro: `Agora você é *${lendariaEscolhida.nome}*.`,
                secoes: [
                    { emoji: '⚔️', titulo: 'Habilidade', linhas: [lendariaEscolhida.habilidade] },
                    { emoji: '📦', titulo: 'Espólios consumidos', linhas: F.lista(lendariaEscolhida.loots || []) },
                    { emoji: '🔄', titulo: 'Troca de classe', linhas: anterior && anterior !== lendariaEscolhida ? [F.campo('Classe anterior', anterior.nome)] : [] }
                ],
                dica: 'A classe lendária também dá +500 de dano e chance de golpe duplo nas raids do grupo.',
                prefix: p,
                proximos: [
                    { nome: 'perfil', oque: 'ver seu perfil com a nova classe' },
                    { nome: 'boss', oque: 'testar a habilidade num chefe' }
                ]
            }))
        }

        return reply(F.tela({
            emoji: '👑',
            titulo: 'Classes lendárias',
            intro: `Não conheço a opção "${args[0]}". Veja o que dá para fazer:`,
            secoes: [{ emoji: '📋', titulo: 'Opções', linhas: [
                `• ${F.cmd(p, 'lendaria')} — ver todas as classes`,
                `• ${F.cmd(p, 'lendaria', 'info <nome>')} — detalhes de uma classe`,
                `• ${F.cmd(p, 'lendaria', 'desbloquear <nome>')} — virar essa classe`
            ] }],
            prefix: p,
            proximos: [{ nome: 'lendaria', args: 'info dragonite', oque: 'exemplo de detalhes' }]
        }))
    }
}
