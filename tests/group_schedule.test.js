const assert = require('assert');
const groupScheduleService = require('../src/services/groupScheduleService');

console.log('🧪 Iniciando testes de agenda semanal de grupos...');

// 1. Teste de parse de dias da semana
assert.deepStrictEqual(groupScheduleService.parseDays('seg-sex'), [1, 2, 3, 4, 5], 'seg-sex deve ser dias úteis');
assert.deepStrictEqual(groupScheduleService.parseDays('todos'), [0, 1, 2, 3, 4, 5, 6], 'todos deve ser de domingo a sábado');
assert.deepStrictEqual(groupScheduleService.parseDays('fds'), [0, 6], 'fds deve ser domingo e sábado');
assert.deepStrictEqual(groupScheduleService.parseDays('seg,qua,sex'), [1, 3, 5], 'seg,qua,sex deve ser 1, 3, 5');

// 2. Teste de formatação de dias
assert(groupScheduleService.formatDays([1, 2, 3, 4, 5]).includes('Segunda a Sexta'), 'Formatação dias úteis');
assert(groupScheduleService.formatDays([0, 1, 2, 3, 4, 5, 6]).includes('Todos os dias'), 'Formatação todos');
assert(groupScheduleService.formatDays([0, 6]).includes('Fins de semana'), 'Formatação fds');

// 3. Teste de formatação de mensagens da agenda com variáveis dinâmicas
const tplFechar = '🔒 Grupo {grupo} fechado! Reabrimos às {hora_abrir} na {dia_abrir}. Admins: {adms}';
const msgFechar = groupScheduleService.formatScheduleMessage(tplFechar, {
    groupName: 'Clube dos Cavaleiros',
    horaFechar: '22:00',
    horaAbrir: '07:00',
    diaAbrir: 'Segunda-feira',
    admsTags: '@553599991111'
});

assert(msgFechar.includes('Clube dos Cavaleiros'), 'Deve conter o nome do grupo');
assert(msgFechar.includes('07:00'), 'Deve conter a hora de reabrir');
assert(msgFechar.includes('Segunda-feira'), 'Deve conter o dia de reabrir');
assert(msgFechar.includes('@553599991111'), 'Deve conter menção dos admins');

// 4. Teste de persistência de agenda
const testGroupJid = '120363000000000000@g.us';
groupScheduleService.saveSchedule(testGroupJid, {
    enabled: true,
    days: [1, 2, 3, 4, 5],
    closeTime: '23:30',
    openTime: '06:30',
    closeMsg: 'Fechando {grupo}',
    openMsg: 'Abrindo {grupo}'
}).then(saved => {
    const read = groupScheduleService.getSchedule(testGroupJid);
    assert.strictEqual(read.enabled, true, 'Deve estar ativada');
    assert.strictEqual(read.closeTime, '23:30', 'Hora fechar deve ser 23:30');
    assert.strictEqual(read.openTime, '06:30', 'Hora abrir deve ser 06:30');
    assert.strictEqual(read.closeMsg, 'Fechando {grupo}', 'Mensagem fechar customizada');
    assert.strictEqual(read.openMsg, 'Abrindo {grupo}', 'Mensagem abrir customizada');
    console.log('✅ Todos os testes de agenda semanal de grupos passaram com sucesso!');
});
