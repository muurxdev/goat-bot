/**
 * Avisos agendados nos grupos (.agendarmensagem).
 *
 * Antes era um setTimeout em memória: qualquer reinício do bot apagava o
 * agendamento sem avisar ninguém, e o comando tinha acabado de dizer "agendada
 * com sucesso". Agora o pedido fica gravado nas configs do grupo e um relógio
 * confere de tempos em tempos o que já venceu — sobrevive a reinício e a deploy.
 *
 * Não usa a tabela bot_schedules: ela é do ciclo de abrir/fechar o bot, e o
 * botScheduler trata o primeiro agendamento ativo como sendo desse tipo.
 */

const dataService = require('./dataService')
const groupAuthService = require('./groupAuthService')
const logger = require('../core/logger')

const INTERVALO_MS = 20000
// Bot fora do ar por mais que isso: o aviso perdeu o sentido ("o evento começa
// em 10 minutos" dito 8 horas depois). Descarta e registra.
const ATRASO_MAXIMO_MS = 6 * 60 * 60 * 1000
const MAX_POR_GRUPO = 20

let relogio = null

function listaDe(configs, groupJid) {
    const lista = configs[groupJid]?.mensagensAgendadas
    return Array.isArray(lista) ? lista : []
}

/**
 * Grava um aviso para ser enviado no grupo.
 * @returns {Promise<{ ok: boolean, item?: object, motivo?: string }>}
 */
async function agendar(groupJid, { texto, quando, criadoPor }) {
    const configs = dataService.getConfigsData()
    if (!configs[groupJid]) configs[groupJid] = {}
    const lista = listaDe(configs, groupJid)
    if (lista.length >= MAX_POR_GRUPO) return { ok: false, motivo: 'cheio' }

    const item = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        texto: String(texto),
        quando: Number(quando),
        criadoPor,
        criadoEm: Date.now()
    }
    configs[groupJid].mensagensAgendadas = [...lista, item].sort((a, b) => a.quando - b.quando)
    await dataService.saveConfigsData(configs)
    iniciarRelogio()
    return { ok: true, item }
}

/** Avisos pendentes do grupo, do mais próximo ao mais distante. */
function listar(groupJid) {
    return [...listaDe(dataService.getConfigsData(), groupJid)].sort((a, b) => a.quando - b.quando)
}

/**
 * Cancela pela posição mostrada em listar() (1 = o mais próximo).
 * @returns {Promise<object|null>} o aviso cancelado
 */
async function cancelar(groupJid, posicao) {
    const configs = dataService.getConfigsData()
    const lista = [...listaDe(configs, groupJid)].sort((a, b) => a.quando - b.quando)
    const indice = Number(posicao) - 1
    if (!Number.isInteger(indice) || indice < 0 || indice >= lista.length) return null
    const [removido] = lista.splice(indice, 1)
    configs[groupJid].mensagensAgendadas = lista
    await dataService.saveConfigsData(configs)
    return removido
}

/**
 * Envia os avisos vencidos e tira da lista. Um aviso que falha ao enviar também
 * sai (com log), para não repetir a tentativa a cada volta do relógio.
 * @returns {Promise<number>} quantos foram enviados
 */
async function processarVencidos(client, agora = Date.now()) {
    if (!client || typeof client.sendMessage !== 'function') return 0

    const configs = dataService.getConfigsData()
    let enviados = 0
    let mudou = false

    for (const [groupJid, cfg] of Object.entries(configs)) {
        const lista = cfg?.mensagensAgendadas
        if (!Array.isArray(lista) || lista.length === 0) continue

        const restantes = []
        for (const item of lista) {
            if (item.quando > agora) {
                restantes.push(item)
                continue
            }
            mudou = true
            if (agora - item.quando > ATRASO_MAXIMO_MS) {
                logger.warn(`[AGENDAMENTO] Aviso ${item.id} de ${groupJid} venceu há mais de 6h com o bot fora do ar — descartado.`)
                continue
            }
            try {
                await client.sendMessage(groupJid, { text: `📢 *Aviso da administração*\n\n${item.texto}` })
                enviados++
            } catch (err) {
                logger.error(`[AGENDAMENTO] Falha ao enviar o aviso ${item.id} em ${groupJid}:`, err)
            }
        }
        cfg.mensagensAgendadas = restantes
    }

    if (mudou) await dataService.saveConfigsData(configs)
    return enviados
}

/** Liga o relógio uma vez só. Em teste não liga: os testes chamam processarVencidos. */
function iniciarRelogio() {
    if (relogio || process.env.NODE_ENV === 'test') return
    relogio = setInterval(() => {
        processarVencidos(groupAuthService.getClient()).catch(err =>
            logger.error('[AGENDAMENTO] Falha ao conferir os avisos agendados:', err))
    }, INTERVALO_MS)
    if (typeof relogio.unref === 'function') relogio.unref()
}

module.exports = { agendar, listar, cancelar, processarVencidos, iniciarRelogio, ATRASO_MAXIMO_MS, MAX_POR_GRUPO }
