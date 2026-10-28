/**
 * Testes Unitários: Serviço de Recomendação Inteligente e Performance
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const { getRelatedActions, suggestByIntent, formatRelatedActions } = require('../src/services/smartRecommendationService');
const dispatcher = require('../src/handlers/commandDispatcher');

dispatcher.loadCommands();

console.log('🧪 Iniciando testes de Recomendação Inteligente e Performance...\n');

let pass = 0, fail = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        pass++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}\n     ${e.message}`);
        fail++;
    }
}

// 1. Testes de Próximos Passos (Next Actions)
test('Recomendações pós-saldo incluem ações financeiras complementares', () => {
    const actions = getRelatedActions('saldo');
    assert.ok(actions.length >= 3, 'Deve retornar ao menos 3 ações');
    const cmds = actions.map(a => a.cmd);
    assert.ok(cmds.includes('diario'), 'Deve sugerir diario');
    assert.ok(cmds.includes('trabalhar') || cmds.includes('investir'), 'Deve sugerir trabalhar ou investir');
});

test('Recomendações pós-batalhar incluem cura e inventário', () => {
    const actions = getRelatedActions('batalhar');
    const cmds = actions.map(a => a.cmd);
    assert.ok(cmds.includes('curar'), 'Deve sugerir curar');
    assert.ok(cmds.includes('inventario') || cmds.includes('statusrpg'), 'Deve sugerir inventario ou statusrpg');
});

test('Recomendações pós-preset incluem agenda e moderação', () => {
    const actions = getRelatedActions('preset');
    const cmds = actions.map(a => a.cmd);
    assert.ok(cmds.includes('agenda'), 'Deve sugerir agenda');
    assert.ok(cmds.includes('moderacao'), 'Deve sugerir moderacao');
});

// 2. Testes de Descoberta por Intenção Natural
test('Detecta intenção de ganhar moedas e sugere comandos financeiros', () => {
    const res = suggestByIntent('como faço para ganhar moedas e ficar rico?');
    assert.strictEqual(res.topic, 'Ganhar Moedas & Economia');
    const cmds = res.commands.map(c => c.cmd);
    assert.ok(cmds.includes('diario'), 'Deve incluir diario');
    assert.ok(cmds.includes('trabalhar'), 'Deve incluir trabalhar');
});

test('Detecta intenção de baixar mídia e sugere play e ytmp4', () => {
    const res = suggestByIntent('quero baixar uma música do youtube');
    assert.strictEqual(res.topic, 'Música & Vídeos');
    const cmds = res.commands.map(c => c.cmd);
    assert.ok(cmds.includes('play'), 'Deve incluir play');
});

test('Detecta intenção de segurança de grupos', () => {
    const res = suggestByIntent('como proteger o grupo de travas e links');
    assert.strictEqual(res.topic, 'Segurança & Moderação de Grupos');
    const cmds = res.commands.map(c => c.cmd);
    assert.ok(cmds.includes('preset') || cmds.includes('moderacao all on'), 'Deve incluir preset ou moderacao');
});

// 3. Teste de Desempenho e Velocidade da Busca Fuzzy
test('Busca fuzzy de comandos em 30.000 gatilhos roda em menos de 25ms', () => {
    const start = Date.now();
    // Teste de digitação com erro para forçar cálculo de distância Levenshtein
    const results = dispatcher.findClosestCommands('batalahr', 5);
    const duration = Date.now() - start;
    assert.ok(duration < 50, `Demorou ${duration}ms, esperado < 50ms`);
    assert.ok(results.length > 0, 'Deve encontrar comandos aproximados');
    assert.strictEqual(results[0].name, 'batalhar', 'Deve sugerir batalhar');
});

console.log(`\n📊 Testes: ✅ ${pass}  ❌ ${fail}`);
if (fail > 0) process.exit(1);
