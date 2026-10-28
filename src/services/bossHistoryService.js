/**
 * Histórico de bosses derrotados por jogador.
 *
 * O contador `bossesMortos` já existia e funcionava, mas era só um número: o
 * perfil dizia "37 bosses" sem dizer QUAIS. Aqui guardamos nome, raridade e
 * data de cada abate, mais um resumo por boss (quantas vezes cada um caiu).
 *
 * Campos sem coluna própria vão para a coluna `extra` (JSON) do userRepository,
 * então basta atribuir no objeto do usuário e salvar.
 *
 * O histórico é LIMITADO de propósito: sem teto, um jogador veterano faria a
 * coluna `extra` crescer sem fim e cada leitura de perfil pagaria por isso.
 * Guardamos os últimos abates em detalhe e o agregado por boss para sempre.
 */

const LIMITE_HISTORICO = Number(process.env.BOSS_HISTORICO_MAX || 30)

/**
 * Registra um abate no perfil (NÃO salva — quem chama já persiste em lote).
 *
 * @param {object} user
 * @param {{nome:string, raridade?:string}} boss
 * @param {{dano?:number, tipo?:'boss'|'raid'}} info
 */
function registrarAbate(user, boss, { dano = 0, tipo = 'boss' } = {}) {
    if (!user || !boss?.nome) return

    if (!Array.isArray(user.bossesDerrotados)) user.bossesDerrotados = []
    if (!user.bossesResumo || typeof user.bossesResumo !== 'object') user.bossesResumo = {}

    user.bossesDerrotados.unshift({
        nome: boss.nome,
        raridade: boss.raridade || null,
        dano: Math.floor(dano) || 0,
        tipo,
        em: Date.now()
    })

    // Mantém só os mais recentes em detalhe.
    if (user.bossesDerrotados.length > LIMITE_HISTORICO) {
        user.bossesDerrotados.length = LIMITE_HISTORICO
    }

    // O agregado nunca é podado: é ele que sustenta "você matou o Dragão 12x"
    // mesmo depois de o detalhe sair da janela.
    const chave = boss.nome
    const atual = user.bossesResumo[chave]
    user.bossesResumo[chave] = {
        vezes: Number(atual?.vezes || 0) + 1,
        raridade: boss.raridade || atual?.raridade || null,
        ultimo: Date.now()
    }
}

/** Lista ordenada por quantidade de abates, para exibir no perfil. */
function resumoOrdenado(user) {
    const resumo = user?.bossesResumo
    if (!resumo || typeof resumo !== 'object') return []
    return Object.entries(resumo)
        .map(([nome, d]) => ({ nome, vezes: Number(d?.vezes || 0), raridade: d?.raridade || null, ultimo: d?.ultimo || 0 }))
        .filter(b => b.vezes > 0)
        .sort((a, b) => b.vezes - a.vezes || b.ultimo - a.ultimo)
}

function historicoRecente(user, limite = 10) {
    const h = user?.bossesDerrotados
    return Array.isArray(h) ? h.slice(0, limite) : []
}

/** "hoje" / "ontem" / "há 5 dias" — data relativa é mais legível num perfil. */
function dataRelativa(ts) {
    if (!ts) return '—'
    const dias = Math.floor((Date.now() - ts) / 86400000)
    if (dias <= 0) return 'hoje'
    if (dias === 1) return 'ontem'
    if (dias < 30) return `há ${dias} dias`
    const meses = Math.floor(dias / 30)
    return meses === 1 ? 'há 1 mês' : `há ${meses} meses`
}

const EMOJI_RARIDADE = {
    comum: '⚪', incomum: '🟢', raro: '🔵', épico: '🟣', epico: '🟣',
    lendário: '🟠', lendario: '🟠', mítico: '🔴', mitico: '🔴', divino: '✨'
}

function emojiDe(raridade) {
    if (!raridade) return '💀'
    return EMOJI_RARIDADE[String(raridade).toLowerCase()] || '💀'
}

/**
 * Bloco pronto para o perfil: os bosses mais abatidos.
 * Devolve string vazia quando não há nada, para o perfil não mostrar
 * uma seção vazia.
 */
function blocoPerfil(user, maxLinhas = 5) {
    const lista = resumoOrdenado(user)
    if (!lista.length) return ''

    let doc = `\n╭━〔 💀 BOSSES DERROTADOS 〕━⬣\n`
    for (const b of lista.slice(0, maxLinhas)) {
        doc += `┃ ${emojiDe(b.raridade)} *${b.nome}* — ${b.vezes}x _(${dataRelativa(b.ultimo)})_\n`
    }
    if (lista.length > maxLinhas) {
        doc += `┃ _...e mais ${lista.length - maxLinhas} chefe(s). Use_ \`.bosses\`\n`
    }
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
    return doc
}

module.exports = {
    registrarAbate,
    resumoOrdenado,
    historicoRecente,
    blocoPerfil,
    dataRelativa,
    emojiDe,
    LIMITE_HISTORICO
}
