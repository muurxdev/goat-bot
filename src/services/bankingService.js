/**
 * bankingService.js
 * Sistema Bancário de Reino: Poupança, Renda Fixa (CDB), Score de Crédito e Empréstimos.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const CDB_PLANS = {
    'cdb1': { id: 'cdb1', name: 'CDB Diário Liquidez Rápida', durationDays: 1, yieldRate: 0.015, minAmount: 100 },
    'cdb3': { id: 'cdb3', name: 'CDB Reino Ouro 3 Dias', durationDays: 3, yieldRate: 0.05, minAmount: 500 },
    'cdb7': { id: 'cdb7', name: 'CDB Cavaleiros Sagrados 7 Dias', durationDays: 7, yieldRate: 0.14, minAmount: 2000 },
    'cdb30': { id: 'cdb30', name: 'CDB Tesouro Central 30 Dias', durationDays: 30, yieldRate: 0.75, minAmount: 10000 }
}

function getAccount(jid) {
    const db = getDatabase()
    let acc = db.prepare('SELECT * FROM bank_accounts WHERE jid = ?').get(jid)
    if (!acc) {
        const now = Date.now()
        db.prepare(`
            INSERT INTO bank_accounts (jid, savings_balance, last_savings_interest, credit_score, credit_limit, credit_used, loan_amount, loan_due, loan_installments, updated_at)
            VALUES (?, 0, ?, 600, 2000, 0, 0, 0, 0, ?)
        `).run(jid, now, now)
        acc = db.prepare('SELECT * FROM bank_accounts WHERE jid = ?').get(jid)
    }
    return acc
}

function depositSavings(jid, amount) {
    amount = Math.floor(Number(amount) || 0)
    if (amount <= 0) return { success: false, message: 'Valor de depósito inválido.' }

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < amount) {
        return { success: false, message: `Saldo em carteira insuficiente! Você possui *${(user.coins || 0).toLocaleString('pt-BR')} moedas*.` }
    }

    user.coins = (user.coins || 0) - amount
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    getAccount(jid) // garante existência
    db.prepare('UPDATE bank_accounts SET savings_balance = savings_balance + ?, updated_at = ? WHERE jid = ?')
        .run(amount, Date.now(), jid)

    const updated = getAccount(jid)
    return {
        success: true,
        deposited: amount,
        savingsBalance: updated.savings_balance,
        walletBalance: user.coins
    }
}

function withdrawSavings(jid, amount) {
    amount = Math.floor(Number(amount) || 0)
    if (amount <= 0) return { success: false, message: 'Valor de resgate inválido.' }

    const acc = getAccount(jid)
    if (acc.savings_balance < amount) {
        return { success: false, message: `Saldo insuficiente na poupança! Disponível: *${acc.savings_balance.toLocaleString('pt-BR')} moedas*.` }
    }

    const db = getDatabase()
    db.prepare('UPDATE bank_accounts SET savings_balance = savings_balance - ?, updated_at = ? WHERE jid = ?')
        .run(amount, Date.now(), jid)

    const user = economyService.carregarUsuario(jid)
    user.coins = (user.coins || 0) + amount
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const updated = getAccount(jid)
    return {
        success: true,
        withdrawn: amount,
        savingsBalance: updated.savings_balance,
        walletBalance: user.coins
    }
}

function investCDB(jid, planKey, amount) {
    const plan = CDB_PLANS[String(planKey).toLowerCase()]
    if (!plan) {
        return {
            success: false,
            message: `Plano CDB inválido. Opções: *${Object.keys(CDB_PLANS).join(', ')}*`
        }
    }

    amount = Math.floor(Number(amount) || 0)
    if (amount < plan.minAmount) {
        return {
            success: false,
            message: `Aporte mínimo para *${plan.name}* é de *${plan.minAmount.toLocaleString('pt-BR')} moedas*.`
        }
    }

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < amount) {
        return { success: false, message: `Saldo insuficiente na carteira para investir no CDB.` }
    }

    user.coins = (user.coins || 0) - amount
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const now = Date.now()
    const maturesAt = now + (plan.durationDays * 24 * 60 * 60 * 1000)
    const invId = `CDB-${now}-${Math.floor(Math.random() * 1000)}`

    const db = getDatabase()
    db.prepare(`
        INSERT INTO bank_investments (id, jid, type, amount, yield_rate, matures_at, created_at, claimed)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(invId, jid, plan.id, amount, plan.yieldRate, maturesAt, now)

    return {
        success: true,
        invId,
        plan,
        amount,
        maturesAt,
        estimatedTotal: Math.floor(amount * (1 + plan.yieldRate)),
        remainingWallet: user.coins
    }
}

function claimMaturedCDBs(jid) {
    const db = getDatabase()
    const now = Date.now()
    const matured = db.prepare('SELECT * FROM bank_investments WHERE jid = ? AND claimed = 0 AND matures_at <= ?').all(jid, now)

    if (!matured || matured.length === 0) {
        return { success: false, message: 'Nenhum CDB concluído para resgate no momento.' }
    }

    let totalRedeemed = 0
    let count = 0

    for (const inv of matured) {
        const totalYield = Math.floor(inv.amount * (1 + inv.yield_rate))
        totalRedeemed += totalYield
        count++
        db.prepare('UPDATE bank_investments SET claimed = 1 WHERE id = ?').run(inv.id)
    }

    const user = economyService.carregarUsuario(jid)
    user.coins = (user.coins || 0) + totalRedeemed
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    return {
        success: true,
        count,
        totalRedeemed,
        newBalance: user.coins
    }
}

function requestLoan(jid, amount, installments = 3) {
    amount = Math.floor(Number(amount) || 0)
    installments = Math.min(10, Math.max(1, Math.floor(Number(installments) || 3)))

    const acc = getAccount(jid)
    if (acc.loan_amount > 0) {
        return {
            success: false,
            message: `Você já possui um empréstimo em aberto no valor de *${acc.loan_amount.toLocaleString('pt-BR')} moedas*. Quite-o antes com \`.pagaremprestimo\`.`
        }
    }

    // Limite baseado no Score (Score de 600 = até 12.000 moedas, etc)
    const maxLoan = Math.floor((acc.credit_score / 100) * 2000)
    if (amount <= 0 || amount > maxLoan) {
        return {
            success: false,
            message: `Valor solicitado excede seu limite de crédito! Com base no seu Score (*${acc.credit_score} pts*), seu limite máximo é de *${maxLoan.toLocaleString('pt-BR')} moedas*.`
        }
    }

    // Juros inversamente proporcionais ao Score
    const interestRate = Math.max(0.05, 0.35 - (acc.credit_score / 3000))
    const totalDue = Math.floor(amount * (1 + interestRate))

    const db = getDatabase()
    db.prepare(`
        UPDATE bank_accounts
        SET loan_amount = ?, loan_due = ?, loan_installments = ?, updated_at = ?
        WHERE jid = ?
    `).run(totalDue, totalDue, installments, Date.now(), jid)

    const user = economyService.carregarUsuario(jid)
    user.coins = (user.coins || 0) + amount
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    return {
        success: true,
        granted: amount,
        totalDue,
        installments,
        installmentValue: Math.ceil(totalDue / installments),
        newBalance: user.coins
    }
}

function payLoan(jid, amount) {
    const acc = getAccount(jid)
    if (acc.loan_amount <= 0) {
        return { success: false, message: 'Parabéns! Você não possui nenhuma dívida ativa com o Banco de Reino.' }
    }

    amount = amount ? Math.floor(Number(amount)) : acc.loan_due
    amount = Math.min(amount, acc.loan_due)

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < amount) {
        return {
            success: false,
            message: `Saldo insuficiente para pagar *${amount.toLocaleString('pt-BR')} moedas*! Você possui *${(user.coins || 0).toLocaleString('pt-BR')}*.`
        }
    }

    user.coins = (user.coins || 0) - amount
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const newDue = acc.loan_due - amount
    const db = getDatabase()

    let scoreBonus = 0
    if (newDue <= 0) {
        // Quitou tudo: ganha +30 pontos de score
        scoreBonus = 30
        db.prepare(`
            UPDATE bank_accounts
            SET loan_amount = 0, loan_due = 0, loan_installments = 0,
                credit_score = MIN(1000, credit_score + ?), updated_at = ?
            WHERE jid = ?
        `).run(scoreBonus, Date.now(), jid)
    } else {
        db.prepare('UPDATE bank_accounts SET loan_due = ?, updated_at = ? WHERE jid = ?')
            .run(newDue, Date.now(), jid)
    }

    return {
        success: true,
        paid: amount,
        remainingDue: Math.max(0, newDue),
        cleared: newDue <= 0,
        scoreBonus,
        newBalance: user.coins
    }
}

module.exports = {
    CDB_PLANS,
    getAccount,
    depositSavings,
    withdrawSavings,
    investCDB,
    claimMaturedCDBs,
    requestLoan,
    payLoan
}
