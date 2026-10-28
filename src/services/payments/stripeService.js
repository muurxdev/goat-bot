/**
 * Integração com o Stripe (pagamento real do aluguel do bot).
 *
 * Sem o SDK oficial: ele traz dezenas de megabytes e um cliente completo para
 * usar 4 endpoints. A API do Stripe é REST com `application/x-www-form-urlencoded`
 * e axios (já é dependência) dá conta.
 *
 * PIX
 * ---
 * Contas Stripe brasileiras suportam `pix` como método de pagamento. Não dá
 * para saber pela chave se a conta tem Pix habilitado, então pedimos cartão +
 * Pix e, se o Stripe recusar o Pix, refazemos só com cartão. Assim funciona
 * nos dois casos sem o dono precisar configurar nada.
 *
 * SEGURANÇA DO WEBHOOK
 * --------------------
 * `verificarAssinatura` NÃO é opcional. Sem ela, qualquer um que descubra a URL
 * faz um POST dizendo "pagamento aprovado" e ganha aluguel de graça. A
 * verificação usa HMAC-SHA256 sobre o corpo CRU (qualquer reserialização do
 * JSON muda os bytes e invalida a assinatura) e comparação em tempo constante.
 */

const crypto = require('crypto')
const axios = require('axios')
const logger = require('../../core/logger')

const API = 'https://api.stripe.com/v1'

// Janela de tolerância do timestamp da assinatura. Sem ela, um webhook
// capturado poderia ser reenviado meses depois (replay).
const TOLERANCIA_S = Number(process.env.STRIPE_WEBHOOK_TOLERANCIA_S || 300)

const cfg = () => ({
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    moeda: (process.env.STRIPE_MOEDA || 'brl').toLowerCase(),
    urlSucesso: process.env.STRIPE_SUCCESS_URL || 'https://stripe.com',
    urlCancelamento: process.env.STRIPE_CANCEL_URL || 'https://stripe.com'
})

function isConfigured() {
    return Boolean(cfg().secretKey)
}

function webhookConfigurado() {
    return Boolean(cfg().webhookSecret)
}

/** Chave de teste (sk_test_) ou de produção (sk_live_)? */
function modo() {
    const k = cfg().secretKey || ''
    if (k.startsWith('sk_live_')) return 'producao'
    if (k.startsWith('sk_test_')) return 'teste'
    if (k.startsWith('sk_live_') || k.startsWith('rk_live_')) return 'producao'
    if (k.startsWith('sk_test_') || k.startsWith('rk_test_')) return 'teste'
    return 'desconhecido'
}

/**
 * O Stripe aceita form-urlencoded com colchetes para estrutura aninhada:
 *   { a: { b: 1 } }      -> a[b]=1
 *   { a: [ 'x', 'y' ] }  -> a[0]=x&a[1]=y
 */
function paraForm(obj, prefixo = '', acc = []) {
    for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === null) continue
        const chave = prefixo ? `${prefixo}[${k}]` : k
        if (Array.isArray(v)) {
            v.forEach((item, i) => {
                if (item && typeof item === 'object') paraForm(item, `${chave}[${i}]`, acc)
                else acc.push(`${encodeURIComponent(`${chave}[${i}]`)}=${encodeURIComponent(item)}`)
            })
        } else if (typeof v === 'object') {
            paraForm(v, chave, acc)
        } else {
            acc.push(`${encodeURIComponent(chave)}=${encodeURIComponent(v)}`)
        }
    }
    return acc
}

async function chamar(metodo, caminho, dados = null, opts = {}) {
    const c = cfg()
    if (!c.secretKey) throw new Error('STRIPE_SECRET_KEY não configurada')

    const headers = {
        Authorization: `Bearer ${c.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    // Chave de idempotência: se a rede cair depois do Stripe processar, repetir
    // a chamada não cria uma segunda cobrança.
    if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey

    const body = dados ? paraForm(dados).join('&') : undefined

    try {
        const { data } = await axios({
            method: metodo,
            url: `${API}${caminho}`,
            headers,
            data: body,
            timeout: 30000
        })
        return data
    } catch (e) {
        const err = e.response?.data?.error
        const msg = err?.message || e.message
        const erro = new Error(msg)
        erro.stripeCode = err?.code || null
        erro.stripeType = err?.type || null
        erro.status = e.response?.status || null
        throw erro
    }
}

/** Confere se a chave é válida e devolve dados da conta. */
async function verificarChave() {
    const conta = await chamar('get', '/account')
    return {
        id: conta.id,
        nome: conta.business_profile?.name || conta.settings?.dashboard?.display_name || null,
        pais: conta.country || null,
        moedaPadrao: conta.default_currency || null,
        chargesEnabled: Boolean(conta.charges_enabled),
        payoutsEnabled: Boolean(conta.payouts_enabled),
        modo: modo()
    }
}

/** Produto idempotente pelo nome: não cria duplicado a cada execução. */
async function garantirProduto(nome, descricao) {
    const lista = await chamar('get', `/products?active=true&limit=100`)
    const existente = (lista.data || []).find(p => p.name === nome)
    if (existente) return existente
    return chamar('post', '/products', { name: nome, description: descricao })
}

/** Preço idempotente por (produto, valor, moeda). */
async function garantirPreco(produtoId, centavos, moeda, apelido) {
    const lista = await chamar('get', `/prices?product=${produtoId}&active=true&limit=100`)
    const existente = (lista.data || []).find(
        p => p.unit_amount === centavos && p.currency === moeda && !p.recurring
    )
    if (existente) return existente
    return chamar('post', '/prices', {
        product: produtoId,
        unit_amount: centavos,
        currency: moeda,
        nickname: apelido
    })
}

/**
 * Cria a sessão de checkout e devolve o link de pagamento.
 *
 * `metadata` volta inteiro no webhook — é por ali que ligamos o pagamento ao
 * WhatsApp de quem comprou. Sem isso, o dinheiro entra e não há como saber
 * para quem creditar.
 *
 * @returns {Promise<{id:string, url:string, metodos:string[]}>}
 */
async function criarCheckout({ priceId, valorCentavos, descricao, metadata = {}, quantidade = 1 }) {
    const c = cfg()

    const base = {
        mode: 'payment',
        success_url: c.urlSucesso,
        cancel_url: c.urlCancelamento,
        metadata,
        // Repetido em payment_intent porque alguns eventos do webhook trazem
        // só o PaymentIntent, sem a sessão.
        payment_intent_data: { metadata },
        line_items: [
            priceId
                ? { price: priceId, quantity: quantidade }
                : {
                    quantity: quantidade,
                    price_data: {
                        currency: c.moeda,
                        unit_amount: valorCentavos,
                        product_data: { name: descricao }
                    }
                }
        ]
    }

    // Tenta com Pix; se a conta não tiver Pix habilitado, refaz só com cartão.
    try {
        const s = await chamar('post', '/checkout/sessions', {
            ...base,
            payment_method_types: ['card', 'pix']
        })
        return { id: s.id, url: s.url, metodos: ['cartão', 'Pix'] }
    } catch (e) {
        logger.warn(`[STRIPE] Pix indisponível nesta conta (${e.message}); seguindo só com cartão`)
        const s = await chamar('post', '/checkout/sessions', {
            ...base,
            payment_method_types: ['card']
        })
        return { id: s.id, url: s.url, metodos: ['cartão'] }
    }
}

async function buscarSessao(sessionId) {
    return chamar('get', `/checkout/sessions/${sessionId}`)
}

/**
 * Valida a assinatura do webhook.
 *
 * @param {Buffer|string} corpoCru corpo EXATO recebido, sem reserializar
 * @param {string} cabecalhoAssinatura valor do header `stripe-signature`
 * @returns {{ok:boolean, motivo?:string, evento?:object}}
 */
function verificarAssinatura(corpoCru, cabecalhoAssinatura) {
    const segredo = cfg().webhookSecret
    if (!segredo) return { ok: false, motivo: 'STRIPE_WEBHOOK_SECRET não configurado' }
    if (!cabecalhoAssinatura) return { ok: false, motivo: 'cabeçalho stripe-signature ausente' }

    const partes = {}
    for (const par of String(cabecalhoAssinatura).split(',')) {
        const [k, v] = par.split('=')
        if (!k) continue
        if (k.trim() === 'v1') (partes.v1 ||= []).push((v || '').trim())
        else partes[k.trim()] = (v || '').trim()
    }

    const t = Number(partes.t)
    if (!t || !partes.v1?.length) return { ok: false, motivo: 'assinatura malformada' }

    const idade = Math.abs(Math.floor(Date.now() / 1000) - t)
    if (idade > TOLERANCIA_S) {
        return { ok: false, motivo: `evento fora da janela de tempo (${idade}s) — possível replay` }
    }

    const texto = Buffer.isBuffer(corpoCru) ? corpoCru.toString('utf8') : String(corpoCru)
    const esperado = crypto.createHmac('sha256', segredo).update(`${t}.${texto}`).digest('hex')
    const bufEsperado = Buffer.from(esperado, 'hex')

    // timingSafeEqual evita vazar, pelo tempo de resposta, quantos bytes
    // bateram — que permitiria forjar a assinatura byte a byte.
    const confere = partes.v1.some(assinatura => {
        try {
            const buf = Buffer.from(assinatura, 'hex')
            return buf.length === bufEsperado.length && crypto.timingSafeEqual(buf, bufEsperado)
        } catch (e) {
            return false
        }
    })

    if (!confere) return { ok: false, motivo: 'assinatura inválida' }

    try {
        return { ok: true, evento: JSON.parse(texto) }
    } catch (e) {
        return { ok: false, motivo: 'corpo não é JSON válido' }
    }
}

/**
 * Verifica se a conta do Stripe possui suporte ativo ao Pix
 * @returns {Promise<{ok: boolean, pixHabilitado: boolean, erro?: string}>}
 */
async function verificarCapacidadesPix() {
    if (!isConfigured()) return { ok: false, pixHabilitado: false, erro: 'STRIPE_SECRET_KEY não configurada' };
    try {
        const s = await chamar('post', '/checkout/sessions', {
            mode: 'payment',
            success_url: 'https://stripe.com',
            cancel_url: 'https://stripe.com',
            line_items: [{
                price_data: {
                    currency: 'brl',
                    unit_amount: 1500,
                    product_data: { name: 'Verificação Pix' }
                },
                quantity: 1
            }],
            payment_method_types: ['card', 'pix']
        });
        if (s?.id) {
            try { await chamar('post', `/checkout/sessions/${s.id}/expire`); } catch (errIgnorado) { logger.warn(`[STRIPESERVICE] Falha ignorada em src/services/payments/stripeService.js:282: ${errIgnorado.message}`) }
        }
        return { ok: true, pixHabilitado: true };
    } catch (err) {
        return { ok: true, pixHabilitado: false, erro: err.message };
    }
}

module.exports = {
    isConfigured,
    webhookConfigurado,
    modo,
    verificarChave,
    garantirProduto,
    garantirPreco,
    criarCheckout,
    buscarSessao,
    verificarAssinatura,
    verificarCapacidadesPix,
    chamar
}
