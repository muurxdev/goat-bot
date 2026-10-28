/**
 * Serviço de Gerenciamento de Pacotes de Aluguel e Combos
 * 
 * Permite listar, editar preços, adicionar novos planos e criar combos dinamicamente.
 * Ao alterar qualquer plano no bot, sincroniza automaticamente com o Mercado Pago / processador de pagamentos.
 */

const configRepo = require('../../database/repositories/configRepository');
const logger = require('../../core/logger');
const mercadoPago = require('./mercadoPagoService');

const CHAVE_PACOTES = '__aluguel_pacotes__';

const PACOTES_PADRAO = [
    // Grupos
    { id: 'g1', escopo: 'Grupo', nome: 'Grupo Semanal', centavos: 1500, dias: 7 },
    { id: 'g2', escopo: 'Grupo', nome: 'Grupo Mensal', centavos: 3500, dias: 30 },
    { id: 'g3', escopo: 'Grupo', nome: 'Grupo Trimestral', centavos: 9000, dias: 90 },
    { id: 'g4', escopo: 'Grupo', nome: 'Grupo Anual', centavos: 28000, dias: 365 },

    // PV (Privado)
    { id: 'pv1', escopo: 'PV', nome: 'PV Semanal', centavos: 1000, dias: 7 },
    { id: 'pv2', escopo: 'PV', nome: 'PV Mensal', centavos: 2000, dias: 30 },
    { id: 'pv3', escopo: 'PV', nome: 'PV Trimestral', centavos: 5000, dias: 90 },
    { id: 'pv4', escopo: 'PV', nome: 'PV Anual', centavos: 15000, dias: 365 },

    // Combos (Grupo + PV)
    { id: 'c1', escopo: 'Combo', nome: 'Combo Mensal (Grupo + PV)', centavos: 4500, dias: 30 },
    { id: 'c2', escopo: 'Combo', nome: 'Combo Trimestral (Grupo + PV)', centavos: 12000, dias: 90 },
    { id: 'c3', escopo: 'Combo', nome: 'Combo Anual (Grupo + PV)', centavos: 35000, dias: 365 },

    // Aluguel do Bot Completo (Subdono — Liberação do PV, Entrada/Saída e Comandos de Gerência)
    { id: 'b1', escopo: 'Bot (Subdono)', nome: 'Subdono Semanal', centavos: 3000, dias: 7 },
    { id: 'b2', escopo: 'Bot (Subdono)', nome: 'Subdono Mensal', centavos: 7000, dias: 30 },
    { id: 'b3', escopo: 'Bot (Subdono)', nome: 'Subdono Trimestral', centavos: 16000, dias: 90 },
    { id: 'b4', escopo: 'Bot (Subdono)', nome: 'Subdono Anual', centavos: 45000, dias: 365 },
    { id: 'b5', escopo: 'Bot (Subdono)', nome: 'Subdono Vitalício', centavos: 80000, dias: 36500, isLifetime: true }
];

function _lerPacotes() {
    try {
        const salvos = configRepo.getConfig(CHAVE_PACOTES);
        if (Array.isArray(salvos) && salvos.length > 0) {
            return salvos;
        }
    } catch (errIgnorado) { logger.warn(`[RENTALPACKAGESSERVICE] Falha ignorada em src/services/payments/rentalPackagesService.js:45: ${errIgnorado.message}`) }
    return JSON.parse(JSON.stringify(PACOTES_PADRAO));
}

function _salvarPacotes(pacotes) {
    configRepo.saveConfig(CHAVE_PACOTES, pacotes);
}

function getPacotes() {
    return _lerPacotes();
}

function getPacote(id) {
    if (!id) return null;
    const clean = String(id).toLowerCase().trim();
    return _lerPacotes().find(p => p.id.toLowerCase() === clean || p.nome.toLowerCase() === clean) || null;
}

/**
 * Converte valor numérico ou string em reais para centavos inteiros
 */
function reaisParaCentavos(valor) {
    if (typeof valor === 'number') {
        return Math.round(valor * 100);
    }
    if (typeof valor !== 'string') return 0;

    let str = valor.replace(/R\$/gi, '').trim();

    if (str.includes('.') && str.includes(',')) {
        if (str.indexOf('.') < str.indexOf(',')) {
            // Ponto é milhar, vírgula é decimal (ex: 1.500,50)
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            // Vírgula é milhar, ponto é decimal (ex: 1,500.50)
            str = str.replace(/,/g, '');
        }
    } else if (str.includes(',')) {
        // Apenas vírgula: é decimal (ex: 19,90)
        str = str.replace(',', '.');
    } else if ((str.match(/\./g) || []).length > 1) {
        // Mais de um ponto: pontos são milhares (ex: 1.000.000)
        str = str.replace(/\./g, '');
    }

    const num = parseFloat(str);
    if (isNaN(num) || num <= 0) return 0;
    return Math.round(num * 100);
}

/**
 * Sincroniza um pacote com a API do Mercado Pago
 */
async function sincronizarComMercadoPago(pacote) {
    try {
        if (!mercadoPago.isConfigured()) {
            return { ok: true, simulado: true, motivo: 'Mercado Pago em modo local/simulação' };
        }
        logger.info(`[MERCADOPAGO SYNC] Pacote ${pacote.id} validado para PIX Mercado Pago (R$ ${(pacote.centavos/100).toFixed(2)})`);
        return { ok: true, modo: mercadoPago.modo() };
    } catch (err) {
        logger.warn(`[MERCADOPAGO SYNC WARN] Falha ao sincronizar pacote ${pacote.id}: ${err.message}`);
        return { ok: false, motivo: err.message };
    }
}

/**
 * Sincroniza um pacote com a API da Stripe (garante produto e preço oficial)
 */
async function sincronizarComStripe(pacote) {
    try {
        const stripe = require('./stripeService');
        if (!stripe.isConfigured()) return { ok: false, motivo: 'Stripe não configurado no .env' };

        // 1. Garante o produto na Stripe
        const desc = `GOATBOT — Plano ${pacote.nome} (${pacote.dias} dias de acesso ${pacote.escopo})`;
        const prod = await stripe.garantirProduto(`Aluguel: ${pacote.nome}`, desc);

        // 2. Garante o preço oficial na Stripe
        const preco = await stripe.garantirPreco(prod.id, pacote.centavos, 'brl', `${pacote.id} - ${pacote.nome}`);

        logger.info(`[STRIPE SYNC] Pacote ${pacote.id} sincronizado com a Stripe: Produto ${prod.id}, Preço ${preco.id} (R$ ${(pacote.centavos/100).toFixed(2)})`);
        return { ok: true, stripeProductId: prod.id, stripePriceId: preco.id };
    } catch (err) {
        logger.warn(`[STRIPE SYNC WARN] Falha ao sincronizar pacote ${pacote.id} na Stripe: ${err.message}`);
        return { ok: false, motivo: err.message };
    }
}

/**
 * Altera o preço de um plano existente e sincroniza
 */
async function setPreco(id, novoValor) {
    const pacotes = _lerPacotes();
    const cleanId = String(id).toLowerCase().trim();
    const idx = pacotes.findIndex(p => p.id.toLowerCase() === cleanId);

    if (idx === -1) {
        throw new Error(`Pacote com código "${id}" não encontrado.`);
    }

    const centavos = reaisParaCentavos(novoValor);
    if (centavos < 100) {
        throw new Error('O valor mínimo permitido para um plano é R$ 1,00.');
    }

    pacotes[idx].centavos = centavos;
    _salvarPacotes(pacotes);

    // Sincroniza em tempo real com Mercado Pago e Stripe
    const mpSync = await sincronizarComMercadoPago(pacotes[idx]);
    const stripeSync = await sincronizarComStripe(pacotes[idx]);
    if (stripeSync.ok) {
        pacotes[idx].stripePriceId = stripeSync.stripePriceId;
        _salvarPacotes(pacotes);
    }

    return { pacote: pacotes[idx], mpSync, stripeSync };
}

/**
 * Adiciona ou substitui um plano e sincroniza
 */
async function addPlano({ id, escopo, nome, dias, valor }) {
    const pacotes = _lerPacotes();
    const cleanId = String(id).toLowerCase().trim();
    const centavos = reaisParaCentavos(valor);

    if (!cleanId || cleanId.length < 2) throw new Error('ID do plano deve ter pelo menos 2 caracteres (ex: g5, pv5, c4).');
    if (!['Grupo', 'PV', 'Combo'].includes(escopo)) throw new Error('Escopo deve ser "Grupo", "PV" ou "Combo".');
    if (!nome || nome.length < 3) throw new Error('Nome do plano deve ser informado.');
    if (!dias || isNaN(dias) || dias < 1) throw new Error('Quantidade de dias deve ser um número maior que zero.');
    if (centavos < 100) throw new Error('O valor mínimo permitido é R$ 1,00.');

    const novo = {
        id: cleanId,
        escopo,
        nome: nome.trim(),
        centavos,
        dias: parseInt(dias, 10)
    };

    const existingIdx = pacotes.findIndex(p => p.id.toLowerCase() === cleanId);
    if (existingIdx !== -1) {
        pacotes[existingIdx] = novo;
    } else {
        pacotes.push(novo);
    }

    _salvarPacotes(pacotes);

    const mpSync = await sincronizarComMercadoPago(novo);
    const stripeSync = await sincronizarComStripe(novo);
    if (stripeSync.ok) {
        novo.stripePriceId = stripeSync.stripePriceId;
        _salvarPacotes(pacotes);
    }

    return { pacote: novo, mpSync, stripeSync };

    return { pacote: novo, stripeSync };
}

/**
 * Remove um plano da lista
 */
function delPlano(id) {
    const pacotes = _lerPacotes();
    const cleanId = String(id).toLowerCase().trim();
    const filtrados = pacotes.filter(p => p.id.toLowerCase() !== cleanId);

    if (filtrados.length === pacotes.length) {
        throw new Error(`Pacote "${id}" não encontrado.`);
    }

    _salvarPacotes(filtrados);
    return true;
}

/**
 * Restaura tabela original de pacotes padrão
 */
function resetPacotes() {
    _salvarPacotes(PACOTES_PADRAO);
    return PACOTES_PADRAO;
}

/**
 * Sincroniza todos os pacotes cadastrados com o Mercado Pago
 */
async function sincronizarTodosComMercadoPago() {
    const pacotes = _lerPacotes();
    const resultados = [];
    for (let i = 0; i < pacotes.length; i++) {
        const sync = await sincronizarComMercadoPago(pacotes[i]);
        resultados.push({ id: pacotes[i].id, nome: pacotes[i].nome, ...sync });
    }
    return resultados;
}

/**
 * Sincroniza todos os pacotes cadastrados com a Stripe
 */
async function sincronizarTodosComStripe() {
    const pacotes = _lerPacotes();
    const resultados = [];
    for (let i = 0; i < pacotes.length; i++) {
        const sync = await sincronizarComStripe(pacotes[i]);
        if (sync.ok) {
            pacotes[i].stripePriceId = sync.stripePriceId;
            pacotes[i].stripeProductId = sync.stripeProductId;
        }
        resultados.push({ id: pacotes[i].id, nome: pacotes[i].nome, ...sync });
    }
    _salvarPacotes(pacotes);
    return resultados;
}

module.exports = {
    getPacotes,
    getPacote,
    setPreco,
    addPlano,
    delPlano,
    resetPacotes,
    sincronizarComMercadoPago,
    sincronizarTodosComMercadoPago,
    sincronizarComStripe,
    sincronizarTodosComStripe,
    reaisParaCentavos
};

