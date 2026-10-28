/**
 * Handler do webhook do Stripe.
 *
 * É este endpoint que transforma "alguém pagou" em crédito na conta. Como ele
 * concede valor, é o ponto mais sensível da integração:
 *
 *  - o corpo precisa chegar CRU (bytes exatos). Reserializar o JSON muda a
 *    ordem/espaçamento e invalida o HMAC, então lemos o stream direto;
 *  - sem assinatura válida, responde 400 e não credita nada. Um POST forjado
 *    dizendo "pagamento aprovado" precisa ser inofensivo;
 *  - eventos repetidos são ignorados pelo id. O Stripe REENVIA quando não
 *    recebe 200 — é o comportamento correto dele, e sem deduplicação uma
 *    resposta lenta creditaria o mesmo pagamento duas vezes.
 */

const logger = require('../../core/logger')
const stripe = require('./stripeService')
const creditos = require('./creditsService')

// Corpo maior que isso não é um evento legítimo do Stripe; é tentativa de
// esgotar a memória do processo.
const MAX_CORPO_BYTES = 1024 * 512

/** Lê o corpo cru, com teto de tamanho. */
function lerCorpoCru(req) {
    return new Promise((resolve, reject) => {
        const partes = []
        let total = 0
        req.on('data', c => {
            total += c.length
            if (total > MAX_CORPO_BYTES) {
                reject(new Error('corpo grande demais'))
                req.destroy()
                return
            }
            partes.push(c)
        })
        req.on('end', () => resolve(Buffer.concat(partes)))
        req.on('error', reject)
    })
}

/**
 * Extrai o JID do WhatsApp que iniciou a compra.
 * Vem do metadata que gravamos ao criar o checkout — sem ele o dinheiro entra
 * e não há como saber para quem creditar.
 */
function jidDoEvento(objeto) {
    return objeto?.metadata?.jid
        || objeto?.payment_intent?.metadata?.jid
        || null
}

/**
 * Processa um evento já verificado.
 * @returns {Promise<{tratado:boolean, jid?:string, creditos?:number}>}
 */
async function processarEvento(evento, { aoCreditar } = {}) {
    const tipo = evento.type
    const obj = evento.data?.object || {}

    // checkout.session.completed cobre cartão e Pix. Para Pix o pagamento é
    // assíncrono, então só creditamos quando payment_status == 'paid'.
    if (tipo === 'checkout.session.completed' || tipo === 'checkout.session.async_payment_succeeded') {
        if (obj.payment_status !== 'paid') {
            logger.info(`[STRIPE WEBHOOK] Sessão ${obj.id} ainda não paga (${obj.payment_status}) — aguardando`)
            return { tratado: true }
        }

        const jid = jidDoEvento(obj)
        if (!jid) {
            logger.error(`[STRIPE WEBHOOK] Pagamento ${obj.id} SEM jid no metadata — não sei para quem creditar`)
            return { tratado: true }
        }

        const r = creditos.creditarPagamento({
            jid,
            centavos: obj.amount_total,
            moeda: obj.currency || 'brl',
            eventId: evento.id,
            sessionId: obj.id,
            email: obj.customer_details?.email || null
        })

        let autoAtivado = null
        try {
            const dias = parseInt(obj.metadata?.dias, 10)
            if (dias > 0) {
                const rentalService = require('../rentalService')
                const duracaoStr = dias >= 36500 ? 'vitalicio' : `${dias}d`
                autoAtivado = rentalService.addRentalTime(jid, duracaoStr, 'Stripe Checkout')
                logger.info(`[STRIPE WEBHOOK] Aluguel ativado automaticamente para ${jid} (${duracaoStr})`)
            }
        } catch (errAuto) {
            logger.warn(`[STRIPE WEBHOOK] Falha ao auto-ativar aluguel para ${jid}: ${errAuto.message}`)
        }

        if (!r.jaProcessado && typeof aoCreditar === 'function') {
            // Avisar o comprador no WhatsApp não pode derrubar o webhook: se
            // falhar, o Stripe reenviaria e o crédito já estaria dado.
            try {
                await aoCreditar({
                    jid,
                    creditos: r.creditos,
                    saldo: r.saldo,
                    centavos: obj.amount_total,
                    autoAtivado,
                    dias: obj.metadata?.dias,
                    pacote: obj.metadata?.pacote,
                    beneficiaryName: obj.metadata?.beneficiaryName
                })
            } catch (e) {
                logger.warn(`[STRIPE WEBHOOK] Não consegui avisar ${jid}: ${e.message}`)
            }
        }

        return { tratado: true, jid, creditos: r.creditos, autoAtivado }
    }

    if (tipo === 'checkout.session.async_payment_failed' || tipo === 'checkout.session.expired') {
        logger.info(`[STRIPE WEBHOOK] Sessão ${obj.id} ${tipo === 'checkout.session.expired' ? 'expirou' : 'falhou'}`)
        return { tratado: true }
    }

    if (tipo === 'charge.refunded' || tipo === 'charge.dispute.created') {
        // Não estorna crédito automaticamente: o valor pode já ter virado dias
        // de aluguel, e zerar sozinho geraria saldo negativo. Fica registrado
        // para o dono decidir com .creditos ajustar.
        logger.warn(`[STRIPE WEBHOOK] ${tipo} em ${obj.id} — revise manualmente com .creditos`)
        return { tratado: true }
    }

    logger.debug(`[STRIPE WEBHOOK] Evento ignorado: ${tipo}`)
    return { tratado: false }
}

/**
 * Handler HTTP. Devolve true se tratou a requisição.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function handle(req, res, { aoCreditar } = {}) {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/plain' })
        res.end('Método não permitido')
        return true
    }

    if (!stripe.webhookConfigurado()) {
        logger.error('[STRIPE WEBHOOK] Recebi um POST mas STRIPE_WEBHOOK_SECRET não está configurado')
        res.writeHead(503, { 'Content-Type': 'text/plain' })
        res.end('Webhook não configurado')
        return true
    }

    let corpo
    try {
        corpo = await lerCorpoCru(req)
    } catch (e) {
        res.writeHead(413, { 'Content-Type': 'text/plain' })
        res.end('Corpo grande demais')
        return true
    }

    const v = stripe.verificarAssinatura(corpo, req.headers['stripe-signature'])
    if (!v.ok) {
        // Log em nível de aviso: assinatura inválida costuma ser sonda/ataque,
        // e é a informação que explica "paguei e não caiu o crédito".
        logger.warn(`[STRIPE WEBHOOK] Assinatura rejeitada: ${v.motivo}`)
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end(`Assinatura inválida: ${v.motivo}`)
        return true
    }

    try {
        const r = await processarEvento(v.evento, { aoCreditar })
        // 200 sempre que o evento foi entendido — senão o Stripe reenvia em loop.
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ recebido: true, tratado: r.tratado }))
    } catch (e) {
        logger.error(`[STRIPE WEBHOOK] Falha ao processar ${v.evento?.id}: ${e.message}`)
        // 500 faz o Stripe tentar de novo — que é o certo num erro nosso.
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Erro ao processar')
    }
    return true
}

module.exports = { handle, processarEvento, lerCorpoCru, MAX_CORPO_BYTES }
