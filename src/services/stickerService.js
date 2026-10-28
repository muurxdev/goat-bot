/**
 * Figurinhas — identidade do pacote, contagem e regras do formato.
 *
 * Os comandos que criam figurinha já existem. O que faltava era tudo em volta:
 * o pacote sai sempre com o mesmo nome genérico, ninguém sabe por que uma
 * imagem virou figurinha ruim, e não havia contagem de quantas foram feitas.
 *
 * A identidade do pacote fica por usuário (em `profile_data`), então cada um
 * assina as próprias figurinhas sem interferir no grupo.
 */

const perfilData = require('./profileDataService')
const logger = require('../core/logger')

const CHAVE_PACOTE = 'figurinha_pacote'
const CHAVE_PRESETS = 'figurinha_presets'
const CHAVE_CONTAGEM = 'figurinha_contagem'

/** Limites reais do formato de figurinha do WhatsApp. */
const LIMITES = {
    ladoIdeal: 512,
    pesoEstaticaKb: 100,
    pesoAnimadaKb: 500,
    duracaoAnimadaSeg: 10,
    quadrosPorSegundo: 15,
    nomeMax: 40,
    autorMax: 40
}

/** Nomes de pacote sugeridos, para quem não quer pensar num. */
const SUGESTOES_NOME = [
    'GOAT', 'Camisa 10', 'Inter Miami', 'Seleção Argentina',
    'La Pulga', 'Balón de Oro', 'Campeón del Mundo', 'D10S',
    'Rei do Futebol', 'GOAT GOAT'
]

function escopoDe(jid) {
    return String(jid || '').split('@')[0].split(':')[0] + '@figurinhas'
}

/** Identidade do pacote deste usuário. */
function pacote(jid) {
    try {
        const bruto = perfilData.getData(escopoDe(jid), CHAVE_PACOTE, null)
        const dados = bruto ? (typeof bruto === 'string' ? JSON.parse(bruto) : bruto) : {}
        return { nome: dados.nome || null, autor: dados.autor || null }
    } catch (err) {
        logger.warn(`[FIGURINHA] Pacote de ${jid} ilegível: ${err.message}`)
        return { nome: null, autor: null }
    }
}

function definirPacote(jid, campo, valor) {
    if (!['nome', 'autor'].includes(campo)) return { ok: false, erro: 'Campo inválido.' }
    const v = String(valor || '').trim()
    if (!v) return { ok: false, erro: 'O valor está vazio.' }
    const teto = campo === 'nome' ? LIMITES.nomeMax : LIMITES.autorMax
    if (v.length > teto) return { ok: false, erro: `No máximo ${teto} caracteres.` }
    try {
        const atual = pacote(jid)
        atual[campo] = v
        perfilData.setData(escopoDe(jid), CHAVE_PACOTE, JSON.stringify(atual))
        return { ok: true, pacote: atual }
    } catch (err) {
        logger.error(`[FIGURINHA] Falha ao salvar pacote de ${jid}: ${err.message}`)
        return { ok: false, erro: err.message }
    }
}

function limparPacote(jid) {
    perfilData.deleteData(escopoDe(jid), CHAVE_PACOTE)
    return true
}

/** Perfis salvos de nome+autor, para alternar entre identidades. */
function presets(jid) {
    try {
        const bruto = perfilData.getData(escopoDe(jid), CHAVE_PRESETS, '{}')
        const dados = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
        return dados && typeof dados === 'object' ? dados : {}
    } catch (err) {
        logger.warn(`[FIGURINHA] Perfis de ${jid} ilegíveis: ${err.message}`)
        return {}
    }
}

function salvarPreset(jid, apelido) {
    const a = String(apelido || '').toLowerCase().trim()
    if (!/^[a-z0-9_-]{2,20}$/.test(a)) return { ok: false, erro: 'O apelido aceita letras, números, hífen e sublinhado (2 a 20).' }
    const p = pacote(jid)
    if (!p.nome && !p.autor) return { ok: false, erro: 'Defina nome ou autor antes de salvar um perfil.' }
    const todos = presets(jid)
    if (Object.keys(todos).length >= 10 && !todos[a]) return { ok: false, erro: 'Você já tem 10 perfis salvos.' }
    todos[a] = { nome: p.nome, autor: p.autor }
    perfilData.setData(escopoDe(jid), CHAVE_PRESETS, JSON.stringify(todos))
    return { ok: true, apelido: a, preset: todos[a] }
}

function usarPreset(jid, apelido) {
    const a = String(apelido || '').toLowerCase().trim()
    const todos = presets(jid)
    if (!todos[a]) return { ok: false, erro: 'Perfil não encontrado.' }
    perfilData.setData(escopoDe(jid), CHAVE_PACOTE, JSON.stringify(todos[a]))
    return { ok: true, preset: todos[a] }
}

function apagarPreset(jid, apelido) {
    const a = String(apelido || '').toLowerCase().trim()
    const todos = presets(jid)
    if (!todos[a]) return { ok: false, erro: 'Perfil não encontrado.' }
    delete todos[a]
    perfilData.setData(escopoDe(jid), CHAVE_PRESETS, JSON.stringify(todos))
    return { ok: true }
}

// ══════════════════════════════════════════════════════════════
// CONTAGEM
// ══════════════════════════════════════════════════════════════

function contagem(jid) {
    try {
        const bruto = perfilData.getData(escopoDe(jid), CHAVE_CONTAGEM, null)
        const dados = bruto ? (typeof bruto === 'string' ? JSON.parse(bruto) : bruto) : {}
        return { total: Number(dados.total) || 0, porDia: dados.porDia || {}, primeira: dados.primeira || null }
    } catch (err) {
        logger.warn(`[FIGURINHA] Contagem de ${jid} ilegível: ${err.message}`)
        return { total: 0, porDia: {}, primeira: null }
    }
}

/** Registra uma figurinha criada. Mantém só os últimos 60 dias por dia. */
function registrar(jid) {
    try {
        const c = contagem(jid)
        const hoje = new Date().toISOString().slice(0, 10)
        c.total += 1
        c.porDia[hoje] = (c.porDia[hoje] || 0) + 1
        if (!c.primeira) c.primeira = Date.now()

        const corte = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10)
        for (const dia of Object.keys(c.porDia)) if (dia < corte) delete c.porDia[dia]

        perfilData.setData(escopoDe(jid), CHAVE_CONTAGEM, JSON.stringify(c))
        return c
    } catch (err) {
        logger.warn(`[FIGURINHA] Falha ao registrar figurinha de ${jid}: ${err.message}`)
        return null
    }
}

function feitasNoPeriodo(jid, dias) {
    const c = contagem(jid)
    const corte = new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10)
    return Object.entries(c.porDia)
        .filter(([dia]) => dia >= corte)
        .reduce((a, [, n]) => a + n, 0)
}

// ══════════════════════════════════════════════════════════════
// CÁLCULOS DO FORMATO
// ══════════════════════════════════════════════════════════════

/**
 * Como uma imagem deve ser ajustada para virar figurinha.
 * A figurinha é sempre quadrada: o que não é quadrado ganha borda ou é
 * recortado, e é isso que explica a figurinha "achatada" que todo mundo faz.
 */
function ajusteParaFigurinha(largura, altura) {
    const l = Number(largura) || 0, a = Number(altura) || 0
    if (!l || !a) return null
    const lado = LIMITES.ladoIdeal
    const escala = Math.min(lado / l, lado / a)
    const novaL = Math.round(l * escala)
    const novaA = Math.round(a * escala)
    return {
        original: `${l}×${a}`,
        redimensionada: `${novaL}×${novaA}`,
        quadrada: `${lado}×${lado}`,
        precisaBorda: novaL !== lado || novaA !== lado,
        bordaLateral: Math.round((lado - novaL) / 2),
        bordaTopo: Math.round((lado - novaA) / 2),
        areaAproveitada: ((novaL * novaA) / (lado * lado)) * 100,
        orientacao: l > a ? 'horizontal' : l < a ? 'vertical' : 'quadrada'
    }
}

/** Quantos quadros cabem numa figurinha animada. */
function quadrosAnimada(segundos, fps = LIMITES.quadrosPorSegundo) {
    const s = Math.min(LIMITES.duracaoAnimadaSeg, Math.max(0.1, Number(segundos) || 0))
    const f = Math.min(30, Math.max(1, Number(fps) || LIMITES.quadrosPorSegundo))
    const quadros = Math.round(s * f)
    // Orçamento de peso dividido entre os quadros: é o que decide a qualidade.
    const kbPorQuadro = LIMITES.pesoAnimadaKb / Math.max(1, quadros)
    return {
        segundos: s,
        fps: f,
        quadros,
        kbPorQuadro,
        viavel: kbPorQuadro >= 2,
        recomendacao: kbPorQuadro < 2
            ? 'Reduza a duração ou os quadros por segundo: não sobra peso por quadro.'
            : kbPorQuadro < 5
                ? 'Vai funcionar, mas com perda visível de qualidade.'
                : 'Boa margem de qualidade.'
    }
}

module.exports = {
    LIMITES,
    SUGESTOES_NOME,
    pacote,
    definirPacote,
    limparPacote,
    presets,
    salvarPreset,
    usarPreset,
    apagarPreset,
    contagem,
    registrar,
    feitasNoPeriodo,
    ajusteParaFigurinha,
    quadrosAnimada
}
