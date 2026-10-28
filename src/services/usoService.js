/**
 * Ajuda de uso — transforma o "Uso: .x <y>" seco em orientação de verdade.
 *
 * Em 2026-09-17, 617 comandos respondiam ao uso incompleto com mensagem própria,
 * em seis formatos diferentes, e metade era uma linha só, sem exemplo. Reescrever
 * um por um levaria semanas; em vez disso o commandDispatcher entrega a PRIMEIRA
 * resposta de cada execução a `ehPedidoDeUso`, e quando é esse caso ela é
 * reconstruída aqui com o que o registro sabe do comando:
 *
 *   📌 *Como usar o .kg2libras*
 *
 *   Converte quilos em libras.
 *
 *   ⚠️ Digite o peso em kg.
 *
 *   ⌨️ *Digite assim:* `.kg2libras <peso>`
 *
 *   🧪 *Exemplos*            ← quando o comando declara `examples`
 *   • `.kg2libras 70` — 70 kg em libras
 *
 *   💡 _Guia completo: `.kg2libras -help`_
 *
 * Comandos podem declarar no schema:
 *   usage:    '<peso em kg>'                 (sem prefixo nem nome)
 *   examples: ['70 — setenta quilos', '1,5']  (sem prefixo nem nome; "—" separa a explicação)
 */

const F = require('../utils/formato')

const EMOJI = '(?:\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic})*\\uFE0F?)'
const VERBOS = 'digite|informe|marque|mencione|envie|responda|escreva|coloque|forneça|forneca|indique|especifique|cite|passe|diga|use|mande|adicione|escolha'
const PREFIXO_DE_AVISO = new RegExp(`^\\s*(?:${EMOJI}\\s*)*(?:\\*\\s*)?(?:${VERBOS})\\b`, 'iu')
const ROTULO_USO = /(?:^|\s|\*|_)(?:uso|use|modo de uso|como usar)\s*:/i
const SO_SINTAXE = /^\s*(?:\p{Extended_Pictographic}️?\s*)*`[.!#/][^`]+`\s*$/u
const SINTAXE = /`([.!#/][^`]+)`/

/**
 * Diz se a mensagem é um pedido de uso curto (e portanto seco).
 * @param {string} texto
 * @param {{semArgumentos?: boolean}} [o]
 */
function ehPedidoDeUso(texto, { semArgumentos = true } = {}) {
    if (typeof texto !== 'string') return false
    const t = texto.trim()
    if (!t || t.length > 240) return false
    // Já é uma ajuda rica: várias linhas com exemplo. Não mexe.
    const linhas = t.split('\n').filter(l => l.trim())
    if (linhas.length >= 4) return false
    if (/exemplo/i.test(t) && linhas.length >= 3) return false

    if (ROTULO_USO.test(t)) return true
    if (SO_SINTAXE.test(t)) return true
    // "❌ Digite o peso em kg." só é pedido de uso quando o comando veio vazio;
    // com argumento, a mesma frase pode ser orientação sobre um valor inválido.
    if (semArgumentos && PREFIXO_DE_AVISO.test(t)) return true
    return false
}

/** Remove emoji inicial, rótulo "Uso:" e a sintaxe em crase, sobrando a orientação. */
function orientacaoDe(texto) {
    let t = String(texto)
        .replace(/`[^`]*`/g, ' ')
        .replace(new RegExp(`^\\s*(?:${EMOJI}\\s*)+`, 'u'), '')
        .replace(/(?:^|\s)(?:\*|_)*(?:uso|use|modo de uso|como usar)\s*:(?:\*|_)*/ig, ' ')
        .replace(/[*_]/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim()
    // Sobra só pontuação ou uma palavra solta: não vale uma linha.
    const letras = (t.match(/\p{L}/gu) || []).length
    return letras >= 8 ? t : ''
}

/** Normaliza um exemplo do schema para: comando em crase, travessão, explicação. */
function linhaDeExemplo(prefix, nome, ex) {
    const [args, explicacao] = String(ex).split(/\s+—\s+/)
    const a = String(args || '').trim().replace(new RegExp(`^[.!#/]?${nome}\\s*`, 'i'), '')
    return `• ${F.cmd(prefix, nome, a)}${explicacao ? ' — ' + explicacao.trim() : ''}`
}

/**
 * Reconstrói um pedido de uso seco como ajuda completa.
 * @param {object} cmd        comando do registro
 * @param {string} original   texto que o comando ia mandar
 * @param {{prefix?: string, digitado?: string}} [o]
 */
function enriquecerPedidoDeUso(cmd, original, { prefix = '.', digitado } = {}) {
    const nome = (digitado && String(digitado).toLowerCase()) || cmd.name
    const descricao = String(cmd.description || '').trim().replace(/\s*\(\.[^)]*\)\s*$/, '')

    let sintaxe = ''
    if (cmd.usage) sintaxe = F.cmd(prefix, nome, String(cmd.usage).trim())
    else {
        const achada = String(original).match(SINTAXE)
        if (achada) sintaxe = '`' + achada[1].trim() + '`'
    }

    const orientacao = orientacaoDe(original)
    const exemplos = Array.isArray(cmd.examples) ? cmd.examples.slice(0, 5).map(ex => linhaDeExemplo(prefix, nome, ex)) : []

    const blocos = [F.titulo('📌', `Como usar o ${prefix}${nome}`)]
    if (descricao) blocos.push(descricao.endsWith('.') ? descricao : descricao + '.')
    if (orientacao) blocos.push(`⚠️ ${orientacao}`)
    if (sintaxe) blocos.push(F.campo('Digite assim', sintaxe, '⌨️'))
    if (exemplos.length) blocos.push(F.secao('🧪', 'Exemplos', exemplos))
    blocos.push(F.secao('🧭', 'Comandos para Ajudar', [
        `• ${F.cmd(prefix, nome, '-help')} — Manual completo deste comando`,
        `• ${F.cmd(prefix, 'orientacao')} — Central de orientação do bot`,
        `• ${F.cmd(prefix, 'menu')} — Painel geral de categorias`
    ]))
    return blocos.join('\n\n')
}

/** Permissão em português, do ponto de vista de quem usa. */
function permissaoDe(cmd) {
    if (cmd.ownerOnly) return 'Só os donos do bot'
    if (cmd.adminOnly) return 'Administradores do grupo'
    if (typeof cmd.minRole === 'number' && cmd.minRole >= 3) return 'Administradores do grupo'
    return 'Qualquer pessoa'
}

/** Onde o comando funciona. */
function ondeFuncionaDe(cmd) {
    if (cmd.groupOnly) return 'Só em grupos'
    if (cmd.privateOnly || cmd.pvOnly) return 'Só no privado'
    return 'Em grupos e no privado'
}

module.exports = { ehPedidoDeUso, enriquecerPedidoDeUso, orientacaoDe, permissaoDe, ondeFuncionaDe }
