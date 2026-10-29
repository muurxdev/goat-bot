process.env.NODE_ENV = 'test'

/**
 * Regressão das correções de regra de 2026-09-17: aluguel (teste grátis,
 * reativar), backup/restore, horários do bot (fuso, .botopen HH:MM, selfHeal),
 * assinar, aluguel setpreco, trust, setmenuname, bancmd, setwallpaper, auto off,
 * advertências e .cancel.
 *
 * Usa só o banco de teste (NODE_ENV=test) e uma pasta de backups temporária.
 */

const assert = require('assert')
const { temTexto } = require('./helpers/moldura')
const fs = require('fs')
const os = require('os')
const path = require('path')

const pastaBackups = fs.mkdtempSync(path.join(os.tmpdir(), 'goat-backups-'))
process.env.BACKUP_DIR = pastaBackups

const { getDatabase, getDatabasePath } = require('../src/database/connection')

let pass = 0
let fail = 0
async function test(nome, fn) {
    try {
        await fn()
        pass++
        console.log(`  ✅ PASS: ${nome}`)
    } catch (e) {
        fail++
        console.log(`  ❌ FAIL: ${nome}`)
        console.log(`      ${e.stack || e.message}`)
    }
}

function capturar() {
    const msgs = []
    const reply = async (msg) => { msgs.push(typeof msg === 'string' ? msg : JSON.stringify(msg)); return msg }
    return { msgs, reply }
}

async function run() {
    const db = getDatabase()
    assert.ok(/database\.test\.sqlite$/.test(getDatabasePath()), 'os testes precisam do banco de teste')

    // ── Assinar primeiro: troca notifyDonos antes de o comando ser carregado ──
    console.log('\n--- 9. assinar: falha no aviso aos donos não vira erro do link ---')
    const ownerService = require('../src/services/ownerService')
    // Pagamento desde 2026-10-25 (commit 1f55efe4) é PIX do Mercado Pago, não Stripe.
    const mercadoPago = require('../src/services/payments/mercadoPagoService')
    const notifyOriginal = ownerService.notifyDonos
    const mpOriginal = { criarPixPayment: mercadoPago.criarPixPayment, modo: mercadoPago.modo }
    ownerService.notifyDonos = async () => { throw new Error('whatsapp caiu') }
    mercadoPago.modo = () => 'teste'
    mercadoPago.criarPixPayment = async () => ({ id: 'pix_teste_1', qrCodeBuffer: null, copiaCola: '00020126pix-copia-cola-teste', expiresAt: Date.now() + 30 * 60000 })
    const assinar = require('../src/commands/owner/assinar')
    ownerService.notifyDonos = notifyOriginal

    await test('PIX enviado e aviso aos donos falhando: nada de "Não consegui gerar o PIX"', async () => {
        const rentalPackages = require('../src/services/payments/rentalPackagesService')
        const plano = rentalPackages.getPacotes()[0]
        const { msgs, reply } = capturar()
        const client = { sendMessage: async (_jid, payload) => { msgs.push(payload.text || payload.caption || ''); return {} } }
        await assinar.execute({ sender: '5511970000001@s.whatsapp.net', from: '5511970000001@s.whatsapp.net', isGroup: false, args: [plano.id], reply, client, info: {}, prefix: '.' })
        assert.ok(msgs.some(m => m.includes('00020126pix-copia-cola-teste')), 'o copia e cola deveria ter sido enviado')
        assert.ok(!msgs.some(m => temTexto(m, 'Não consegui gerar o PIX')), 'falha no aviso não pode aparecer como falha do PIX')
    })
    Object.assign(mercadoPago, mpOriginal)

    const dispatcher = require('../src/handlers/commandDispatcher')
    dispatcher.loadCommands()

    // ── 1. Teste grátis não sobrescreve aluguel pago ──
    console.log('\n--- 1. Teste grátis com aluguel ativo ---')
    const rentalService = require('../src/services/rentalService')
    const rentalRepo = require('../src/database/repositories/rentalRepository')

    await test('recusa teste quando já há aluguel pago e não gasta o teste', async () => {
        const grupo = '120363777000000001@g.us'
        rentalRepo.deleteRental(grupo)
        db.prepare('DELETE FROM rental_trials WHERE target_jid = ?').run(grupo)
        rentalService.setRental({ targetJid: grupo, durationStr: '45d', rentedBy: 'teste' })
        const antes = rentalRepo.getRental(grupo).expiresAt

        assert.throws(() => rentalService.activateTrial({ targetJid: grupo, durationStr: '2h' }), /já possui aluguel ativo/)
        assert.strictEqual(rentalRepo.getRental(grupo).expiresAt, antes, 'o prazo de 45 dias não pode mudar')
        assert.strictEqual(rentalRepo.hasUsedTrial(grupo), false, 'o teste não pode ser marcado como usado')
    })

    await test('tela de aluguel teste explica que já está ativo', async () => {
        const grupo = '120363777000000001@g.us'
        const aluguel = require('../src/commands/owner/aluguel')
        const { msgs, reply } = capturar()
        await aluguel.execute({ from: grupo, isGroup: true, sender: '5511970000002@s.whatsapp.net', args: ['teste'], reply, client: null, info: {}, isOwner: false, prefix: '.' })
        assert.ok(temTexto(msgs[0], 'Aluguel já ativo'), msgs[0])
        rentalRepo.deleteRental(grupo)
    })

    // ── 2. Reativar ──
    console.log('\n--- 2. Reativar: reversão real, combo e vitalício ---')
    await test('snapshotRental/restoreRental desfazem a extensão (e apagam se não existia)', async () => {
        const pv = '5511970000003@s.whatsapp.net'
        rentalRepo.deleteRental(pv)
        const vazio = rentalService.snapshotRental(pv)
        assert.strictEqual(vazio, null)
        rentalService.addRentalTime(pv, '30d', 'teste', 'pv')
        assert.ok(rentalRepo.getRental(pv))
        rentalService.restoreRental(pv, vazio)
        assert.strictEqual(rentalRepo.getRental(pv), null, 'sem aluguel antes, a reversão apaga')

        rentalService.setRental({ targetJid: pv, durationStr: '5d', rentedBy: 'teste' })
        const foto = rentalService.snapshotRental(pv)
        rentalService.addRentalTime(pv, '30d', 'teste', 'pv')
        assert.ok(rentalRepo.getRental(pv).expiresAt > foto.expiresAt)
        rentalService.restoreRental(pv, foto)
        assert.strictEqual(rentalRepo.getRental(pv).expiresAt, foto.expiresAt, 'volta ao vencimento anterior')
        rentalRepo.deleteRental(pv)
    })

    const creditos = require('../src/services/payments/creditsService')
    const reativar = require('../src/commands/owner/reativar')

    await test('combo fora de grupo é recusado sem gastar créditos', async () => {
        const pv = '5511970000004@s.whatsapp.net'
        const saldoAntes = creditos.saldo(pv)
        const { msgs, reply } = capturar()
        await reativar.execute({ sender: pv, from: pv, isGroup: false, args: ['combo', '3'], reply, prefix: '.' })
        assert.ok(temTexto(msgs[0], 'Combo só dentro do grupo'), msgs[0])
        assert.strictEqual(creditos.saldo(pv), saldoAntes)
    })

    await test('alvo vitalício é recusado antes de gastar créditos', async () => {
        const pv = '5511970000005@s.whatsapp.net'
        rentalService.setLifetimeRental({ targetJid: pv, targetType: 'pv', grantedBy: 'teste' })
        const saldoAntes = creditos.saldo(pv)
        const { msgs, reply } = capturar()
        await reativar.execute({ sender: pv, from: pv, isGroup: false, args: ['pv', '3'], reply, prefix: '.' })
        assert.ok(temTexto(msgs[0], 'já é vitalício'), msgs[0])
        assert.strictEqual(creditos.saldo(pv), saldoAntes)
        rentalRepo.deleteRental(pv)
    })

    // ── 4. Backup ──
    console.log('\n--- 4. Restore: só arquivo da pasta de backups, e volta atrás se falhar ---')
    const backupService = require('../src/services/backupService')

    await test('pasta de backups dos testes não é a de produção', async () => {
        assert.strictEqual(backupService.BACKUP_DIR, path.resolve(pastaBackups))
    })

    await test('restore recusa ../ e caminhos absolutos', async () => {
        for (const nome of ['../data/database.sqlite', '/etc/passwd', '..', 'sub/x.sqlite', 'nao_existe.sqlite']) {
            assert.throws(() => backupService.restoreBackup(nome), /não encontrado/, nome)
        }
    })

    await test('falha na cópia recoloca o banco original e o deixa aberto', async () => {
        db.exec("CREATE TABLE IF NOT EXISTS __restore_probe (v TEXT)")
        getDatabase().prepare("DELETE FROM __restore_probe").run()
        const meta = backupService.createBackup(5)
        getDatabase().prepare("INSERT INTO __restore_probe (v) VALUES ('depois-do-backup')").run()

        const copiaOriginal = fs.copyFileSync
        fs.copyFileSync = (origem, destino, ...resto) => {
            if (String(origem).endsWith(meta.filename)) {
                copiaOriginal(origem, destino, ...resto)
                fs.writeFileSync(destino, 'lixo de cópia interrompida')
                throw new Error('disco cheio')
            }
            return copiaOriginal(origem, destino, ...resto)
        }
        try {
            assert.throws(() => backupService.restoreBackup(meta.filename), /disco cheio/)
        } finally {
            fs.copyFileSync = copiaOriginal
        }

        const row = getDatabase().prepare("SELECT v FROM __restore_probe").get()
        assert.strictEqual(row && row.v, 'depois-do-backup', 'o banco deveria ter voltado ao estado anterior e estar aberto')
        getDatabase().exec("DROP TABLE __restore_probe")
    })

    // ── 5/6. Horários ──
    console.log('\n--- 5/6. .botopen HH:MM e fuso ---')
    const botScheduler = require('../src/services/botScheduler')
    const scheduleRepo = require('../src/database/repositories/scheduleRepository')
    const botopen = require('../src/commands/owner/botopen')

    await test('parseTimeToTimestamp usa o fuso configurado', async () => {
        if (botScheduler.timezone !== 'America/Sao_Paulo') {
            console.log(`      (fuso ${botScheduler.timezone}: conferência com horário de Brasília pulada)`)
            return
        }
        const base = Date.UTC(2026, 8, 17, 12, 0) // 09:00 em Brasília
        assert.strictEqual(botScheduler.parseTimeToTimestamp('07:00', base), Date.UTC(2026, 8, 18, 10, 0))
        assert.strictEqual(botScheduler.parseTimeToTimestamp('23:00', base), Date.UTC(2026, 8, 18, 2, 0))
        assert.strictEqual(botScheduler.parseTimeToTimestamp('10:30', base), Date.UTC(2026, 8, 17, 13, 30))
        assert.strictEqual(botScheduler.formatarHora(Date.UTC(2026, 8, 18, 10, 0)), '07:00')
    })

    await test('.botopen 07:00 com o bot fechado reabre às 7h, no máximo em 24h', async () => {
        botScheduler.scheduleCloseIndefinite('teste')
        const { msgs, reply } = capturar()
        await botopen.execute({ sender: '5511970000006@s.whatsapp.net', args: ['07:00'], reply, prefix: '.' })
        const ativo = scheduleRepo.getActiveSchedules()[0]
        assert.ok(ativo && ativo.reopen_at > Date.now() && ativo.reopen_at <= Date.now() + 24 * 3600000, 'reabertura em até 24h')
        assert.strictEqual(botScheduler.formatarHora(ativo.reopen_at), '07:00')
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.OFFLINE, 'continua fechado até lá')
        assert.ok(temTexto(msgs[0], '07:00'), msgs[0])
    })

    await test('.botopen 99:00 recusa e não reabre', async () => {
        const { msgs, reply } = capturar()
        await botopen.execute({ sender: '5511970000006@s.whatsapp.net', args: ['99:00'], reply, prefix: '.' })
        assert.ok(temTexto(msgs[0], 'Não entendi esse horário'), msgs[0])
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.OFFLINE)
        botScheduler.openImmediately('teste')
    })

    await test('.botopen 07:00 com fechamento marcado mantém o fechamento', async () => {
        const r = botScheduler.scheduleCloseAtTime('23:00', null, 'teste')
        const { reply } = capturar()
        await botopen.execute({ sender: '5511970000006@s.whatsapp.net', args: ['07:00'], reply, prefix: '.' })
        const ativo = scheduleRepo.getActiveSchedules()[0]
        assert.strictEqual(ativo.status, 'PENDING')
        assert.strictEqual(ativo.execute_at, r.closeTimestamp)
        assert.ok(ativo.reopen_at > ativo.execute_at)
        assert.strictEqual(botScheduler.formatarHora(ativo.reopen_at), '07:00')
        botScheduler.openImmediately('teste')
    })

    await test('.botopen 07:00 com o bot aberto e nada marcado avisa que já está aberto', async () => {
        const { msgs, reply } = capturar()
        await botopen.execute({ sender: '5511970000006@s.whatsapp.net', args: ['07:00'], reply, prefix: '.' })
        assert.ok(temTexto(msgs[0], 'Já estou aberto'), msgs[0])
        assert.strictEqual(scheduleRepo.getActiveSchedules().length, 0)
    })

    // ── 7. selfHeal ──
    console.log('\n--- 7. selfHeal destrava agendamento preso ---')
    await test('EXECUTING com reabertura vencida vira COMPLETED e o bot volta a ONLINE', async () => {
        const { destravarAgendamentos } = require('../src/services/selfHealService')
        scheduleRepo.cancelPendingSchedules()
        scheduleRepo.createSchedule({ id: 'sched_preso_teste', action: 'CLOSE', executeAt: Date.now() - 7200000, reopenAt: Date.now() - 3600000, mode: 'DURATION', status: 'EXECUTING', createdBy: 'teste' })
        botScheduler.setBotState(botScheduler.BOT_STATES.OFFLINE)
        assert.strictEqual(destravarAgendamentos(), 1)
        assert.strictEqual(scheduleRepo.getSchedule('sched_preso_teste').status, 'COMPLETED')
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.ONLINE)
    })

    // ── 10. aluguel setpreco ──
    console.log('\n--- 10. aluguel setpreco com valor inválido ---')
    await test('valor inválido gera uma única mensagem, sem "Atualizando"', async () => {
        const aluguel = require('../src/commands/owner/aluguel')
        const plano = require('../src/services/payments/rentalPackagesService').getPacotes()[0]
        const { msgs, reply } = capturar()
        await aluguel.execute({ from: '5511970000007@s.whatsapp.net', isGroup: false, sender: '5511970000007@s.whatsapp.net', args: ['setpreco', plano.id, 'abc'], reply, client: null, info: {}, isOwner: true, prefix: '.' })
        assert.strictEqual(msgs.length, 1, msgs.join('\n---\n'))
        assert.ok(temTexto(msgs[0], 'Valor inválido'), msgs[0])
    })

    // ── 11. trust ──
    console.log('\n--- 11. untrust com número digitado ---')
    await test('.untrust 5511... (qualquer prefixo) remove a pessoa', async () => {
        const trust = require('../src/commands/owner/trust')
        const permissionRepo = require('../src/database/repositories/permissionRepository')
        const alvo = '5511970000008@s.whatsapp.net'
        permissionRepo.setTrusted(alvo, true, 'teste', 'nota')
        assert.strictEqual(permissionRepo.isTrusted(alvo), true)
        const { msgs, reply } = capturar()
        await trust.execute({ sender: '5511970000009@s.whatsapp.net', args: ['5511970000008'], commandName: 'untrust', reply, info: { body: '!untrust 5511970000008' }, prefix: '!' })
        assert.strictEqual(permissionRepo.isTrusted(alvo), false)
        assert.ok(temTexto(msgs[0], 'Saiu da lista de confiança'), msgs[0])
    })

    // ── 12. setmenuname ──
    console.log('\n--- 12. setmenuname reset traduz a categoria ---')
    await test('reset economia apaga a chave economy', async () => {
        const setmenuname = require('../src/commands/owner/setmenuname')
        const dataService = require('../src/services/dataService')
        const { reply } = capturar()
        await setmenuname.execute({ reply, args: ['economia', 'Cofre', 'Real'], isOwner: true, prefix: '.' })
        assert.strictEqual(dataService.getConfigsData().global.customMenuNames.economy, 'Cofre Real')
        await setmenuname.execute({ reply, args: ['reset', 'economia'], isOwner: true, prefix: '.' })
        assert.strictEqual(dataService.getConfigsData().global.customMenuNames.economy, undefined)
    })

    // ── 13. bancmd ──
    console.log('\n--- 13. bancmd valida o nome ---')
    const bancmd = require('../src/commands/owner/bancmd')
    const dataService = require('../src/services/dataService')
    await test('nome inexistente é recusado e nada é gravado', async () => {
        const { msgs, reply } = capturar()
        await bancmd.execute({ sender: '5511970000010@s.whatsapp.net', reply, args: ['comandoquenaoexiste123'], isOwner: true, commandName: 'bancmd', prefix: '.' })
        assert.ok(temTexto(msgs[0], 'Não conheço esse comando'), msgs[0])
        assert.strictEqual((dataService.getConfigsData().global.bannedCommands || {}).comandoquenaoexiste123, undefined)
    })

    await test('apelido é guardado pelo nome principal', async () => {
        const cmdQueue = dispatcher.findCommand('fila')
        assert.ok(cmdQueue, 'alias fila deveria existir')
        const { reply } = capturar()
        await bancmd.execute({ sender: '5511970000010@s.whatsapp.net', reply, args: ['fila', 'manutenção'], isOwner: true, commandName: 'bancmd', prefix: '.' })
        const banidos = dataService.getConfigsData().global.bannedCommands
        assert.ok(banidos[cmdQueue.name], 'deveria gravar pelo nome principal')
        assert.strictEqual(banidos.fila, undefined)
        await bancmd.execute({ sender: '5511970000010@s.whatsapp.net', reply, args: ['fila'], isOwner: true, commandName: 'unbancmd', prefix: '.' })
        assert.strictEqual(dataService.getConfigsData().global.bannedCommands[cmdQueue.name], undefined)
    })

    // ── 14. setwallpaper ──
    console.log('\n--- 14. setwallpaper valida o menu ---')
    await test('reset e preview de menu inexistente mostram a lista', async () => {
        const setwallpaper = require('../src/commands/owner/setwallpaper')
        for (const args of [['reset', 'menuquenaoexiste'], ['preview', 'menuquenaoexiste'], ['menuquenaoexiste']]) {
            const { msgs, reply } = capturar()
            await setwallpaper.execute({ reply, args, isOwner: true, info: {}, from: '5511970000011@s.whatsapp.net', sender: '5511970000011@s.whatsapp.net', prefix: '.' })
            assert.ok(temTexto(msgs[0], 'Não conheço esse menu') && temTexto(msgs[0], 'rpg'), args.join(' ') + ': ' + msgs[0])
        }
    })

    // ── 15. auto off ──
    console.log('\n--- 15. auto off repetido ---')
    await test('desativar já desligado devolve null', async () => {
        const auto = require('../src/services/autoContentService')
        const grupo = '120363777000000015@g.us'
        await auto.ativar(grupo, { tema: undefined, nomeGrupo: 'Teste' })
        assert.ok(await auto.desativar(grupo))
        assert.strictEqual(await auto.desativar(grupo), null)
    })

    // ── 16. advertências ──
    console.log('\n--- 16. advertências dizem que somam todos os grupos ---')
    await test('.warnings não promete "neste grupo"', async () => {
        const warnings = require('../src/commands/admin/warnings')
        const { msgs, reply } = capturar()
        await warnings.execute({ info: {}, sender: '5511970000012@s.whatsapp.net', from: '120363777000000016@g.us', args: [], reply, prefix: '.' })
        assert.ok(temTexto(msgs[0], 'todos os grupos em que estou'), msgs[0])
        assert.ok(!temTexto(msgs[0], 'advertências neste grupo'), msgs[0])
    })

    // ── 17. cancel ──
    console.log('\n--- 17. .cancel pela mediaQueue e só do dono do pedido ---')
    await test('outra pessoa não cancela; quem pediu cancela', async () => {
        const { mediaQueue } = require('../src/services/mediaQueue')
        const cancel = require('../src/commands/media/cancel')
        let liberar
        const bloqueio = new Promise(r => { liberar = r })
        const dono = '5511970000013@s.whatsapp.net'
        const pedido = mediaQueue.enqueue({ id: 'job_teste_cancel', url: 'x', format: 'mp3', user: dono, runFn: () => bloqueio }).catch(e => e)
        assert.ok(mediaQueue.getJob('job_teste_cancel'))

        const outro = capturar()
        await cancel.execute({ text: 'job_teste_cancel', reply: outro.reply, sender: '5511970000014@s.whatsapp.net', isOwner: false, userRole: { level: 1 }, prefix: '.' })
        assert.ok(temTexto(outro.msgs[0], 'não é seu'), outro.msgs[0])

        const meu = capturar()
        await cancel.execute({ text: 'job_teste_cancel', reply: meu.reply, sender: dono, isOwner: false, userRole: { level: 1 }, prefix: '.' })
        assert.ok(temTexto(meu.msgs[0], 'Download cancelado'), meu.msgs[0])
        const erro = await pedido
        assert.strictEqual(erro.code, 'CANCELLED')
        liberar()
    })

    console.log('\n========================================')
    console.log(`📊 CORREÇÕES DE REGRA: ✅ ${pass}  ❌ ${fail}`)
    console.log('========================================\n')
    fs.rmSync(pastaBackups, { recursive: true, force: true })
    process.exit(fail > 0 ? 1 : 0)
}

run().catch(err => {
    console.error('Falha geral nos testes de correções de regra:', err)
    process.exit(1)
})
