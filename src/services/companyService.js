/**
 * companyService.js
 * Sistema Empresarial & Corporativo (Magnata do Reino de Reino).
 * Gerenciamento de empresas, contratação de funcionários, marketing, evolução de nível,
 * acumulação de receita por hora e recolhimento de lucros corporativos.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const COMPANY_TYPES = {
    'taberna': {
        name: 'Taberna e Estalagem',
        desc: 'Negócio tradicional com venda de hidromel e refeições aos aventureiros.',
        cost: 5000,
        baseIncomePerHour: 250,
        empSalaryPerHour: 20,
        maxEmployees: 10
    },
    'padaria': {
        name: 'Padaria & Confeitaria Real',
        desc: 'Produção diária de pães sagrados e doces para a nobreza Central.',
        cost: 3000,
        baseIncomePerHour: 180,
        empSalaryPerHour: 15,
        maxEmployees: 8
    },
    'forja': {
        name: 'Forja de Armas e Armaduras',
        desc: 'Fornece espadas de aço reforçado aos Cavaleiros Sagrados.',
        cost: 15000,
        baseIncomePerHour: 600,
        empSalaryPerHour: 45,
        maxEmployees: 15
    },
    'mineradora': {
        name: 'Mineradora de Cristais e Metais',
        desc: 'Extração pesada de ferro, prata e gemas arcanas.',
        cost: 40000,
        baseIncomePerHour: 1500,
        empSalaryPerHour: 90,
        maxEmployees: 30
    },
    'transportadora': {
        name: 'Frota de Carruagens e Carga',
        desc: 'Logística de suprimentos em todas as rotas do Reino.',
        cost: 25000,
        baseIncomePerHour: 950,
        empSalaryPerHour: 60,
        maxEmployees: 20
    },
    'laboratorio': {
        name: 'Laboratório de Alquimia Arcana',
        desc: 'Pesquisa e produção de elixires de cura e amplificadores de mana.',
        cost: 80000,
        baseIncomePerHour: 3200,
        empSalaryPerHour: 160,
        maxEmployees: 40
    },
    'estudio': {
        name: 'Estúdio de Entretenimento & Jogos',
        desc: 'Criação de jogos de tabuleiro, cartas e festivais culturais.',
        cost: 60000,
        baseIncomePerHour: 2400,
        empSalaryPerHour: 130,
        maxEmployees: 25
    },
    'banco': {
        name: 'Casa Bancária & Crédito Nobre',
        desc: 'Instituição financeira privada com custódia de moedas e juros.',
        cost: 250000,
        baseIncomePerHour: 9500,
        empSalaryPerHour: 350,
        maxEmployees: 60
    }
}

/**
 * Retorna os dados da empresa de um usuário
 */
function getCompany(jid) {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM companies WHERE owner_jid = ?').get(jid)
    if (!row) return null

    const typeConfig = COMPANY_TYPES[row.type] || COMPANY_TYPES['taberna']
    
    // Cálculo do lucro pendente acumulado
    const now = Date.now()
    const lastCollect = row.last_collection || row.created_at
    const elapsedHours = Math.min(48, Math.max(0, (now - lastCollect) / (1000 * 60 * 60))) // teto de 48h de acúmulo

    // Receita por hora calculada com bônus de nível, funcionários e marketing
    const levelMult = 1 + (row.level - 1) * 0.35
    const marketingMult = 1 + (row.marketing - 1) * 0.20
    const empProduction = row.employees * (typeConfig.baseIncomePerHour * 0.45)
    
    const grossIncomePerHour = Math.floor((typeConfig.baseIncomePerHour + empProduction) * levelMult * marketingMult)
    const empCostPerHour = row.employees * typeConfig.empSalaryPerHour
    const netIncomePerHour = Math.max(10, grossIncomePerHour - empCostPerHour)
    
    const pendingProfit = Math.floor(netIncomePerHour * elapsedHours)

    return {
        ...row,
        config: typeConfig,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        grossIncomePerHour,
        empCostPerHour,
        netIncomePerHour,
        pendingProfit
    }
}

/**
 * Cria/funda uma nova empresa
 */
function createCompany(jid, name, typeKey) {
    const type = String(typeKey).toLowerCase().trim()
    const config = COMPANY_TYPES[type]
    if (!config) {
        return {
            success: false,
            message: `Tipo de empresa desconhecido. Tipos disponíveis: *${Object.keys(COMPANY_TYPES).join(', ')}*`
        }
    }

    const cleanName = String(name || '').trim().replace(/[*_~`]/g, '')
    if (!cleanName || cleanName.length < 3 || cleanName.length > 40) {
        return { success: false, message: 'O nome da empresa deve ter entre 3 e 40 caracteres.' }
    }

    const existing = getCompany(jid)
    if (existing) {
        return { success: false, message: `Você já é proprietário da empresa *${existing.name}*. Venda-a antes de fundar outra.` }
    }

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < config.cost) {
        return {
            success: false,
            message: `Capital insuficiente para fundar *${config.name}*! Custo: *${config.cost.toLocaleString('pt-BR')} moedas*. Você possui *${(user.coins || 0).toLocaleString('pt-BR')}*.`
        }
    }

    // Debita moedas
    user.coins = (user.coins || 0) - config.cost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const companyId = `EMP-${Date.now()}`
    const db = getDatabase()
    db.prepare(`
        INSERT INTO companies (id, owner_jid, name, type, level, employees, marketing, vault, last_collection, created_at)
        VALUES (?, ?, ?, ?, 1, 1, 1, 0, ?, ?)
    `).run(companyId, jid, cleanName, type, Date.now(), Date.now())

    return {
        success: true,
        companyId,
        name: cleanName,
        type: config.name,
        cost: config.cost,
        remainingCoins: user.coins
    }
}

/**
 * Coleta os lucros acumulados da empresa
 */
function collectRevenue(jid) {
    const comp = getCompany(jid)
    if (!comp) return { success: false, message: 'Você ainda não possui uma empresa. Use \`.fundarempresa\`.' }

    if (comp.pendingProfit <= 0) {
        return { success: false, message: 'Nenhum lucro disponível para coleta no momento. Aguarde seu negócio produzir!' }
    }

    const profit = comp.pendingProfit
    const db = getDatabase()
    db.prepare('UPDATE companies SET last_collection = ?, vault = vault + ? WHERE id = ?')
        .run(Date.now(), 0, comp.id)

    const user = economyService.carregarUsuario(jid)
    user.coins = (user.coins || 0) + profit
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    return {
        success: true,
        profit,
        elapsedHours: comp.elapsedHours,
        newBalance: user.coins,
        companyName: comp.name
    }
}

/**
 * Contrata novos funcionários
 */
function hireEmployees(jid, count = 1) {
    const comp = getCompany(jid)
    if (!comp) return { success: false, message: 'Você ainda não possui uma empresa.' }

    count = Math.floor(Number(count) || 1)
    if (count <= 0) return { success: false, message: 'Quantidade inválida de funcionários.' }

    const maxEmp = comp.config.maxEmployees * comp.level
    if (comp.employees + count > maxEmp) {
        return {
            success: false,
            message: `Limite de capacidade atingido! Seu limite atual é de *${maxEmp} funcionários*. Suba o nível da empresa com \`.upgradeempresa\` para expandir.`
        }
    }

    const hiringCostPerEmp = Math.floor(comp.config.cost * 0.08)
    const totalCost = hiringCostPerEmp * count

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < totalCost) {
        return {
            success: false,
            message: `Custo de contratação: *${totalCost.toLocaleString('pt-BR')} moedas*. Saldo insuficiente.`
        }
    }

    user.coins = (user.coins || 0) - totalCost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    db.prepare('UPDATE companies SET employees = employees + ? WHERE id = ?').run(count, comp.id)

    return {
        success: true,
        hired: count,
        totalEmployees: comp.employees + count,
        totalCost,
        remainingCoins: user.coins
    }
}

/**
 * Evolui o nível da empresa
 */
function upgradeCompany(jid) {
    const comp = getCompany(jid)
    if (!comp) return { success: false, message: 'Você ainda não possui uma empresa.' }

    if (comp.level >= 10) {
        return { success: false, message: 'Sua empresa já atingiu o nível máximo (Nível 10 - Conglomerado Real)!' }
    }

    const upgradeCost = Math.floor(comp.config.cost * (comp.level * 1.5))
    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < upgradeCost) {
        return {
            success: false,
            message: `Custo de modernização: *${upgradeCost.toLocaleString('pt-BR')} moedas*. Você possui *${(user.coins || 0).toLocaleString('pt-BR')}*.`
        }
    }

    user.coins = (user.coins || 0) - upgradeCost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    db.prepare('UPDATE companies SET level = level + 1 WHERE id = ?').run(comp.id)

    return {
        success: true,
        newLevel: comp.level + 1,
        upgradeCost,
        remainingCoins: user.coins,
        companyName: comp.name
    }
}

/**
 * Campanhas de Marketing
 */
function upgradeMarketing(jid) {
    const comp = getCompany(jid)
    if (!comp) return { success: false, message: 'Você ainda não possui uma empresa.' }

    if (comp.marketing >= 5) {
        return { success: false, message: 'Sua marca já possui notoriedade máxima em todo o continente (Marketing Nível 5)!' }
    }

    const marketingCost = Math.floor(comp.config.cost * comp.marketing * 0.75)
    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < marketingCost) {
        return {
            success: false,
            message: `Custo da campanha publicitária: *${marketingCost.toLocaleString('pt-BR')} moedas*. Saldo insuficiente.`
        }
    }

    user.coins = (user.coins || 0) - marketingCost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    db.prepare('UPDATE companies SET marketing = marketing + 1 WHERE id = ?').run(comp.id)

    return {
        success: true,
        newMarketing: comp.marketing + 1,
        cost: marketingCost,
        remainingCoins: user.coins
    }
}

/**
 * Ranking das maiores corporações
 */
function getLeaderboard(limit = 10) {
    const db = getDatabase()
    return db.prepare('SELECT * FROM companies ORDER BY level DESC, employees DESC LIMIT ?').all(limit)
}

module.exports = {
    COMPANY_TYPES,
    getCompany,
    createCompany,
    collectRevenue,
    hireEmployees,
    upgradeCompany,
    upgradeMarketing,
    getLeaderboard
}
