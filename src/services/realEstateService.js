/**
 * realEstateService.js
 * Mercado Imobiliário do Reino de Reino.
 * Compra, locação, valorização, seguros, reforma e recolhimento de aluguéis passivos.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const PROPERTIES_CATALOG = {
    'kitnet': {
        id: 'kitnet',
        name: 'Kitnet no Beco dos Ladrões',
        type: 'Residencial Básico',
        desc: 'Espaço compacto ideal para iniciantes acumularem seus primeiros aluguéis.',
        price: 8000,
        rentPerDay: 400,
        renovationCost: 1500,
        insuranceCost: 500
    },
    'apartamento': {
        id: 'apartamento',
        name: 'Apartamento no Centro Central',
        type: 'Residencial Urbano',
        desc: 'Localizado próximo ao Palácio Real com alta procura de locação.',
        price: 25000,
        rentPerDay: 1350,
        renovationCost: 4500,
        insuranceCost: 1200
    },
    'sobrado': {
        id: 'sobrado',
        name: 'Sobrado Colonial Britânico',
        type: 'Residencial Nobre',
        desc: 'Construção charmosa com dois pavimentos e jardim murado.',
        price: 60000,
        rentPerDay: 3500,
        renovationCost: 9000,
        insuranceCost: 2800
    },
    'fazenda': {
        id: 'fazenda',
        name: 'Fazenda Imperial do Vale Verde',
        type: 'Rural Produtivo',
        desc: 'Extensão fértil com plantações de uva, gado e celeiros para exportação.',
        price: 150000,
        rentPerDay: 8500,
        renovationCost: 22000,
        insuranceCost: 6500
    },
    'mansao': {
        id: 'mansao',
        name: 'Mansão dos Cavaleiros Sagrados',
        type: 'Alto Padrão',
        desc: 'Residência luxuosa com piscina mágica, estábulos e segurança armada.',
        price: 350000,
        rentPerDay: 21000,
        renovationCost: 50000,
        insuranceCost: 15000
    },
    'cobertura': {
        id: 'cobertura',
        name: 'Cobertura Duplex Imperial',
        type: 'Luxo Real',
        desc: 'Vista panorâmica para todo o horizonte do Reino e heliponto de grifos.',
        price: 800000,
        rentPerDay: 52000,
        renovationCost: 120000,
        insuranceCost: 35000
    },
    'castelo': {
        id: 'castelo',
        name: 'Castelo Fortificado de Cidade Dourada',
        type: 'Monumento Histórico',
        desc: 'Fortaleza lendária impenetrável com muralhas arcanas e calabouços.',
        price: 2500000,
        rentPerDay: 175000,
        renovationCost: 350000,
        insuranceCost: 110000
    },
    'ilha': {
        id: 'ilha',
        name: 'Ilha Privada no Mar Ocidental',
        type: 'Soberania Territorial',
        desc: 'Território exclusivo cercado por águas cristalinas e recifes encantados.',
        price: 7500000,
        rentPerDay: 580000,
        renovationCost: 1000000,
        insuranceCost: 300000
    }
}

function getAllAvailableProperties() {
    return Object.values(PROPERTIES_CATALOG)
}

function getUserProperties(jid) {
    const db = getDatabase()
    return db.prepare('SELECT * FROM properties WHERE owner_jid = ? ORDER BY purchase_price DESC').all(jid)
}

function buyProperty(jid, propertyId) {
    const propKey = String(propertyId).toLowerCase().trim()
    const prop = PROPERTIES_CATALOG[propKey]
    if (!prop) {
        return {
            success: false,
            message: `Imóvel inválido. Opções: *${Object.keys(PROPERTIES_CATALOG).join(', ')}*`
        }
    }

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < prop.price) {
        return {
            success: false,
            message: `Saldo insuficiente para adquirir *${prop.name}*! Preço: *${prop.price.toLocaleString('pt-BR')} moedas*. Você possui *${(user.coins || 0).toLocaleString('pt-BR')}*.`
        }
    }

    // Debita moedas
    user.coins = (user.coins || 0) - prop.price
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    const dbId = `IMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    db.prepare(`
        INSERT INTO properties (id, owner_jid, property_id, name, type, purchase_price, rent_value, condition, last_rent_collected, insured, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 100, ?, 0, ?)
    `).run(dbId, jid, prop.id, prop.name, prop.type, prop.price, prop.rentPerDay, Date.now(), Date.now())

    return {
        success: true,
        dbId,
        property: prop,
        newBalance: user.coins
    }
}

function collectRent(jid) {
    const db = getDatabase()
    const properties = db.prepare('SELECT * FROM properties WHERE owner_jid = ?').all(jid)
    if (!properties || properties.length === 0) {
        return { success: false, message: 'Você não possui imóveis para recolher aluguel. Use `.comprarimovel`.' }
    }

    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    let totalRent = 0
    let collectedCount = 0

    for (const p of properties) {
        const lastCollect = p.last_rent_collected || p.created_at
        const elapsed = now - lastCollect
        if (elapsed >= (oneDayMs / 2)) { // Pode recolher a cada 12h proporcionalmente
            const daysFraction = Math.min(3, elapsed / oneDayMs) // até 3 dias acumulados
            const conditionMultiplier = Math.max(0.5, p.condition / 100)
            const rentEarned = Math.floor(p.rent_value * daysFraction * conditionMultiplier)

            if (rentEarned > 0) {
                totalRent += rentEarned
                collectedCount++
                // Desgaste natural do imóvel: 2% a cada ciclo de aluguel
                const newCondition = Math.max(20, p.condition - 2)
                db.prepare('UPDATE properties SET last_rent_collected = ?, condition = ? WHERE id = ?')
                    .run(now, newCondition, p.id)
            }
        }
    }

    if (totalRent <= 0) {
        return { success: false, message: 'Nenhum aluguel maduro para recolhimento ainda. O aluguel rende a cada 12 a 24 horas.' }
    }

    const user = economyService.carregarUsuario(jid)
    user.coins = (user.coins || 0) + totalRent
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    return {
        success: true,
        totalRent,
        collectedCount,
        newBalance: user.coins
    }
}

function renovateProperty(jid, propertyDbId) {
    const db = getDatabase()
    const prop = db.prepare('SELECT * FROM properties WHERE id = ? AND owner_jid = ?').get(propertyDbId, jid)
    if (!prop) return { success: false, message: 'Imóvel não encontrado na sua carteira imobiliária.' }

    if (prop.condition >= 100) {
        return { success: false, message: 'Este imóvel já está em perfeito estado (100% de conservação)!' }
    }

    const catalogItem = PROPERTIES_CATALOG[prop.property_id]
    const baseCost = catalogItem ? catalogItem.renovationCost : 5000
    const neededPercent = 100 - prop.condition
    const cost = Math.floor(baseCost * (neededPercent / 100))

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < cost) {
        return { success: false, message: `Custo da reforma: *${cost.toLocaleString('pt-BR')} moedas*. Saldo insuficiente.` }
    }

    user.coins = (user.coins || 0) - cost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    db.prepare('UPDATE properties SET condition = 100 WHERE id = ?').run(prop.id)

    return {
        success: true,
        cost,
        propertyName: prop.name,
        newBalance: user.coins
    }
}

module.exports = {
    PROPERTIES_CATALOG,
    getAllAvailableProperties,
    getUserProperties,
    buyProperty,
    collectRent,
    renovateProperty
}
