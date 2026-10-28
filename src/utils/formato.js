/**
 * Formatação única das mensagens — o jeito de o bot organizar informação.
 *
 * Existe porque cada família de comandos carregava a própria cópia de
 * cab/linha/bloco/barra (1.961 cópias em 2026-09-17). O desenho das caixas
 * mora em utils/moldura.js; em 2026-09-18 o dono pediu a volta delas:
 *
 *   ╔══════════════════════════════╗
 *   ║   🎯 *TÍTULO* 🎯   ║
 *   ╚══════════════════════════════╝
 *
 *   Uma frase curta dizendo o que é isto.
 *
 *   ╭━〔 📋 SEÇÃO 〕━⬣
 *   ┃ *Rótulo:* valor
 *   ┃ ➤ item de lista
 *   ╰━━━━━━━━━━━━━━━━━━⬣
 *
 *   💡 _Dica_
 *
 *   ╭━〔 👉 PRÓXIMOS PASSOS 〕━⬣
 *   ┃ ➤ `.comando args` — o que faz
 *   ╰━━━━━━━━━━━━━━━━━━⬣
 *
 *   👑 *Nome do bot*
 *
 * O essencial vai no topo: no WhatsApp, só as primeiras linhas aparecem antes
 * do "Ler mais", e quem só quer a resposta não deve precisar abrir a mensagem.
 */

const M = require('./moldura')

/** Título com emoji: "🎯 *Texto*". */
function titulo(emoji, texto) {
    const t = String(texto ?? '').trim()
    return `${emoji ? emoji + ' ' : ''}*${t}*`
}

/** Par rótulo e valor: "*Rótulo:* valor" (com emoji opcional na frente). */
function campo(rotulo, valor, emoji = '') {
    const v = (valor === null || valor === undefined || valor === '') ? '—' : valor
    return `${emoji ? emoji + ' ' : ''}*${rotulo}:* ${v}`
}

/** Comando pronto para copiar, em crase: "`.play Numb`". */
function cmd(prefix, nome, args = '') {
    return '`' + (prefix || '.') + nome + (args ? ' ' + args : '') + '`'
}

/** Itens com marcador, ignorando vazios. */
function lista(itens = [], marcador = '•') {
    return itens.filter(i => i !== null && i !== undefined && String(i).trim() !== '').map(i => `${marcador} ${i}`)
}

/** Seção em moldura com título e linhas. Some por inteiro se não houver linha. */
function secao(emoji, nome, linhas = []) {
    return M.secao(emoji, nome, linhas)
}

/** Comando de apoio / ajuda. */
function dica(texto) {
    if (!texto) return ''
    const t = String(texto).trim()
    return `🧭 *Comando de Ajuda:* ${t}`
}

/**
 * Bloco de comandos para ajudar (ações diretas e complementares).
 * @param {string} prefix
 * @param {Array<{nome:string, args?:string, oque:string}>} itens
 */
function proximos(prefix, itens = []) {
    return secao('🧭', 'Comandos para Ajudar', (itens || [])
        .filter(i => i && i.nome)
        .map(i => `• ${cmd(prefix, i.nome, i.args)} — ${i.oque}`))
}

/** Barra de progresso: "▰▰▰▰▰▰▱▱▱▱ 60%". */
function barra(fracao, tamanho = 10) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    const cheios = Math.round(f * tamanho)
    return '▰'.repeat(cheios) + '▱'.repeat(tamanho - cheios) + ` ${Math.round(f * 100)}%`
}

/**
 * Monta uma tela inteira. Blocos vazios somem sem deixar linha em branco sobrando.
 * @param {object} o
 * @param {string} o.emoji
 * @param {string} o.titulo
 * @param {string} [o.intro]       frase logo abaixo do título — o essencial
 * @param {Array<{emoji:string, titulo:string, linhas:string[]}|string>} [o.secoes]
 * @param {string} [o.dica]
 * @param {Array<{nome:string, args?:string, oque:string}>} [o.proximos]
 * @param {string} [o.prefix]
 * @param {boolean} [o.assinatura=true]  "👑 *Nome do bot*" no fim
 */
function tela({ emoji, titulo: t, intro = '', secoes = [], dica: d = '', proximos: p = [], prefix = '.', assinatura = true }) {
    const blocos = [M.cabecalho(emoji, t)]
    if (intro) blocos.push(String(intro).trim())
    for (const s of secoes) {
        if (!s) continue
        blocos.push(typeof s === 'string' ? s.trim() : secao(s.emoji, s.titulo, s.linhas))
    }
    if (d) blocos.push(dica(d))
    if (p && p.length) blocos.push(proximos(prefix, p))
    if (assinatura) blocos.push(M.assinatura())
    return blocos.filter(b => b && String(b).trim()).join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** Tempo de espera legível: 0 → "sem espera", 7.200.000 → "2 h". */
function tempo(ms) {
    const s = Math.round((Number(ms) || 0) / 1000)
    if (s <= 0) return 'sem espera'
    if (s < 60) return `${s} s`
    const min = Math.round(s / 60)
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60), resto = min % 60
    return resto ? `${h} h ${resto} min` : `${h} h`
}

const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

/** Data e hora formatadas no fuso horário oficial do bot (padrão Brasília). */
function dataHora(dateOrTs, opcoes = {}) {
    if (!dateOrTs) return '—'
    const d = new Date(dateOrTs)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString('pt-BR', { timeZone: process.env.BOT_TIMEZONE || DEFAULT_TIMEZONE, ...opcoes })
}

/** Data formatada no fuso horário oficial do bot (padrão Brasília). */
function data(dateOrTs, opcoes = {}) {
    if (!dateOrTs) return '—'
    const d = new Date(dateOrTs)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('pt-BR', { timeZone: process.env.BOT_TIMEZONE || DEFAULT_TIMEZONE, ...opcoes })
}

/** Hora formatada no fuso horário oficial do bot (padrão Brasília). */
function hora(dateOrTs, opcoes = {}) {
    if (!dateOrTs) return '—'
    const d = new Date(dateOrTs)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: process.env.BOT_TIMEZONE || DEFAULT_TIMEZONE, ...opcoes })
}

module.exports = { titulo, campo, cmd, lista, secao, dica, proximos, barra, tela, tempo, dataHora, data, hora, DEFAULT_TIMEZONE }
