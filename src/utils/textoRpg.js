/**
 * Formatadores de texto do RPG e da economia.
 *
 * Existem para que os comandos mais usados falem do mesmo jeito: número com
 * milhar pt-BR, plural certo, tempo sem casa decimal e o mesmo nome para cada
 * espaço de equipamento. Não calculam regra de jogo nenhuma.
 */

const { formatNumber } = require('./uiEngine')

/** "1 moeda", "2.500 moedas". */
function plural(n, singular, pluralForma) {
    const num = Number(n) || 0
    return `${formatNumber(num)} ${Math.abs(num) === 1 ? singular : pluralForma}`
}

const moedas = n => plural(n, 'moeda', 'moedas')

/** Percentual com vírgula e no máximo uma casa: 12,5 */
function percentual(valor) {
    return (Number(valor) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

/** Tempo legível e sem decimal: "1 hora e 12 minutos", "42 segundos". */
function duracao(ms) {
    const totalSeg = Math.max(1, Math.ceil((Number(ms) || 0) / 1000))
    const h = Math.floor(totalSeg / 3600)
    const m = Math.floor((totalSeg % 3600) / 60)
    const s = totalSeg % 60
    const partes = []
    if (h) partes.push(plural(h, 'hora', 'horas'))
    if (m) partes.push(plural(m, 'minuto', 'minutos'))
    if (!h && s) partes.push(plural(s, 'segundo', 'segundos'))
    return partes.join(' e ')
}

/** "@5511999999999" a partir do JID. */
const marcar = jid => '@' + String(jid || '').split('@')[0]

/** Ordinal feminino: 1ª, 2ª. */
const ordinalA = n => `${formatNumber(n)}ª`

/** Nome que o jogador lê para cada espaço de equipamento. */
const NOME_ESPACO = {
    capacete: 'Cabeça',
    peitoral: 'Tronco',
    calca: 'Pernas',
    botas: 'Pés',
    arma: 'Arma',
    escudo: 'Mão secundária',
    amuleto: 'Amuleto'
}

/**
 * Linhas da seção "Subiu de nível" a partir do retorno de adicionarXp.
 * Lista vazia quando não subiu (F.tela omite seção sem linhas).
 * @param {object} user
 * @param {{subiu?: boolean, levelsGanhos?: number, ganhoHp?: number, ganhoCoins?: number}} lvlRes
 * @returns {string[]}
 */
function linhasSubiuNivel(user, lvlRes) {
    if (!lvlRes || !lvlRes.subiu) return []
    const varios = lvlRes.levelsGanhos > 1 ? ` (${plural(lvlRes.levelsGanhos, 'nível', 'níveis')} de uma vez)` : ''
    return [
        `Agora você está no *nível ${formatNumber(user.level)}*${varios}`,
        `+${formatNumber(lvlRes.ganhoHp)} HP de vida máxima · +${moedas(lvlRes.ganhoCoins)}`
    ]
}

module.exports = { plural, moedas, percentual, duracao, marcar, ordinalA, NOME_ESPACO, formatNumber, linhasSubiuNivel }
