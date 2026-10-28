process.env.NODE_ENV = 'test';

const assert = require('assert');
const { getDatabase } = require('../src/database/connection');
const { runMigrations } = require('../src/database/migrator');
const timerRepo = require('../src/database/repositories/timerRepository');
const rentalRepo = require('../src/database/repositories/rentalRepository');
const persistentScheduler = require('../src/services/persistentScheduler');
const rentalWorker = require('../src/services/rentalWorker');

async function runTests() {
    console.log('🧪 Iniciando testes da FASE 1: Motor Temporal & Sistema de Aluguel...');

    const db = getDatabase();
    runMigrations(db);

    // 1. Teste da Migration 022 e Repository de Timers
    console.log('\n--- 1. Persistência de Timers no SQLite ---');
    const timerId = timerRepo.createTimer({
        scopeJid: '123456@g.us',
        senderJid: '5511999999999@s.whatsapp.net',
        type: 'reminder',
        content: 'Reunião de Alinhamento da Guilda',
        triggerAt: Date.now() + 5000,
        metadata: { label: '5 segundos' }
    });

    assert(timerId, 'ID do timer deve ser gerado');
    const timer = timerRepo.getTimerById(timerId);
    assert.strictEqual(timer.content, 'Reunião de Alinhamento da Guilda');
    assert.strictEqual(timer.status, 'PENDING');
    console.log('  ✅ PASS: Timer criado e persistido no SQLite com sucesso');

    // 2. Teste do Agendador (Scheduler Recovery)
    console.log('\n--- 2. Scheduler Engine & Disparo de Alertas ---');
    let sentMessages = [];
    const mockClient = {
        sendMessage: async (jid, content) => {
            sentMessages.push({ jid, content });
            return true;
        },
        groupLeave: async (jid) => {
            sentMessages.push({ jid, action: 'groupLeave' });
            return true;
        }
    };

    persistentScheduler.init(mockClient);

    // Teste de trigger manual
    await persistentScheduler.triggerTimer(timer);
    assert.strictEqual(sentMessages.length, 1, 'Deve ter enviado 1 mensagem');
    assert(sentMessages[0].content.text.includes('LEMBRETE ATIVADO'), 'Texto deve conter cabeçalho de lembrete');
    assert(sentMessages[0].content.text.includes('Reunião de Alinhamento da Guilda'), 'Texto deve conter recado');

    const updatedTimer = timerRepo.getTimerById(timerId);
    assert.strictEqual(updatedTimer.status, 'EXECUTED', 'Status deve mudar para EXECUTED no banco');
    console.log('  ✅ PASS: Scheduler disparou mensagem e atualizou status no banco');

    // 3. Teste do Rental Worker (Avisos de 24h, 1h e Expiração)
    console.log('\n--- 3. Monitor Ativo de Aluguel (Worker) ---');
    sentMessages = [];

    // Cria aluguel com expiração em 30 min (deve disparar aviso de 1h)
    const testRental1h = {
        targetJid: 'test_group_1h@g.us',
        groupName: 'Grupo Teste 1h',
        startsAt: Date.now() - 3600000,
        expiresAt: Date.now() + 1800000, // 30 min restantes
        isActive: true,
        isLifetime: false
    };
    rentalRepo.saveRental(testRental1h);

    // Cria aluguel expirado (deve disparar mensagem de despedida e groupLeave)
    const testRentalExpired = {
        targetJid: 'test_group_exp@g.us',
        groupName: 'Grupo Teste Expirado',
        startsAt: Date.now() - 7200000,
        expiresAt: Date.now() - 1000, // expirou há 1s
        isActive: true,
        isLifetime: false
    };
    rentalRepo.saveRental(testRentalExpired);

    rentalWorker.start(mockClient);
    await rentalWorker.checkRentals();

    const rent1h = rentalRepo.getRental('test_group_1h@g.us');
    assert.strictEqual(rent1h.warned1h, true, 'Deve ter marcado warned1h como true');
    console.log('  ✅ PASS: Aviso de 1 hora disparado e marcado no banco');

    const rentExp = rentalRepo.getRental('test_group_exp@g.us');
    assert.strictEqual(rentExp.isActive, false, 'Aluguel vencido deve ter sido desativado');
    console.log('  ✅ PASS: Aluguel vencido desativado automaticamente');

    rentalWorker.stop();

    // 4. Teste do Horário Mundial
    console.log('\n--- 4. Comando de Fuso Horário (.horario) ---');
    const horarioCmd = require('../src/commands/general/horario');
    let replyText = '';
    await horarioCmd.execute({
        reply: (msg) => { replyText = msg; },
        text: 'brasil'
    });
    assert(replyText.includes('FUSO HORÁRIO OFICIAL'), 'Deve retornar tela com moldura de fuso horário');
    assert(replyText.includes('America/Sao_Paulo'), 'Deve conter zona de SP');
    console.log('  ✅ PASS: Comando .horario executou com dados reais de timezone');

    console.log('\n========================================');
    console.log('🎉 TODOS OS TESTES DA FASE 1 PASSARAM!');
    console.log('========================================\n');
}

runTests().catch(err => {
    console.error('❌ Falha nos testes da Fase 1:', err);
    process.exit(1);
});
