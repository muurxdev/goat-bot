/**
 * Testes Unitários: Automação e Respostas Autônomas por Grupo (24H Engine)
 * GOATBOT // GOAT Prime (GOAT)
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const autonomousGroup = require('../src/services/groupAutonomousAgentService');
const autoContent = require('../src/services/autoContentService');
const dataService = require('../src/services/dataService');
const dispatcher = require('../src/handlers/commandDispatcher');
const autoRespCmd = require('../src/commands/admin/autoresposta');
const configCmd = require('../src/commands/admin/config');

dispatcher.loadCommands();

console.log('🧪 Iniciando testes do Motor de Automação e Resposta Autônoma 24H...\n');

async function runTests() {
    let passed = 0;
    const testJid = '123456789012@g.us';

    let lastReply = '';
    const fakeReply = (msg) => {
        lastReply = typeof msg === 'string' ? msg : JSON.stringify(msg);
        return Promise.resolve();
    };

    // Teste 1: Resolução de Nicho de Grupo por Preset e Nome
    const nichoVagas = autonomousGroup.resolveGroupNiche('vagas_1@g.us', 'SkyCode Vagas Tech & Carreiras 💼');
    assert.strictEqual(nichoVagas.id, 'vagas', 'Deve resolver nicho de vagas');

    const nichoVendas = autonomousGroup.resolveGroupNiche('vendas_1@g.us', 'SkyCode Mercado & Vendas Seguras 💎');
    assert.strictEqual(nichoVendas.id, 'vendas', 'Deve resolver nicho de vendas');

    const nichoEstudos = autonomousGroup.resolveGroupNiche('estudos_1@g.us', 'SkyCode Academia & Estudos 📚');
    assert.strictEqual(nichoEstudos.id, 'estudos', 'Deve resolver nicho de estudos');

    const nichoResenha = autonomousGroup.resolveGroupNiche('resenha_1@g.us', 'Clube dos Campeões • Resenha VIP ⚽');
    assert.strictEqual(nichoResenha.id, 'resenha', 'Deve resolver nicho de resenha esportiva');
    console.log('  ✅ PASS: Resolução precisa de nichos para todos os perfis de grupos da rede');
    passed++;

    // Teste 2: Ativação e Desativação de Auto-Resposta (.autoresposta on/off)
    await autoRespCmd.execute({
        from: testJid,
        args: ['off'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        prefix: '.'
    });
    assert.strictEqual(autonomousGroup.isAutoReplyEnabled(testJid), false, 'Auto-resposta deve estar desativada');

    await autoRespCmd.execute({
        from: testJid,
        args: ['on'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        prefix: '.'
    });
    assert.strictEqual(autonomousGroup.isAutoReplyEnabled(testJid), true, 'Auto-resposta deve estar ativada');
    console.log('  ✅ PASS: .autoresposta on/off comutando perfeitamente por grupo');
    passed++;

    // Teste 3: Resposta Contextual Direta em Grupo de Vagas
    // Simula grupo de vagas
    const configs = dataService.getConfigsData();
    if (!configs[testJid]) configs[testJid] = {};
    configs[testJid].activePreset = 'vagas';
    configs[testJid].autoresposta = true;
    await dataService.saveConfigsData(configs);

    let responded = await autonomousGroup.handleGroupMessage({
        from: testJid,
        sender: '551188888888@s.whatsapp.net',
        body: 'onde tem vaga de backend?',
        isBotMentioned: true,
        prefix: '.',
        reply: fakeReply
    });
    assert.strictEqual(responded, true, 'Deve responder à menção no grupo');
    assert.ok(lastReply.includes('RADAR DE VAGAS TECH'), 'Deve conter cabeçalho do radar de vagas');
    assert.ok(lastReply.includes('.vagas backend'), 'Deve sugerir comando .vagas backend');
    console.log('  ✅ PASS: Resposta autônoma no grupo de Vagas entrega orientações e comandos de carreira');
    passed++;

    // Teste 4: Resposta Contextual Direta em Grupo de Vendas
    configs[testJid].activePreset = 'vendas';
    await dataService.saveConfigsData(configs);

    responded = await autonomousGroup.handleGroupMessage({
        from: testJid,
        sender: '551188888888@s.whatsapp.net',
        body: 'esse vendedor é de confiança ou é golpe?',
        isBotMentioned: true,
        prefix: '.',
        reply: fakeReply
    });
    assert.strictEqual(responded, true);
    assert.ok(lastReply.includes('BALCÃO SEGURO'), 'Deve conter orientações anti-golpe');
    assert.ok(lastReply.includes('.reputacao'), 'Deve sugerir comando de reputação');
    console.log('  ✅ PASS: Resposta autônoma no grupo de Vendas protege contra golpes e sugere reputação');
    passed++;

    // Teste 5: Resposta Contextual Direta em Grupo de Estudos
    configs[testJid].activePreset = 'estudos';
    await dataService.saveConfigsData(configs);

    responded = await autonomousGroup.handleGroupMessage({
        from: testJid,
        sender: '551188888888@s.whatsapp.net',
        body: 'onde acho livro ou pdf de programação?',
        isBotMentioned: true,
        prefix: '.',
        reply: fakeReply
    });
    assert.strictEqual(responded, true);
    assert.ok(lastReply.includes('BIBLIOTECA VIRTUAL'), 'Deve conter biblioteca virtual');
    assert.ok(lastReply.includes('.livro'), 'Deve sugerir comando de livros');
    console.log('  ✅ PASS: Resposta autônoma no grupo de Estudos entrega acervo de PDFs e métodos de estudo');
    passed++;

    // Teste 6: Resposta Contextual Direta em Grupo de Resenha / Futebol
    configs[testJid].activePreset = 'resenha';
    await dataService.saveConfigsData(configs);

    responded = await autonomousGroup.handleGroupMessage({
        from: testJid,
        sender: '551188888888@s.whatsapp.net',
        body: 'como tá a tabela do brasileirao?',
        isBotMentioned: true,
        prefix: '.',
        reply: fakeReply
    });
    assert.strictEqual(responded, true);
    assert.ok(lastReply.includes('CENTRAL ESPORTIVA'), 'Deve conter central esportiva');
    assert.ok(lastReply.includes('.tabela brasileirao'), 'Deve sugerir comando de tabela');
    console.log('  ✅ PASS: Resposta autônoma no grupo de Resenha entrega futebol e tabelas');
    passed++;

    // Teste 7: Integração no .config com Status 24H
    await configCmd.execute({
        from: testJid,
        args: [],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    assert.ok(lastReply.includes('ROTINAS & AUTONOMIA 24H'), 'Painel .config deve exibir status 24h');
    assert.ok(lastReply.includes('Auto-Resposta por Nicho'), 'Painel .config deve exibir status da auto-resposta');
    console.log('  ✅ PASS: Painel central .config exibe status 24H e controle de auto-resposta por nicho');
    passed++;

    // Teste 8: Resolução de Comandos no Dispatcher JIT
    const testAliases = ['autoresposta', 'autoreply', 'configautoresposta', 'respostanicho'];
    for (const a of testAliases) {
        const found = dispatcher.findCommand(a);
        assert.ok(found, `Alias .${a} deve resolver com sucesso no JIT`);
    }
    console.log('  ✅ PASS: Todos os comandos e atalhos de auto-resposta 24H ativos no índice JIT');
    passed++;

    // Teste 9: Diagnóstico e Saúde do Motor 24H
    const health = autonomousGroup.get24hHealthStatus();
    assert.ok(health.status.includes('Operacional'), 'Status de saúde deve estar operacional');
    assert.ok(typeof health.uptimeSeconds === 'number', 'Uptime deve ser numérico');
    console.log(`  ✅ PASS: Diagnóstico de saúde do motor 24H operacional: ${health.status}`);
    passed++;

    console.log(`\n📊 Todos os ${passed} testes de Automação e Resposta Autônoma 24H passaram com 100% de sucesso!`);
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de automação 24H:', err);
    process.exit(1);
});
