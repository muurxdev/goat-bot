const dataService = require('../../services/dataService')
const { initializeUser, getXpProgress } = require('../../services/xpService')
const { getCargo, getRank } = require('../../utils/helpers')
const { achievementsCatalog } = require('../../services/achievementEngine')
const { resolveHp, calculateFullCharacterStats } = require('../../services/characterEngine')
const { getItem } = require('../../services/rpgEquipmentService')
const { formatNumber, moedas } = require('../../utils/textoRpg')
const cartao = require('../../services/cartaoService')
const F = require('../../utils/formato')

/** "3 dias", "5 horas", "menos de 1 hora" */
function tempoDesde(data) {
    if (!data) return null
    const ms = Date.now() - new Date(data).getTime()
    if (!Number.isFinite(ms) || ms < 0) return null
    const dias = Math.floor(ms / 86400000)
    if (dias > 0) return dias === 1 ? '1 dia' : `${formatNumber(dias)} dias`
    const horas = Math.floor(ms / 3600000)
    return horas > 0 ? (horas === 1 ? '1 hora' : `${horas} horas`) : 'menos de 1 hora'
}

function compacto(n) {
    const v = Number(n) || 0
    if (v >= 1e9) return `${String(Math.round(v / 1e8) / 10).replace('.', ',')} bi`
    if (v >= 1e6) return `${String(Math.round(v / 1e5) / 10).replace('.', ',')} mi`
    if (v >= 1e4) return `${String(Math.round(v / 100) / 10).replace('.', ',')} mil`
    return formatNumber(v)
}

module.exports = {
    name: 'perfil',
    aliases: ['profile', 'meustatus', 'statusrpg'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Seu perfil completo em cartão: nível, poder, equipamento, de onde vem seu XP e patrimônio',
    cooldownMs: 3000,
    usage: '[@pessoa]',
    examples: [' — o seu perfil', '@pessoa — o perfil de outra pessoa'],
    execute: async ({ args, sender, senderReal, info, from, client, reply, prefix = '.' }) => {
        const targetClean = (args && args[0]) ? args[0].replace(/[@\s]/g, '').replace(/\D/g, '') : ''
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant
        const alvo = mentioned || quotedParticipant || (targetClean ? (targetClean + '@s.whatsapp.net') : (senderReal || sender))
        const proprio = alvo === sender || alvo === senderReal
        const marca = '@' + alvo.split('@')[0].split(':')[0]

        const xpData = dataService.getXpData()
        const user = initializeUser(alvo, xpData, [alvo, sender, senderReal].filter(Boolean))

        if (!user.registered || !user.displayNick) {
            return reply(F.tela({
                emoji: '📝',
                titulo: proprio ? 'Você ainda não tem ficha na taverna' : 'Essa pessoa ainda não tem ficha',
                intro: proprio
                    ? 'Crie sua ficha com um apelido para aparecer no ranking e ter um perfil completo.'
                    : `${marca} ainda não criou a ficha. Quando criar, o perfil aparece aqui.`,
                secoes: proprio ? [{ emoji: '⌨️', titulo: 'Digite assim', linhas: [`${F.cmd(prefix, 'login', 'seu apelido')}`, `Exemplo: ${F.cmd(prefix, 'login', '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')}`] }] : [],
                proximos: proprio ? [{ nome: 'login', args: '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤', oque: 'criar sua ficha agora' }] : [{ nome: 'perfil', oque: 'ver o seu perfil' }],
                prefix
            }), [alvo])
        }

        const level = Number(user.level || 1)
        const prog = getXpProgress(user)
        const stats = calculateFullCharacterStats(user)
        const hp = resolveHp(user)
        const nome = user.displayNick || user.nicknameRpg || user.name || marca

        const armaRef = user.slots?.arma || user.arma || user.equipado
        const armaNome = armaRef ? (typeof armaRef === 'object' ? armaRef.nome : (getItem(armaRef)?.nome || user.arma || 'Espada de Ferro')) : 'Punhos'
        const forja = user.forgeLevel > 0 ? ` +${user.forgeLevel}` : ''

        const carteira = Number(user.coins || 0)
        const banco = Number(user.bank || user.banco || 0)
        const msgsGrupo = Number(user.messagesGroup || 0)
        const msgsPv = Number(user.messagesPv || 0)
        const totalMsgs = (msgsGrupo + msgsPv) || Number(user.messages || 0)
        const membroHa = tempoDesde(user.registeredAt || user.registered_at)

        const conquistas = user.conquistas || []
        const nomesConquistas = conquistas.slice(0, 4).map(cid => achievementsCatalog.find(a => a.id === cid)?.titulo || cid)
        let badgeNome = null
        if (user.equippedBadge) {
            const badge = (require('./badges')?.BADGES_CATALOGO || []).find(b => b.id === user.equippedBadge)
            badgeNome = badge ? badge.nome : user.equippedBadge
        }

        const legenda = F.tela({
            emoji: '👤',
            titulo: `Perfil de ${nome}`,
            intro: `${marca} · nível *${formatNumber(level)}* · ${getRank(level)}\n${prog.barra} ${prog.percent}% · faltam ${formatNumber(prog.faltam)} XP`,
            secoes: [
                { emoji: '⚔️', titulo: 'Combate', linhas: [
                    F.campo('Poder', formatNumber(stats.cp)),
                    `*Ataque:* ${formatNumber(stats.atk)} · *Defesa:* ${formatNumber(stats.def)}`,
                    F.campo('Vida', `${formatNumber(hp.atual)} / ${formatNumber(hp.max)}`),
                    F.campo('Arma', armaNome + forja),
                    F.campo('Masmorra', `andar ${formatNumber(user.dungeonFloor || 1)} (recorde ${formatNumber(user.dungeonRecorde || 0)})`),
                    stats.rebirths > 0 ? F.campo('Reencarnações', `${stats.rebirths} (+${stats.rebirths * 25}% de dano e XP)`) : ''
                ] },
                { emoji: '💰', titulo: 'Patrimônio', linhas: [
                    `*Carteira:* ${moedas(carteira)} · *Banco:* ${moedas(banco)}`
                ] },
                { emoji: '📊', titulo: 'Atividade', linhas: [
                    `*Mensagens:* ${formatNumber(totalMsgs)} · *Vitórias:* ${formatNumber(user.wins || 0)} · *Chefes:* ${formatNumber(user.bossesMortos || 0)}`,
                    `*XP:* grupos ${compacto(user.xpGroup)} · privado ${compacto(user.xpPv)} · RPG ${compacto(user.xpRpg || user.xp_rpg)}`,
                    membroHa ? `*Na taverna há:* ${membroHa} · *Sequência:* ${formatNumber(user.streak || 0)} dias` : ''
                ] },
                { emoji: '🏆', titulo: `Conquistas (${conquistas.length})`, linhas: [
                    badgeNome ? F.campo('Insígnia', badgeNome) : '',
                    nomesConquistas.length ? nomesConquistas.join(' · ') + (conquistas.length > 4 ? ` e mais ${conquistas.length - 4}` : '') : ''
                ] }
            ],
            proximos: proprio
                ? [{ nome: 'dossie', oque: 'ficha completa' }, { nome: 'hunt', oque: 'ganhar XP agora' }]
                : [{ nome: 'duelo', args: marca, oque: 'desafiar para um duelo' }],
            prefix
        })

        return cartao.enviarComCartao({
            ctx: { client, from, info, reply },
            texto: legenda,
            mentions: [alvo],
            gerar: async () => cartao.cartaoPerfil({
                nome,
                subtitulo: getCargo(level),
                nivel: level,
                rank: getRank(level),
                xpAtual: prog.atual,
                xpNecessario: prog.necessario,
                foto: await cartao.fotoDePerfil(client, alvo),
                stats: [
                    ['Poder', stats.cp],
                    ['Moedas', compacto(carteira + banco)],
                    ['Vitórias', user.wins || 0],
                    ['Chefes', user.bossesMortos || 0],
                    ['Masmorra', `andar ${formatNumber(user.dungeonFloor || 1)}`],
                    ['Sequência', `${formatNumber(user.streak || 0)} dias`]
                ],
                rodape: membroHa ? `na taverna há ${membroHa}` : ''
            })
        })
    }
}
