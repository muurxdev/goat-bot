const assert = require('assert');
const groupControlService = require('../src/services/groupControlService');
const persistentScheduler = require('../src/services/persistentScheduler');
const timerRepo = require('../src/database/repositories/timerRepository');
const botScheduler = require('../src/services/botScheduler');
const scheduleRepo = require('../src/database/repositories/scheduleRepository');

async function testGroupControlTime() {
    console.log('🧪 Iniciando testes de Fechamento de Grupo e Horários Reais...');

    let updatedSetting = null;
    let sentMessages = [];

    const mockClient = {
        groupSettingUpdate: async (jid, setting) => {
            updatedSetting = setting;
            return true;
        },
        sendMessage: async (jid, content) => {
            sentMessages.push({ jid, content });
            return true;
        }
    };

    persistentScheduler.init(mockClient);

    const testGroup = '120363999999999999@g.us';

    // 1. Teste de agendamento relativo de fechamento (30m)
    console.log('\n--- 1. Agendamento Relativo de Fechamento (30m) ---');
    const now = Date.now();
    const durTs = groupControlService.parseDurationOrTime('30m', now);
    assert.strictEqual(durTs, now + 30 * 60 * 1000, '30m deve somar exatamente 1.800.000 ms');

    const resSchedClose = groupControlService.scheduleCloseGroup(testGroup, '30m');
    assert.strictEqual(resSchedClose.scheduled, true, 'O fechamento deve ser agendado no tempo à frente');
    assert(resSchedClose.triggerAt > now, 'Timestamp alvo deve ser no futuro');
    assert.strictEqual(updatedSetting, null, 'O grupo NÃO deve ser fechado imediatamente');

    // Verifica persistência no SQLite
    let pendingTimers = timerRepo.getPendingTimers();
    let groupTimer = pendingTimers.find(t => t.scopeJid === testGroup && t.type === 'group_close');
    assert(groupTimer, 'Timer de group_close deve estar gravado no SQLite');
    console.log('  ✅ PASS: Agendamento relativo de fechamento gravado no SQLite');

    // 2. Teste de Fechamento Imediato (.fechar sem argumentos)
    console.log('\n--- 2. Fechamento Imediato (.fechar sem argumentos) ---');
    const resImmediateClose = await groupControlService.closeGroup(mockClient, testGroup);
    assert.strictEqual(resImmediateClose.closed, true, 'O grupo deve fechar imediatamente');
    assert.strictEqual(updatedSetting, 'announcement', 'A configuração do grupo deve ser "announcement"');

    // Deve ter cancelado o agendamento pendente
    pendingTimers = timerRepo.getPendingTimers();
    groupTimer = pendingTimers.find(t => t.scopeJid === testGroup && t.type === 'group_close');
    assert(!groupTimer, 'Timer pendente de fechamento deve ser cancelado após fechar imediatamente');
    console.log('  ✅ PASS: Fechamento imediato cancela agendamentos prévios e altera configuração');

    // 3. Teste de Agendamento Relativo de Abertura (20:44 / duração)
    console.log('\n--- 3. Agendamento Relativo de Abertura ---');
    const resSchedOpen = groupControlService.scheduleOpenGroup(testGroup, '2h');
    assert.strictEqual(resSchedOpen.scheduled, true);
    pendingTimers = timerRepo.getPendingTimers();
    const openTimer = pendingTimers.find(t => t.scopeJid === testGroup && t.type === 'group_open');
    assert(openTimer, 'Timer de group_open deve estar gravado no SQLite');
    console.log('  ✅ PASS: Agendamento de abertura gravado com sucesso no SQLite');

    // 4. Teste de Reabertura Manual Imediata (.abrir) e cancelamento do timer
    console.log('\n--- 4. Reabertura Manual Imediata e Limpeza de Timers ---');
    const resOpen = await groupControlService.openGroup(mockClient, testGroup);
    assert.strictEqual(resOpen.closed, false);
    assert.strictEqual(updatedSetting, 'not_announcement', 'A configuração deve voltar para "not_announcement"');

    const pendingAfterOpen = timerRepo.getPendingTimers();
    const groupTimerAfterOpen = pendingAfterOpen.find(t => t.scopeJid === testGroup && (t.type === 'group_open' || t.type === 'group_reopen'));
    assert(!groupTimerAfterOpen, 'O timer de group_open deve ter sido cancelado');
    console.log('  ✅ PASS: Grupo reaberto imediatamente e timers cancelados no SQLite');

    // 4. Teste de Disparo Automático pelo PersistentScheduler
    console.log('\n--- 4. Disparo Automático pelo PersistentScheduler ---');
    const shortDelayMs = 200;
    const triggerAt = Date.now() + shortDelayMs;
    const { timerId } = persistentScheduler.scheduleGroupReopen({
        scopeJid: testGroup,
        triggerAt,
        durationStr: '1s'
    });

    // Simula grupo fechado
    updatedSetting = 'announcement';
    // O anúncio de abertura é opt-in (commit c635186d, 2026-10-25): liga a mensagem de abertura neste grupo.
    const configRepo = require('../src/database/repositories/configRepository');
    configRepo.saveConfig(testGroup, { ...(configRepo.getConfig(testGroup) || {}), abertura: true, aberturaEnabled: true });

    // Aguarda o disparo automático
    await new Promise(r => setTimeout(r, 350));

    assert.strictEqual(updatedSetting, 'not_announcement', 'O PersistentScheduler deve ter chamado openGroup automaticamente');
    const reopenMsg = sentMessages.find(m => m.jid === testGroup && /grupo (aberto|reaberto)/i.test(m.content.text));
    assert(reopenMsg, 'Mensagem de reabertura automática deve ter sido enviada no grupo');
    console.log('  ✅ PASS: PersistentScheduler reabriu o grupo e enviou anúncio formal');

    // 5. Teste de Auto-Recuperação de Horário Preso (Destrava 20:44)
    console.log('\n--- 5. Auto-Recuperação de Fechamento Vencido (Destrava "Volto às 20:44") ---');
    const pastTime = Date.now() - 60000; // 1 minuto atrás
    scheduleRepo.createSchedule({
        id: 'sched_expired_test',
        action: 'CLOSE',
        executeAt: pastTime - 120000,
        reopenAt: pastTime,
        mode: 'CYCLE',
        status: 'EXECUTING',
        createdBy: 'TEST'
    });
    botScheduler.setBotState(botScheduler.BOT_STATES.OFFLINE);

    const selfHealService = require('../src/services/selfHealService');
    const unlocked = selfHealService.destravarAgendamentos();
    assert(unlocked > 0, 'Deve ter destravado o agendamento expirado');
    assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.ONLINE, 'Estado operacional deve ter voltado para ONLINE');
    console.log('  ✅ PASS: Agendamento expirado destravado e bot restaurado para ONLINE');

    console.log('\n========================================');
    console.log('🎉 TODOS OS TESTES DE CONTROLE TEMPORAL PASSARAM!');
    console.log('========================================\n');
}

testGroupControlTime().catch(err => {
    console.error('❌ Falha nos testes de controle temporal:', err);
    process.exit(1);
});
