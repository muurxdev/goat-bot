/**
 * stockMarketService.js
 * Motor financeiro da Bolsa de Valores de Reino & Mercado Global.
 * Cotações dinâmicas, volatilidade determinística/persistente, ordens de compra e venda,
 * preço médio (PM), dividendos diários e histórico de operações.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

// Catálogo de Ações, Commodities, Criptos e FIIs da Bolsa de Reino
const STOCKS_CATALOG = {
    // Ações do Reino & Lore (Futebol & Comunidade Global)
    'MELI3': { code: 'MELI3', name: 'GOAT Inter Holdings', sector: 'Esportes & Franquias', basePrice: 142.50, volatility: 0.05, divYield: 0.08 },
    'LION4': { code: 'LION4', name: 'Reino Central S.A.', sector: 'Governo & Defesa', basePrice: 88.20, volatility: 0.03, divYield: 0.09 },
    'FAIRY3': { code: 'FAIRY3', name: 'Floresta das Fadas Papéis', sector: 'Madeira & Celulose', basePrice: 215.00, volatility: 0.06, divYield: 0.05 },
    'PURG1': { code: 'PURG1', name: 'Mineração Purgatório', sector: 'Mineração Extrema', basePrice: 46.80, volatility: 0.12, divYield: 0.02 },
    'SUNSH3': { code: 'SUNSH3', name: 'Energia Solar', sector: 'Energia Limpa', basePrice: 385.00, volatility: 0.07, divYield: 0.06 },
    'CAML3': { code: 'CAML3', name: 'Cidade Dourada Empreendimentos', sector: 'Construção Civil', basePrice: 112.40, volatility: 0.04, divYield: 0.07 },
    'DRAG3': { code: 'DRAG3', name: 'Dragão FC Sports', sector: 'Esportes & Performance', basePrice: 54.10, volatility: 0.06, divYield: 0.04 },
    'NUTR4': { code: 'NUTR4', name: 'Nutrição dos Atletas S.A.', sector: 'Alimentos & Saúde', basePrice: 32.50, volatility: 0.04, divYield: 0.05 },
    'MERL3': { code: 'MERL3', name: 'Alta Tecnologia Belialuin', sector: 'Magia & Tecnologia', basePrice: 512.00, volatility: 0.09, divYield: 0.03 },
    'GOWT3': { code: 'GOWT3', name: 'Telepatia & Automação S/A', sector: 'Inteligência Artificial', basePrice: 278.90, volatility: 0.08, divYield: 0.04 },

    // Tecnologia Global
    'NVDA4': { code: 'NVDA4', name: 'Nvidia Corporation', sector: 'Semicondutores & IA', basePrice: 620.00, volatility: 0.08, divYield: 0.02 },
    'AAPL4': { code: 'AAPL4', name: 'Apple Inc.', sector: 'Eletrônicos & Serviços', basePrice: 480.00, volatility: 0.04, divYield: 0.03 },
    'GOOG4': { code: 'GOOG4', name: 'Alphabet / Google', sector: 'Busca & Nuvem', basePrice: 410.00, volatility: 0.05, divYield: 0.02 },
    'MSFT4': { code: 'MSFT4', name: 'Microsoft Corp.', sector: 'Software Empresarial', basePrice: 530.00, volatility: 0.04, divYield: 0.03 },
    'AMZN4': { code: 'AMZN4', name: 'Amazon.com S/A', sector: 'E-commerce & AWS', basePrice: 390.00, volatility: 0.06, divYield: 0.01 },
    'META4': { code: 'META4', name: 'Meta Platforms', sector: 'Redes Sociais & Metaverso', basePrice: 360.00, volatility: 0.07, divYield: 0.02 },
    'TSLA4': { code: 'TSLA4', name: 'Tesla Motors', sector: 'Veículos Autônomos', basePrice: 450.00, volatility: 0.11, divYield: 0.01 },

    // Commodities & Indústria
    'PETR4': { code: 'PETR4', name: 'Petróleo Real de Reino', sector: 'Óleo & Gás', basePrice: 75.30, volatility: 0.05, divYield: 0.12 },
    'VALE3': { code: 'VALE3', name: 'Vale do Ferro Sagrado', sector: 'Mineração & Metais', basePrice: 94.60, volatility: 0.05, divYield: 0.10 },
    'GOLD3': { code: 'GOLD3', name: 'Contrato Ouro Fino 24k', sector: 'Reserva de Valor', basePrice: 310.00, volatility: 0.02, divYield: 0.01 },
    'SLVR3': { code: 'SLVR3', name: 'Prata Pura Central', sector: 'Commodities Metálicas', basePrice: 85.00, volatility: 0.03, divYield: 0.01 },
    'SOYA3': { code: 'SOYA3', name: 'Grãos & Soja do Vale', sector: 'Agronegócio', basePrice: 62.40, volatility: 0.04, divYield: 0.07 },
    'URAN3': { code: 'URAN3', name: 'Cristal Ígneo Radioativo', sector: 'Energia Nuclear', basePrice: 195.00, volatility: 0.10, divYield: 0.03 },

    // Criptoativos Virtuais
    'BTC3': { code: 'BTC3', name: 'BitMoeda Real', sector: 'Criptomoeda', basePrice: 2850.00, volatility: 0.14, divYield: 0.00 },
    'ETH3': { code: 'ETH3', name: 'Éter Sagrado Token', sector: 'Smart Contracts', basePrice: 1650.00, volatility: 0.13, divYield: 0.02 },
    'SOL3': { code: 'SOL3', name: 'Sol Token', sector: 'DeFi Ultra Rápido', basePrice: 420.00, volatility: 0.16, divYield: 0.01 },
    'DOGE3': { code: 'DOGE3', name: 'Cão Mascote Cripto', sector: 'Memecoin Britânica', basePrice: 12.50, volatility: 0.22, divYield: 0.00 },

    // Fundos de Investimento Imobiliário (FIIs)
    'HGLG11': { code: 'HGLG11', name: 'Galpões Reais Central', sector: 'FII Logística', basePrice: 165.00, volatility: 0.02, divYield: 0.11 },
    'KNRI11': { code: 'KNRI11', name: 'Edifícios Comerciais Central', sector: 'FII Lajes Corporativas', basePrice: 148.00, volatility: 0.02, divYield: 0.10 },
    'XPLG11': { code: 'XPLG11', name: 'Entrepostos e Carruagens FII', sector: 'FII Logístico', basePrice: 110.00, volatility: 0.02, divYield: 0.12 },
    'MXRF11': { code: 'MXRF11', name: 'Maxi Renda da Taberna', sector: 'FII Papel / CRI', basePrice: 10.45, volatility: 0.01, divYield: 0.14 },
    'VGHF11': { code: 'VGHF11', name: 'Hedge Fund Imobiliário Reino', sector: 'FII Multiestratégia', basePrice: 9.35, volatility: 0.02, divYield: 0.13 }
}

/**
 * Calcula a cotação determinística baseada na hora atual e no seed da ação.
 * Garante que todos os usuários vejam os mesmos preços sincronizados.
 */
function getQuote(ticker) {
    const stock = STOCKS_CATALOG[ticker.toUpperCase()]
    if (!stock) return null

    const now = new Date()
    // Variação por hora do dia e dia do ano
    const timeIndex = Math.floor(now.getTime() / (1000 * 60 * 30)) // muda a cada 30 min
    const codeNum = stock.code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    
    // Pseudo-random seno/cosseno sincronizado
    const wave1 = Math.sin(timeIndex * 0.13 + codeNum)
    const wave2 = Math.cos(timeIndex * 0.07 + codeNum * 2)
    const cycle = (wave1 * 0.6 + wave2 * 0.4) // valor entre -1 e 1

    const deltaPercent = cycle * stock.volatility
    const currentPrice = Math.max(1, Math.round(stock.basePrice * (1 + deltaPercent) * 100) / 100)
    const variationPercent = Math.round(deltaPercent * 10000) / 100

    return {
        ...stock,
        price: currentPrice,
        variation: variationPercent,
        isUp: variationPercent >= 0,
        volume: Math.floor(Math.abs(Math.sin(timeIndex + codeNum)) * 50000 + 10000)
    }
}

/**
 * Retorna todas as cotações ativas
 */
function getAllQuotes() {
    return Object.keys(STOCKS_CATALOG).map(code => getQuote(code))
}

/**
 * Compra ações para o usuário
 */
function buyStock(jid, ticker, shares) {
    const quote = getQuote(ticker)
    if (!quote) return { success: false, message: `Ticker *${ticker}* não encontrado no pregão.` }
    if (!shares || isNaN(shares) || shares <= 0) return { success: false, message: 'Quantidade de cotas inválida.' }

    shares = Math.floor(shares)
    const totalCost = Math.ceil(quote.price * shares)

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < totalCost) {
        return {
            success: false,
            message: `Saldo insuficiente! Você precisa de *${totalCost.toLocaleString('pt-BR')} moedas*, mas possui *${(user.coins || 0).toLocaleString('pt-BR')}*.`
        }
    }

    // Debita moedas
    user.coins = (user.coins || 0) - totalCost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    // Atualiza carteira de ações no SQLite
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM stocks_portfolio WHERE jid = ? AND ticker = ?').get(jid, quote.code)

    if (existing) {
        const totalOldShares = existing.shares
        const newTotalShares = totalOldShares + shares
        const newAvgPrice = Math.round(((existing.avg_price * totalOldShares) + (quote.price * shares)) / newTotalShares * 100) / 100

        db.prepare('UPDATE stocks_portfolio SET shares = ?, avg_price = ?, updated_at = ? WHERE jid = ? AND ticker = ?')
            .run(newTotalShares, newAvgPrice, Date.now(), jid, quote.code)
    } else {
        db.prepare('INSERT INTO stocks_portfolio (jid, ticker, shares, avg_price, updated_at) VALUES (?, ?, ?, ?, ?)')
            .run(jid, quote.code, shares, quote.price, Date.now())
    }

    // Registra no histórico
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    db.prepare('INSERT INTO stocks_history (id, jid, ticker, type, shares, price, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(orderId, jid, quote.code, 'BUY', shares, quote.price, totalCost, Date.now())

    return {
        success: true,
        orderId,
        quote,
        shares,
        totalCost,
        remainingBalance: user.coins
    }
}

/**
 * Vende ações da carteira do usuário
 */
function sellStock(jid, ticker, shares) {
    const quote = getQuote(ticker)
    if (!quote) return { success: false, message: `Ticker *${ticker}* não encontrado no pregão.` }
    if (!shares || isNaN(shares) || shares <= 0) return { success: false, message: 'Quantidade de cotas inválida.' }

    shares = Math.floor(shares)
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM stocks_portfolio WHERE jid = ? AND ticker = ?').get(jid, quote.code)

    if (!existing || existing.shares < shares) {
        const disponiveis = existing ? existing.shares : 0
        return {
            success: false,
            message: `Você só possui *${disponiveis} cotas* de *${quote.code}*. Não é possível vender ${shares}.`
        }
    }

    const totalRevenue = Math.floor(quote.price * shares)
    const profit = Math.floor((quote.price - existing.avg_price) * shares)

    // Atualiza carteira
    const remainingShares = existing.shares - shares
    if (remainingShares === 0) {
        db.prepare('DELETE FROM stocks_portfolio WHERE jid = ? AND ticker = ?').run(jid, quote.code)
    } else {
        db.prepare('UPDATE stocks_portfolio SET shares = ?, updated_at = ? WHERE jid = ? AND ticker = ?')
            .run(remainingShares, Date.now(), jid, quote.code)
    }

    // Credita moedas
    const user = economyService.carregarUsuario(jid)
    user.coins = (user.coins || 0) + totalRevenue
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    // Registra histórico
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    db.prepare('INSERT INTO stocks_history (id, jid, ticker, type, shares, price, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(orderId, jid, quote.code, 'SELL', shares, quote.price, totalRevenue, Date.now())

    return {
        success: true,
        orderId,
        quote,
        shares,
        totalRevenue,
        profit,
        remainingShares,
        newBalance: user.coins
    }
}

/**
 * Retorna o portfólio completo do usuário com cálculo de rentabilidade
 */
function getPortfolio(jid) {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM stocks_portfolio WHERE jid = ? AND shares > 0').all(jid)

    let totalInvested = 0
    let totalCurrent = 0

    const items = rows.map(r => {
        const quote = getQuote(r.ticker)
        const currentVal = Math.round(quote.price * r.shares * 100) / 100
        const investedVal = Math.round(r.avg_price * r.shares * 100) / 100
        const pnl = Math.round((currentVal - investedVal) * 100) / 100
        const pnlPercent = investedVal > 0 ? Math.round((pnl / investedVal) * 10000) / 100 : 0

        totalInvested += investedVal
        totalCurrent += currentVal

        return {
            ticker: r.ticker,
            name: quote.name,
            sector: quote.sector,
            shares: r.shares,
            avgPrice: r.avg_price,
            currentPrice: quote.price,
            investedVal,
            currentVal,
            pnl,
            pnlPercent
        }
    })

    const totalPnl = Math.round((totalCurrent - totalInvested) * 100) / 100
    const totalPnlPercent = totalInvested > 0 ? Math.round((totalPnl / totalInvested) * 10000) / 100 : 0

    return {
        items,
        totalInvested: Math.round(totalInvested),
        totalCurrent: Math.round(totalCurrent),
        totalPnl: Math.round(totalPnl),
        totalPnlPercent
    }
}

/**
 * Resgata dividendos diários do portfólio
 */
function claimDividends(jid) {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM stocks_portfolio WHERE jid = ? AND shares > 0').all(jid)
    if (!rows || rows.length === 0) {
        return { success: false, message: 'Você não possui ações em custódia para receber dividendos.' }
    }

    const lastClaim = db.prepare('SELECT MAX(created_at) as last FROM stocks_history WHERE jid = ? AND type = \'DIVIDEND\'').get(jid)
    const oneDayMs = 24 * 60 * 60 * 1000
    if (lastClaim && lastClaim.last && (Date.now() - lastClaim.last) < oneDayMs) {
        const remainingHours = Math.ceil((oneDayMs - (Date.now() - lastClaim.last)) / (1000 * 60 * 60))
        return { success: false, message: `Seus proventos já foram pagos hoje! Próxima data de corte em *${remainingHours} horas*.` }
    }

    let totalDividends = 0
    const details = []

    for (const r of rows) {
        const stock = STOCKS_CATALOG[r.ticker]
        if (!stock) continue
        const divPerShare = (stock.basePrice * stock.divYield) / 30 // Provento diário
        const amount = Math.max(1, Math.floor(divPerShare * r.shares))
        totalDividends += amount
        details.push({ ticker: r.ticker, amount, shares: r.shares })
    }

    if (totalDividends <= 0) {
        return { success: false, message: 'Nenhum provento devido no momento.' }
    }

    const user = economyService.carregarUsuario(jid)
    user.coins = (user.coins || 0) + totalDividends
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const orderId = `DIV-${Date.now()}`
    db.prepare('INSERT INTO stocks_history (id, jid, ticker, type, shares, price, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(orderId, jid, 'MULTI', 'DIVIDEND', 0, 0, totalDividends, Date.now())

    return {
        success: true,
        totalDividends,
        details,
        newBalance: user.coins
    }
}

module.exports = {
    STOCKS_CATALOG,
    getQuote,
    getAllQuotes,
    buyStock,
    sellStock,
    getPortfolio,
    claimDividends
}
