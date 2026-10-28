const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pagas } = require('../../services/skillTreeService')
const { formatNumber } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const SKILLS = {
    ataque: { nome: '⚔️ Ataque', custo: 2, descricao: '+10% dano em batalhas', bonus: 'atk' },
    defesa: { nome: '🛡️ Defesa', custo: 2, descricao: '+10% redução de dano recebido', bonus: 'def' },
    magia: { nome: '🔮 Magia', custo: 3, descricao: 'Habilidade de dano mágico em batalha', bonus: 'mag' },
    cura: { nome: '💚 Cura', custo: 3, descricao: 'Habilidade de cura em batalha', bonus: 'heal' },
    sorte: { nome: '🍀 Sorte', custo: 2, descricao: '+15% chance de drop raro e crítico', bonus: 'lck' }
}

const NOMES = Object.keys(SKILLS)

module.exports = {
    name: 'arvorehabilidades',
    aliases: ['skilltree', 'habilidades', 'arvhab'],
    category: 'rpg',
    subcategory: 'Progressão',
    description: 'Árvore de habilidades — desbloqueie e gerencie suas skills',
    usage: '[desbloquear <habilidade>]',
    examples: [
        ' — mostra a árvore, seus pontos e o que já foi aberto',
        'desbloquear ataque — abre a habilidade de ataque',
        'desbloquear sorte — abre a habilidade de sorte'
    ],
    cooldownMs: 5000,
    execute: async ({ sender, reply, args, prefix }) => {
        const p = prefix || '.'
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        // user.skills é dividido com a árvore de classe (skillTreeService), que usa
        // outras chaves (raiva, pele...) e às vezes grava a lista como texto JSON.
        // Aqui só contam as chaves desta árvore; as da classe ficam intactas.
        // Antes os pontos nunca eram descontados: nível 10 abria as 5 habilidades.
        const todasSkills = pagas(user)
        const unlockedSkills = todasSkills.filter(k => SKILLS[k])
        const pontosTotais = Math.floor((user.level || 1) / 5)
        const pontosGastos = unlockedSkills.reduce((soma, k) => soma + SKILLS[k].custo, 0)
        const skillPoints = Math.max(0, pontosTotais - pontosGastos)
        const proximoPontoEm = (pontosTotais + 1) * 5

        const sub = (args[0] || '').toLowerCase()

        if (!sub || sub === 'ver' || sub === 'lista') {
            const abertas = []
            const fechadas = []
            Object.entries(SKILLS).forEach(([key, s]) => {
                if (unlockedSkills.includes(key)) {
                    abertas.push(`${s.nome} — ${s.descricao}\n   Use em batalha: ${F.cmd(p, 'habilidade', key)}`)
                } else {
                    const alcanca = skillPoints >= s.custo
                    fechadas.push(`${alcanca ? '🟢' : '🔒'} ${s.nome} · ${s.custo} pontos\n   ${s.descricao}\n   ${F.cmd(p, 'arvorehabilidades', 'desbloquear ' + key)}`)
                }
            })

            return reply(F.tela({
                emoji: '🌳',
                titulo: 'Árvore de habilidades',
                intro: `Você tem *${formatNumber(skillPoints)} ${skillPoints === 1 ? 'ponto livre' : 'pontos livres'}* e *${abertas.length} de ${NOMES.length}* habilidades abertas.`,
                secoes: [
                    { emoji: '📊', titulo: 'Seus pontos', linhas: [
                        F.campo('Pontos livres', formatNumber(skillPoints)),
                        F.campo('Já gastos', formatNumber(pontosGastos)),
                        F.campo('Nível', formatNumber(user.level || 1)),
                        F.campo('Próximo ponto', `no nível ${formatNumber(proximoPontoEm)}`)
                    ] },
                    { emoji: '✅', titulo: 'Abertas', linhas: abertas },
                    { emoji: '📋', titulo: 'Para abrir', linhas: fechadas }
                ],
                dica: `Você ganha 1 ponto a cada 5 níveis. Habilidades abertas podem ser usadas em batalha com ${p}habilidade.`,
                prefix: p,
                proximos: [
                    fechadas.length ? { nome: 'arvorehabilidades', args: 'desbloquear ' + NOMES.find(k => !unlockedSkills.includes(k)), oque: 'abrir uma habilidade' } : null,
                    { nome: 'habilidade', oque: 'ver como usar em batalha' }
                ].filter(Boolean)
            }), [sender])
        }

        if (sub === 'desbloquear' || sub === 'comprar' || sub === 'unlock') {
            const skillName = (args[1] || '').toLowerCase()

            if (!skillName || !SKILLS[skillName]) {
                return reply(F.tela({
                    emoji: '🌳',
                    titulo: skillName ? 'Habilidade desconhecida' : 'Qual habilidade?',
                    intro: skillName
                        ? `Não conheço a habilidade "${args[1]}". Escolha uma destas:`
                        : 'Diga qual habilidade você quer abrir. Estas são as opções:',
                    secoes: [{ emoji: '📋', titulo: 'Habilidades', linhas: Object.entries(SKILLS).map(([k, s]) =>
                        `• ${F.cmd(p, 'arvorehabilidades', 'desbloquear ' + k)} — ${s.nome}, ${s.custo} pontos`) }],
                    dica: `Você tem ${formatNumber(skillPoints)} ${skillPoints === 1 ? 'ponto' : 'pontos'} agora.`,
                    prefix: p,
                    proximos: [{ nome: 'arvorehabilidades', oque: 'ver a árvore completa' }]
                }))
            }

            if (unlockedSkills.includes(skillName)) {
                return reply(F.tela({
                    emoji: '✅',
                    titulo: 'Habilidade já aberta',
                    intro: `Você já tem *${SKILLS[skillName].nome}*. Não precisa abrir de novo.`,
                    dica: 'Use a habilidade durante uma batalha para ativar o efeito.',
                    prefix: p,
                    proximos: [
                        { nome: 'habilidade', args: skillName, oque: 'usar em batalha' },
                        { nome: 'arvorehabilidades', oque: 'ver as outras habilidades' }
                    ]
                }))
            }

            const skill = SKILLS[skillName]

            if (skillPoints < skill.custo) {
                const nivelNecessario = (pontosGastos + skill.custo) * 5
                const niveisFaltam = nivelNecessario - (user.level || 1)
                return reply(F.tela({
                    emoji: '🔒',
                    titulo: 'Pontos insuficientes',
                    intro: `*${skill.nome}* custa *${skill.custo} pontos*, e você tem *${formatNumber(skillPoints)}*.`,
                    secoes: [{ emoji: '📊', titulo: 'Seus pontos', linhas: [
                        F.campo('Custo', `${skill.custo} pontos`),
                        F.campo('Pontos livres', formatNumber(skillPoints)),
                        F.campo('Já gastos', formatNumber(pontosGastos)),
                        F.campo('Nível', formatNumber(user.level || 1)),
                        niveisFaltam > 0 ? F.campo('Chega lá no nível', formatNumber(nivelNecessario)) : null
                    ] }],
                    dica: 'Você ganha 1 ponto a cada 5 níveis, e cada habilidade aberta gasta os pontos dela.',
                    prefix: p,
                    proximos: [
                        { nome: 'hunt', oque: 'caçar e subir de nível' },
                        { nome: 'dungeon', oque: 'subir de nível na masmorra' }
                    ]
                }))
            }

            // Grava como lista, preservando as habilidades da árvore de classe.
            user.skills = [...todasSkills, skillName]

            await dataService.saveXpData(xpData)
            logger.info(`[SKILLTREE] ${sender} desbloqueou skill ${skillName}`)

            return reply(F.tela({
                emoji: '🎉',
                titulo: 'Habilidade aberta',
                intro: `${skill.nome} agora faz parte do seu repertório: ${skill.descricao}.`,
                secoes: [{ emoji: '📜', titulo: 'Detalhes', linhas: [
                    F.campo('Habilidade', skill.nome),
                    F.campo('Efeito', skill.descricao),
                    F.campo('Custo', `${skill.custo} pontos`),
                    F.campo('Pontos livres', formatNumber(skillPoints - skill.custo)),
                    F.campo('Abertas', `${NOMES.filter(k => user.skills.includes(k)).length} de ${NOMES.length}`)
                ] }],
                dica: 'Ative o efeito durante uma batalha.',
                prefix: p,
                proximos: [
                    { nome: 'habilidade', args: skillName, oque: 'usar em batalha' },
                    { nome: 'arvorehabilidades', oque: 'ver a árvore' }
                ]
            }), [sender])
        }

        return reply(F.tela({
            emoji: '🌳',
            titulo: 'Árvore de habilidades',
            intro: `Não conheço a opção "${args[0]}". Veja o que dá para fazer:`,
            secoes: [{ emoji: '📋', titulo: 'Opções', linhas: [
                `• ${F.cmd(p, 'arvorehabilidades')} — ver a árvore e seus pontos`,
                `• ${F.cmd(p, 'arvorehabilidades', 'desbloquear <habilidade>')} — abrir uma habilidade`
            ] }],
            prefix: p,
            proximos: [{ nome: 'arvorehabilidades', args: 'desbloquear ataque', oque: 'exemplo' }]
        }))
    }
}
