/**
 * Testes unitários para Presets de Grupo e Ciclos de Agendamento (Semana, Mês e Permanente)
 */

const assert = require('assert');
const dataService = require('../src/services/dataService');
const presetCmd = require('../src/commands/admin/seguranca/seg_regra_89');
const agendaCmd = require('../src/commands/admin/agendagrupo');
const groupScheduleService = require('../src/services/groupScheduleService');

async function runTests() {
    console.log('🧪 Iniciando testes de Presets de Grupo e Ciclos de Agenda...\n');
    let passed = 0;

    const testGroupJid = '120363888888888888@g.us';
    let replyMsg = '';
    const fakeReply = (msg) => { replyMsg = msg; return Promise.resolve(); };

    // Teste 1: Preset Vagas T.I
    await presetCmd.execute({
        from: testGroupJid,
        args: ['vagas'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });

    let cfg = dataService.getConfigsData()[testGroupJid];
    assert.strictEqual(cfg.activePreset, '💼 Vagas & Carreiras T.I');
    assert.strictEqual(cfg.antilink, true);
    assert.strictEqual(cfg.antilinkConfig?.platforms?.outros, false, 'Links de sites de vagas devem ser permitidos');
    assert.strictEqual(cfg.antilinkConfig?.platforms?.whatsapp, true, 'WhatsApp links rivais bloqueados');
    assert.strictEqual(cfg.notifyLevelUp, false, 'Level-up silencioso');
    console.log('  ✅ PASS: Preset Vagas T.I aplicado com sucesso');
    passed++;

    // Teste 2: Preset Estudos & Livros
    await presetCmd.execute({
        from: testGroupJid,
        args: ['estudos'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });
    cfg = dataService.getConfigsData()[testGroupJid];
    assert.strictEqual(cfg.activePreset, '📚 Estudos & Livros');
    assert.strictEqual(cfg.antilinkConfig?.platforms?.youtube, false, 'YouTube permitido para videoaulas');
    assert.strictEqual(cfg.notifyLevelUp, false, 'Silêncio para leitura e estudo');
    console.log('  ✅ PASS: Preset Estudos & Livros aplicado com sucesso');
    passed++;

    // Teste 3: Preset Resenha / Chat Geral
    await presetCmd.execute({
        from: testGroupJid,
        args: ['resenha'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });
    cfg = dataService.getConfigsData()[testGroupJid];
    assert.strictEqual(cfg.activePreset, '💬 Resenha & Chat Geral');
    assert.strictEqual(cfg.notifyLevelUp, true, 'Level up ativo comemorações');
    console.log('  ✅ PASS: Preset Resenha / Chat Geral aplicado com sucesso');
    passed++;

    // Teste 4: Ciclos de Agenda (Semana, Mês e Permanente)
    const baseNow = Date.now();
    const expSemana = groupScheduleService.calculateCycleExpiration('semana', baseNow);
    assert.strictEqual(expSemana, baseNow + 7 * 24 * 60 * 60 * 1000);

    const expMes = groupScheduleService.calculateCycleExpiration('mes', baseNow);
    assert.strictEqual(expMes, baseNow + 30 * 24 * 60 * 60 * 1000);

    const expPermanente = groupScheduleService.calculateCycleExpiration('permanente', baseNow);
    assert.strictEqual(expPermanente, null, 'Permanente não tem data de expiração');

    console.log('  ✅ PASS: Cálculo de expiração de ciclos (semana/mês/permanente) preciso');
    passed++;

    // Teste 5: Comando .agenda ciclo semana e ciclo mes
    await agendaCmd.execute({
        from: testGroupJid,
        args: ['ciclo', 'semana'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });
    let sched = groupScheduleService.getSchedule(testGroupJid);
    assert.strictEqual(sched.cycle, 'semana');
    assert.strictEqual(sched.enabled, true);
    assert.ok(sched.expiresAt > Date.now());

    await agendaCmd.execute({
        from: testGroupJid,
        args: ['ciclo', 'permanente'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });
    sched = groupScheduleService.getSchedule(testGroupJid);
    assert.strictEqual(sched.cycle, 'permanente');
    assert.strictEqual(sched.expiresAt, null);
    console.log('  ✅ PASS: Comando .agenda ciclo configurando permanência e ciclos');
    passed++;

    // Teste 6: Comando .agenda remover
    await agendaCmd.execute({
        from: testGroupJid,
        args: ['remover'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });
    sched = groupScheduleService.getSchedule(testGroupJid);
    assert.strictEqual(sched.enabled, false);
    console.log('  ✅ PASS: Comando .agenda remover limpando agenda do grupo');
    passed++;

    console.log(`\n📊 Todos os ${passed} testes de Presets e Agenda passaram com 100% de sucesso!`);
}

runTests().catch(e => {
    console.error('❌ Falha nos testes:', e);
    process.exit(1);
});
