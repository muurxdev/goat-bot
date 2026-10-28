const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { petsDisponiveis } = require('../../utils/constants')
const { moedas, plural } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const precosPets = {
    cachorro: 500,
    gato: 500,
    raposa: 1200,
    lobo: 1500,
    aguia: 1500,
    robo: 2500
}

const precoDe = id => precosPets[id] || 1000
const nomeDe = id => petsDisponiveis[id]?.nome || id

module.exports = {
    name: 'pet',
    aliases: ['pets', 'mascote'],
    category: 'rpg',
    subcategory: 'Economia',
    description: 'Compre um pet companheiro que dá bônus de dano, XP ou moedas',
    usage: '[loja | meus | comprar <código> | equipar <código>]',
    examples: [
        ' — mostra a loja de pets com preço e bônus',
        'meus — lista seus pets e quem acompanha você',
        'comprar cachorro — compra o Cachorro',
        'equipar cachorro — leva o Cachorro para as batalhas'
    ],
    execute: async ({ args, sender, reply, prefix = '.' }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nomePet = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const saldo = user.coins || 0
        const meus = Array.isArray(user.pets) ? user.pets : []

        const telaLoja = (extra = {}) => {
            const linhas = Object.entries(petsDisponiveis).flatMap(([id, p]) => {
                const selo = meus.includes(id) ? ' · _já é seu_' : ''
                return [
                    '• ' + p.nome + ' — ' + moedas(precoDe(id)) + selo,
                    '   ' + p.bonus + ' · ' + F.cmd(prefix, 'pet', 'comprar ' + id)
                ]
            })
            return F.tela({
                emoji: extra.emoji || '🐾',
                titulo: extra.titulo || 'Loja de pets',
                intro: extra.intro || ('Seu saldo: *' + moedas(saldo) + '*. Um pet acompanha você nas lutas contra chefes e dá um bônus.'),
                secoes: [{ emoji: '📜', titulo: 'Pets à venda', linhas }],
                dica: 'Só um pet acompanha você por vez, mas os que você comprou ficam guardados para trocar.',
                proximos: [
                    { nome: 'pet', args: 'meus', oque: 'ver os seus pets' },
                    { nome: 'pet', args: 'equipar <código>', oque: 'escolher quem vai com você' }
                ],
                prefix
            })
        }

        if (!acao || acao === 'loja') return reply(telaLoja())

        if (acao === 'meus') {
            if (meus.length === 0) {
                return reply(F.tela({
                    emoji: '🐾',
                    titulo: 'Você ainda não tem pets',
                    intro: 'Nenhum companheiro por aqui ainda. O mais barato custa ' + moedas(Math.min(...Object.keys(petsDisponiveis).map(precoDe))) + '.',
                    dica: 'Pets dão bônus de dano, XP ou moedas nas lutas contra chefes.',
                    proximos: [
                        { nome: 'pet', args: 'loja', oque: 'ver os pets à venda' },
                        { nome: 'pet', args: 'comprar cachorro', oque: 'comprar o Cachorro' }
                    ],
                    prefix
                }))
            }
            const equipado = user.pet ? nomeDe(user.pet) : 'nenhum'
            return reply(F.tela({
                emoji: '🐾',
                titulo: 'Seus pets',
                intro: 'Você tem *' + plural(meus.length, 'pet', 'pets') + '*. Acompanhando você: *' + equipado + '*.',
                secoes: [{ emoji: '📜', titulo: 'Companheiros', linhas: meus.map(p => {
                    const atual = p === user.pet ? ' · _com você_' : ''
                    return '• ' + nomeDe(p) + ' — ' + (petsDisponiveis[p]?.bonus || 'sem bônus conhecido') + ' · ' + F.cmd(prefix, 'pet', 'equipar ' + p) + atual
                }) }],
                dica: user.pet ? '' : 'Nenhum pet está com você: equipe um para o bônus valer.',
                proximos: [
                    { nome: 'pet', args: 'equipar ' + meus[0], oque: 'levar ' + nomeDe(meus[0]) },
                    { nome: 'pet', args: 'loja', oque: 'ver outros pets' }
                ],
                prefix
            }))
        }

        if (acao === 'comprar') {
            if (!nomePet) {
                return reply(telaLoja({
                    titulo: 'Qual pet você quer?',
                    intro: 'Digite ' + F.cmd(prefix, 'pet', 'comprar <código>') + ' com o código de um pet abaixo. Seu saldo: *' + moedas(saldo) + '*.'
                }))
            }
            if (!petsDisponiveis[nomePet]) {
                return reply(telaLoja({
                    emoji: '❌',
                    titulo: 'Não conheço esse pet',
                    intro: '"' + nomePet + '" não está na loja. Use um dos códigos abaixo, por exemplo ' + F.cmd(prefix, 'pet', 'comprar cachorro') + '.'
                }))
            }

            if (!user.pets) user.pets = []
            if (user.pets.includes(nomePet)) {
                return reply(F.tela({
                    emoji: '🐾',
                    titulo: 'Esse pet já é seu',
                    intro: nomeDe(nomePet) + ' já está com você' + (user.pet === nomePet ? ' e acompanhando nas lutas.' : ', guardado.'),
                    proximos: [
                        user.pet === nomePet ? null : { nome: 'pet', args: 'equipar ' + nomePet, oque: 'levar ' + nomeDe(nomePet) },
                        { nome: 'pet', args: 'loja', oque: 'ver outros pets' }
                    ].filter(Boolean),
                    prefix
                }))
            }

            const preco = precoDe(nomePet)
            if (saldo < preco) {
                return reply(F.tela({
                    emoji: '🪙',
                    titulo: 'Moedas insuficientes',
                    intro: nomeDe(nomePet) + ' custa *' + moedas(preco) + '* e você tem ' + moedas(saldo) + '. Faltam *' + moedas(preco - saldo) + '*.',
                    secoes: [{ emoji: '🐾', titulo: 'O pet', linhas: [F.campo('Bônus', petsDisponiveis[nomePet].bonus)] }],
                    proximos: [
                        { nome: 'trabalhar', oque: 'ganhar moedas trabalhando' },
                        { nome: 'hunt', oque: 'caçar monstros por moedas' },
                        { nome: 'pet', args: 'loja', oque: 'ver pets mais baratos' }
                    ],
                    prefix
                }))
            }

            user.coins -= preco
            user.pets.push(nomePet)
            await dataService.saveXpData(xpData)
            logger.info('[PET] User ' + sender + ' comprou pet ' + nomePet)

            return reply(F.tela({
                emoji: '🎉',
                titulo: 'Pet novo',
                intro: nomeDe(nomePet) + ' agora é seu! Equipe para ele acompanhar você nas lutas.',
                secoes: [{ emoji: '📜', titulo: 'Compra', linhas: [
                    F.campo('Bônus', petsDisponiveis[nomePet].bonus),
                    F.campo('Preço', moedas(preco)),
                    F.campo('Saldo', moedas(user.coins))
                ] }],
                proximos: [
                    { nome: 'pet', args: 'equipar ' + nomePet, oque: 'levar ' + nomeDe(nomePet) + ' junto' },
                    { nome: 'pet', args: 'meus', oque: 'ver seus pets' }
                ],
                prefix
            }))
        }

        if (acao === 'equipar') {
            if (!nomePet || !user.pets || !user.pets.includes(nomePet)) {
                const temAlgum = meus.length > 0
                const linhas = temAlgum
                    ? meus.map(p => '• ' + F.cmd(prefix, 'pet', 'equipar ' + p) + ' — ' + nomeDe(p))
                    : []
                return reply(F.tela({
                    emoji: nomePet ? '❌' : '🐾',
                    titulo: nomePet ? 'Você não tem esse pet' : 'Qual pet vai com você?',
                    intro: nomePet
                        ? (petsDisponiveis[nomePet]
                            ? nomeDe(nomePet) + ' ainda não é seu. Ele custa ' + moedas(precoDe(nomePet)) + '.'
                            : '"' + nomePet + '" não é um pet que eu conheça.')
                        : 'Digite ' + F.cmd(prefix, 'pet', 'equipar <código>') + ' com o código de um pet seu.',
                    secoes: [{ emoji: '📜', titulo: 'Seus pets', linhas }],
                    dica: temAlgum ? '' : 'Você ainda não tem nenhum pet. Compre um na loja primeiro.',
                    proximos: [
                        (nomePet && petsDisponiveis[nomePet]) ? { nome: 'pet', args: 'comprar ' + nomePet, oque: 'comprar ' + nomeDe(nomePet) } : null,
                        { nome: 'pet', args: 'loja', oque: 'ver os pets à venda' }
                    ].filter(Boolean),
                    prefix
                }))
            }

            user.pet = nomePet
            await dataService.saveXpData(xpData)
            logger.info('[PET] User ' + sender + ' equipou pet ' + nomePet)

            return reply(F.tela({
                emoji: '🐾',
                titulo: 'Companheiro escolhido',
                intro: nomeDe(nomePet) + ' agora acompanha você.',
                secoes: [{ emoji: '📜', titulo: 'Bônus ativo', linhas: [F.campo('Bônus', petsDisponiveis[nomePet]?.bonus)] }],
                proximos: [
                    { nome: 'boss', oque: 'levar o pet para enfrentar um chefe' },
                    { nome: 'pet', args: 'meus', oque: 'ver seus pets' }
                ],
                prefix
            }))
        }

        const talvezPet = petsDisponiveis[acao]
        return reply(F.tela({
            emoji: '❌',
            titulo: 'Não entendi',
            intro: talvezPet
                ? 'Quer fazer o quê com ' + nomeDe(acao) + '? Diga se é para comprar ou equipar.'
                : '"' + acao + '" não é uma opção de pets.',
            secoes: [{ emoji: '📜', titulo: 'O que dá para fazer', linhas: [
                '• ' + F.cmd(prefix, 'pet', 'loja') + ' — ver os pets à venda',
                '• ' + F.cmd(prefix, 'pet', 'meus') + ' — ver os seus pets',
                '• ' + F.cmd(prefix, 'pet', 'comprar ' + (talvezPet ? acao : '<código>')) + ' — comprar um pet',
                '• ' + F.cmd(prefix, 'pet', 'equipar ' + (talvezPet ? acao : '<código>')) + ' — levar um pet com você'
            ] }],
            prefix
        }))
    }
}
