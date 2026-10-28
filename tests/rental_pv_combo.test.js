/**
 * Testes do Sistema de Aluguel:
 * - Divisão por Escopo (Grupo, PV, Combo)
 * - Resolução Inteligente de Alvos (Telefone sem DDI, Menção, JID, Nick)
 * - Modo Vitalício (Infinito)
 * - Modo Teste Gratuito (Trial) com Proteção Anti-Abuso
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const rentalService = require('../src/services/rentalService')
const rentalRepo = require('../src/database/repositories/rentalRepository')
const userRepo = require('../src/database/repositories/userRepository')
const { getDatabase } = require('../src/database/connection')

let pass = 0
let fail = 0

async function test(name, fn) {
    try {
        await fn()
        pass++
        console.log(`  ✅ PASS: ${name}`)
    } catch (e) {
        fail++
        console.log(`  ❌ FAIL: ${name}`)
        console.log(`      ${e.stack || e.message}`)
    }
}

async function run() {
    console.log('\n--- 1. Resolução Inteligente de Alvos (resolveRentalTarget) ---')

    await test('Resolve número brasileiro sem 55 para JID canônico', async () => {
        const res = await rentalService.resolveRentalTarget('11987654321')
        assert.ok(res, 'Deveria ter resolvido o número')
        assert.strictEqual(res.jid, '5511987654321@s.whatsapp.net')
        assert.strictEqual(res.type, 'pv')
    })

    await test('Resolve número com DDI 55 e formatação', async () => {
        const res = await rentalService.resolveRentalTarget('+55 (21) 98765-4321')
        assert.ok(res)
        assert.strictEqual(res.jid, '5521987654321@s.whatsapp.net')
        assert.strictEqual(res.type, 'pv')
    })

    await test('Resolve menção de usuário (@5511...)', async () => {
        const res = await rentalService.resolveRentalTarget('@5511911112222')
        assert.ok(res)
        assert.strictEqual(res.jid, '5511911112222@s.whatsapp.net')
    })

    await test('Resolve JID direto de grupo (@g.us)', async () => {
        const res = await rentalService.resolveRentalTarget('120363999999999999@g.us')
        assert.ok(res)
        assert.strictEqual(res.jid, '120363999999999999@g.us')
        assert.strictEqual(res.type, 'group')
    })

    await test('Resolve usuário pelo display_nick cadastrado no banco', async () => {
        const db = getDatabase()
        const fakeJid = '5511944445555@s.whatsapp.net'
        db.prepare('DELETE FROM users WHERE jid = ?').run(fakeJid)
        userRepo.saveUser({
            jid: fakeJid,
            name: 'Manoel Silva',
            displayNick: 'Dragão Místico',
            registered: 1
        })

        const res = await rentalService.resolveRentalTarget('dragão místico')
        assert.ok(res, 'Deveria encontrar pelo nick')
        assert.strictEqual(res.jid, fakeJid)
        assert.strictEqual(res.name, 'Dragão Místico')
    })

    console.log('\n--- 2. Aluguel de Grupo vs Aluguel de PV vs Combo ---')

    const testGroup = '120363111222333444@g.us'
    const testUser = '5511977778888@s.whatsapp.net'

    await test('Aluguel de grupo não libera PV e vice-versa', async () => {
        rentalRepo.deleteRental(testGroup)
        rentalRepo.deleteRental(testUser)

        rentalService.setRental({
            targetJid: testGroup,
            targetType: 'group',
            durationStr: '7d',
            rentedBy: 'DonoTeste'
        })

        const groupCheck = rentalService.hasActiveRental(testGroup, 'group')
        assert.ok(groupCheck.active, 'Grupo deveria estar ativo')

        const pvCheck = rentalService.hasActiveRental(testUser, 'pv')
        assert.ok(!pvCheck.active, 'Usuário não deveria estar ativo no PV ainda')
    })

    await test('Ativação de aluguel no PV libera o usuário', async () => {
        rentalService.setRental({
            targetJid: testUser,
            targetType: 'pv',
            durationStr: '15d',
            rentedBy: 'DonoTeste'
        })

        const pvCheck = rentalService.hasActiveRental(testUser, 'pv')
        assert.ok(pvCheck.active, 'PV deveria estar ativo')
        assert.strictEqual(pvCheck.targetType, 'pv')
        assert.ok(!pvCheck.isLifetime)
    })

    console.log('\n--- 3. Modo Vitalício (Infinito) ---')

    await test('Concede acesso vitalício com tempo infinito', async () => {
        const vitalicioUser = '5511999990000@s.whatsapp.net'
        rentalRepo.deleteRental(vitalicioUser)

        rentalService.setLifetimeRental({
            targetJid: vitalicioUser,
            targetType: 'pv',
            targetName: 'Amigo Dono',
            grantedBy: 'Dono'
        })

        const check = rentalService.hasActiveRental(vitalicioUser, 'pv')
        assert.ok(check.active, 'Deveria estar ativo')
        assert.ok(check.isLifetime, 'Deveria ser vitalício')
        assert.strictEqual(check.remainingMs, Infinity)

        const info = rentalService.getRentalInfo(vitalicioUser)
        assert.ok(info.isLifetime)
        assert.ok(info.remainingText.includes('VITALÍCIO'))
    })

    console.log('\n--- 4. Modo Teste Gratuito (Trial) com Proteção Anti-Abuso ---')

    await test('Ativa teste de 2h na primeira tentativa', async () => {
        const trialUser = '5511988880000@s.whatsapp.net'
        rentalRepo.deleteRental(trialUser)
        const db = getDatabase()
        db.prepare('DELETE FROM rental_trials WHERE target_jid = ?').run(trialUser)

        const trial = rentalService.activateTrial({
            targetJid: trialUser,
            targetType: 'pv',
            targetName: 'Testador',
            durationStr: '2h',
            requestedBy: trialUser
        })

        assert.ok(trial, 'Deveria gerar aluguel trial')
        assert.ok(trial.isTrial, 'isTrial deveria ser true')

        const check = rentalService.hasActiveRental(trialUser, 'pv')
        assert.ok(check.active, 'Usuário deveria estar com acesso ativo')
        assert.ok(check.isTrial, 'Deveria marcar isTrial')
    })

    await test('REJEITA ativação de teste repetido (anti-abuso)', async () => {
        const trialUser = '5511988880000@s.whatsapp.net'

        assert.throws(() => {
            rentalService.activateTrial({
                targetJid: trialUser,
                targetType: 'pv',
                durationStr: '2h'
            })
        }, /já utilizou o período de teste/i)
    })

    console.log('\n--- 5. Alternar Modo Aluguel (Global, Grupo, PV) ---')

    await test('Controla flags de modo aluguel por escopo', async () => {
        await rentalService.setRentalMode(true, 'pv')
        assert.strictEqual(rentalService.isRentalModeEnabled('qualquer', false), true)

        await rentalService.setRentalMode(false, 'pv')
        assert.strictEqual(rentalService.isRentalModeEnabled('qualquer', false), false)

        await rentalService.setRentalMode(true, 'pv')
        assert.strictEqual(rentalService.isRentalModeEnabled('qualquer', false), true)
    })

    console.log('\n========================================')
    console.log(`📊 RESULTADO ALUGUEL GRUPO / PV / COMBO:`)
    console.log(`   ✅ Passaram: ${pass}`)
    console.log(`   ❌ Falharam: ${fail}`)
    console.log('========================================\n')

    if (fail > 0) process.exit(1)
}

run().catch(e => {
    console.error('Erro na execução da suíte:', e)
    process.exit(1)
})
