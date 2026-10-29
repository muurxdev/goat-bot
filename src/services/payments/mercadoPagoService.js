const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Integração oficial com o Mercado Pago (Checkout Transparente & PIX)
 * 
 * Substitui a Stripe, permitindo pagamentos instantâneos via PIX (QR Code + Copia e Cola),
 * conferência automática de status e ativação imediata de aluguel e créditos.
 * 
 * API: REST direta com axios (sem dependência pesada de SDK externo).
 * Compatível com chaves de produção (APP_USR-...) e testes (TEST-...).
 */

const crypto = require('crypto');
const axios = require('axios');
const qrcode = require('qrcode');
const logger = require('../../core/logger');

const MP_API = 'https://api.mercadopago.com';

const cfg = () => ({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || '',
    webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET || '',
    notificationUrl: process.env.MERCADO_PAGO_WEBHOOK_URL || '',
    statementDescriptor: process.env.MERCADO_PAGO_STATEMENT_DESCRIPTOR || 'GOAT'
});

function isConfigured() {
    return Boolean(cfg().accessToken && cfg().accessToken.trim().length > 10);
}

function webhookConfigurado() {
    return Boolean(cfg().webhookSecret);
}

function modo() {
    const token = cfg().accessToken || '';
    if (token.startsWith('APP_USR-')) return 'producao';
    if (token.startsWith('TEST-')) return 'teste';
    if (isConfigured()) return 'producao';
    return 'simulacao';
}

function getPublicKey() {
    return cfg().publicKey;
}

/**
 * Executa requisição autenticada à API do Mercado Pago
 */
async function chamar(metodo, caminho, dados = null, opts = {}) {
    const c = cfg();
    if (!c.accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');
    }

    const headers = {
        Authorization: `Bearer ${c.accessToken}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {})
    };

    if (opts.idempotencyKey) {
        headers['X-Idempotency-Key'] = opts.idempotencyKey;
    }

    try {
        const res = await axios({
            method: metodo,
            url: `${MP_API}${caminho}`,
            headers,
            data: dados || undefined,
            timeout: opts.timeout || 30000
        });
        return res.data;
    } catch (err) {
        const data = err.response?.data;
        const msg = data?.message || data?.error || err.message;
        const erro = new Error(`Mercado Pago (${err.response?.status || 'ERR'}): ${msg}`);
        erro.status = err.response?.status;
        erro.details = data;
        throw erro;
    }
}

/**
 * Converte string Copia e Cola do PIX em Buffer PNG de QR Code
 * @param {string} copiaCola Código PIX
 * @returns {Promise<Buffer>}
 */
async function gerarQrCodeBuffer(copiaCola) {
    if (!copiaCola) return null;
    try {
        return await qrcode.toBuffer(copiaCola, {
            type: 'png',
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    } catch (err) {
        logger.error(`[MERCADOPAGO] Erro ao gerar imagem do QR Code: ${err.message}`);
        return null;
    }
}

/**
 * Gera um código PIX sintético válido para testes quando em modo de simulação
 */
function gerarPixSimulado(valorCentavos, id) {
    const valor = (valorCentavos / 100).toFixed(2);
    return `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}520400005303986540${valor.length}${valor}5802BR5915GOAT BOT6009SAO PAULO62070503***6304SIMU`;
}

/**
 * Cria cobrança PIX no Mercado Pago
 * 
 * @param {object} params
 * @param {number} params.valorCentavos Valor em centavos (ex: 3500 para R$ 35,00)
 * @param {string} params.descricao Descrição exibida no app do banco
 * @param {object} [params.metadata] Metadados anexados (ex: jid, pacote, targetJid)
 * @param {string} [params.payerEmail] E-mail do pagador
 * @param {string} [params.payerName] Nome do pagador
 * @param {string} [params.payerCpf] CPF do pagador (opcional)
 * @param {number} [params.expiracaoMinutos] Tempo até expirar (padrão 30 min)
 * @returns {Promise<{ id: string|number, status: string, copiaCola: string, qrCodeBuffer: Buffer, qrCodeBase64: string, ticketUrl: string, expiresAt: string, valorCentavos: number }>}
 */
async function criarPixPayment({
    valorCentavos,
    descricao,
    metadata = {},
    payerEmail = 'cliente@goat-bot.local',
    payerName = 'Cliente GOATBOT',
    payerCpf = null,
    expiracaoMinutos = 30
}) {
    const valorReais = Number((valorCentavos / 100).toFixed(2));
    const orderId = metadata.orderId || crypto.randomUUID();
    const idempotencyKey = `pix-${orderId}`;

    const expDate = new Date(Date.now() + expiracaoMinutos * 60 * 1000).toISOString();

    // Se as credenciais reais não estiverem configuradas, opera em modo Simulado gracioso
    if (!isConfigured()) {
        logger.warn('[MERCADOPAGO] Token não configurado; gerando pagamento PIX em modo simulação.');
        const fakeId = `SIMU-${Date.now()}`;
        const fakePix = gerarPixSimulado(valorCentavos, fakeId);
        const qrBuf = await gerarQrCodeBuffer(fakePix);

        return {
            id: fakeId,
            status: 'pending',
            statusDetail: 'pending_waiting_transfer',
            copiaCola: fakePix,
            qrCodeBase64: qrBuf ? qrBuf.toString('base64') : null,
            qrCodeBuffer: qrBuf,
            ticketUrl: 'https://www.mercadopago.com.br',
            expiresAt: expDate,
            valorCentavos,
            modo: 'simulacao',
            metadata
        };
    }

    const payload = {
        transaction_amount: valorReais,
        description: descricao.substring(0, 100),
        payment_method_id: 'pix',
        payer: {
            email: payerEmail.includes('@') ? payerEmail : 'cliente@goat-bot.local',
            first_name: payerName.split(' ')[0] || 'Cliente',
            last_name: payerName.split(' ').slice(1).join(' ') || 'GOATBOT',
            identification: payerCpf ? { type: 'CPF', number: payerCpf.replace(/\D/g, '') } : undefined
        },
        date_of_expiration: expDate,
        statement_descriptor: cfg().statementDescriptor,
        metadata: {
            ...metadata,
            bot: 'GOATBOT',
            orderId
        }
    };

    if (cfg().notificationUrl) {
        payload.notification_url = cfg().notificationUrl;
    }

    const data = await chamar('post', '/v1/payments', payload, { idempotencyKey });

    const td = data.point_of_interaction?.transaction_data || {};
    const copiaCola = td.qr_code || '';
    const qrCodeBase64 = td.qr_code_base64 || null;

    let qrCodeBuffer = null;
    if (copiaCola) {
        qrCodeBuffer = await gerarQrCodeBuffer(copiaCola);
    } else if (qrCodeBase64) {
        qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64');
    }

    return {
        id: data.id,
        status: data.status,
        statusDetail: data.status_detail,
        copiaCola,
        qrCodeBase64,
        qrCodeBuffer,
        ticketUrl: td.ticket_url || null,
        expiresAt: data.date_of_expiration || expDate,
        valorCentavos,
        modo: modo(),
        metadata: data.metadata || metadata
    };
}

/**
 * Consulta o status de um pagamento pelo ID no Mercado Pago
 * @param {string|number} paymentId
 */
async function consultarPagamento(paymentId) {
    if (!paymentId) throw new Error('ID do pagamento obrigatório.');

    // Tratamento para pagamentos simulados de teste
    if (String(paymentId).startsWith('SIMU-')) {
        return {
            id: paymentId,
            status: 'approved',
            statusDetail: 'accredited',
            isApproved: true,
            amount: 10,
            dateApproved: new Date().toISOString(),
            modo: 'simulacao',
            metadata: {}
        };
    }

    const data = await chamar('get', `/v1/payments/${encodeURIComponent(paymentId)}`);
    const isApproved = data.status === 'approved';

    return {
        id: data.id,
        status: data.status,
        statusDetail: data.status_detail,
        isApproved,
        amount: data.transaction_amount,
        dateApproved: data.date_approved,
        metadata: data.metadata || {},
        payer: data.payer,
        modo: modo()
    };
}

/**
 * Cancela um pagamento pendente
 * @param {string|number} paymentId
 */
async function cancelarPagamento(paymentId) {
    if (String(paymentId).startsWith('SIMU-')) return { status: 'cancelled' };
    return chamar('put', `/v1/payments/${encodeURIComponent(paymentId)}`, { status: 'cancelled' });
}

/**
 * Valida a assinatura de um webhook recebido do Mercado Pago
 * Cabeçalho: x-signature: ts=...,v1=...
 * 
 * @param {object} headers Cabeçalhos HTTP da requisição
 * @param {string} dataId ID do dado (data.id do webhook ou query param)
 * @returns {boolean}
 */
function verificarAssinatura(headers = {}, dataId = '') {
    const secret = cfg().webhookSecret;
    if (!secret) return false;

    const signature = headers['x-signature'] || headers['X-Signature'];
    if (!signature || !dataId) return false;

    try {
        const parts = Object.fromEntries(
            signature.split(',').map(p => p.trim().split('=', 2))
        );
        const ts = parts['ts'];
        const v1 = parts['v1'];
        if (!ts || !v1) return false;

        const requestId = headers['x-request-id'] || headers['X-Request-Id'];
        let manifest = `id:${String(dataId).toLowerCase()};`;
        if (requestId) manifest += `request-id:${requestId};`;
        manifest += `ts:${ts};`;

        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const digest = hmac.digest('hex');

        const expected = Buffer.from(digest, 'hex');
        const received = Buffer.from(v1, 'hex');

        if (expected.length !== received.length) return false;
        return crypto.timingSafeEqual(expected, received);
    } catch (err) {
        logger.warn(`[MERCADOPAGO] Falha ao verificar assinatura webhook: ${err.message}`);
        return false;
    }
}

/**
 * Processa a aprovação de um pagamento creditando o aluguel e notificando
 */
async function processarAprovacao({
    paymentId,
    client = null,
    pacoteId = null,
    targetJid = null,
    requestedBy = null,
    dias = 30,
    valorCentavos = 0
}) {
    const rentalService = require('../rentalService');
    const creditsService = require('./creditsService');
    const configRepo = require('../../database/repositories/configRepository');
    const F = require('../../utils/formato');
    const { notifyDonos } = require('../ownerService');

    const CHAVE_MP_PROCESSADOS = '__mercadopago_eventos__';
    const processados = configRepo.getConfig(CHAVE_MP_PROCESSADOS) || {};

    if (processados[paymentId]) {
        logger.info(`[MERCADOPAGO] Pagamento ${paymentId} já processado anteriormente.`);
        return { ok: true, repetido: true };
    }

    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const valorFormatado = (valorCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // 1. Concede créditos ou estende aluguel diretamente
    let rentalRes = null;
    if (targetJid && dias) {
        try {
            rentalRes = rentalService.addRentalTime(targetJid, `${dias}d`, requestedBy || 'MERCADOPAGO');
            logger.info(`[MERCADOPAGO] Aluguel estendido para ${targetJid} por ${dias} dias.`);
        } catch (err) {
            logger.error(`[MERCADOPAGO] Erro ao estender aluguel para ${targetJid}: ${err.message}`);
        }
    }

    if (requestedBy) {
        try {
            creditsService.creditarPagamento({
                jid: requestedBy,
                centavos: valorCentavos,
                eventId: `mp_${paymentId}`,
                sessionId: String(paymentId)
            });
        } catch (err) {
            logger.warn(`[MERCADOPAGO] Aviso ao registrar créditos: ${err.message}`);
        }
    }

    // Marca como processado
    processados[paymentId] = {
        processadoEm: new Date().toISOString(),
        valorCentavos,
        targetJid,
        requestedBy,
        pacoteId
    };
    configRepo.saveConfig(CHAVE_MP_PROCESSADOS, processados);

    // Notificações via WhatsApp
    if (client) {
        const comprovanteDoc = F.tela({
            prefix: '.',
            emoji: '✅',
            titulo: 'Pagamento PIX Aprovado!',
            intro: 'O seu pagamento via Mercado Pago foi confirmado com sucesso. O bot já está liberado!',
            secoes: [{
                emoji: '🧾',
                titulo: 'Recibo da Operação',
                linhas: [
                    F.campo('Pagamento ID', `#${paymentId}`),
                    F.campo('Plano', pacoteId || 'Aluguel'),
                    F.campo('Duração', `+${dias} dias`),
                    F.campo('Valor', valorFormatado),
                    F.campo('Destino', targetJid ? `${nomeDoMembro(targetJid)}` : 'Carteira'),
                    F.campo('Confirmado em', agora)
                ]
            }],
            dica: 'Obrigado pela confiança! O acesso foi renovado automaticamente.',
            proximos: [
                { nome: 'aluguel', args: 'status', oque: 'conferir o tempo restante' },
                { nome: 'menu', oque: 'abrir os comandos do bot' }
            ]
        });

        // Envia para o comprador
        const destinatario = requestedBy || targetJid;
        if (destinatario) {
            try {
                await client.sendMessage(destinatario, { text: comprovanteDoc, mentions: [destinatario] });
            } catch (err) {
                logger.warn(`[MERCADOPAGO] Não foi possível enviar recibo para ${destinatario}: ${err.message}`);
            }
        }

        // Notifica Donos
        const donoDoc = F.tela({
            prefix: '.',
            emoji: '💰',
            titulo: 'Novo Pagamento Confirmado (Mercado Pago)',
            intro: `Recebido pagamento PIX de ${valorFormatado} referente ao plano ${pacoteId || 'Aluguel'}.`,
            secoes: [{
                emoji: '📋',
                titulo: 'Detalhes',
                linhas: [
                    F.campo('ID Transação', `#${paymentId}`),
                    F.campo('Valor', valorFormatado),
                    F.campo('Pagador', requestedBy ? `${nomeDoMembro(requestedBy)}` : 'Desconhecido'),
                    F.campo('Alvo Liberado', targetJid ? `${nomeDoMembro(targetJid)}` : 'N/A'),
                    F.campo('Dias Adicionados', `+${dias} dias`),
                    F.campo('Horário', agora)
                ]
            }]
        });

        try {
            await notifyDonos(client, donoDoc, { mentions: [requestedBy, targetJid].filter(Boolean) });
        } catch (err) {
            logger.warn(`[MERCADOPAGO] Aviso aos donos falhou: ${err.message}`);
        }
    }

    return { ok: true, rentalRes };
}

module.exports = {
    isConfigured,
    webhookConfigurado,
    modo,
    getPublicKey,
    chamar,
    gerarQrCodeBuffer,
    criarPixPayment,
    consultarPagamento,
    cancelarPagamento,
    verificarAssinatura,
    processarAprovacao
};
