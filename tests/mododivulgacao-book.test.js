/**
 * Testes unitários para Modo Divulgação, Toggle de XP e Busca Aberta de Livros/PDFs
 */

const assert = require('assert');
const dataService = require('../src/services/dataService');
const mododivulgacaoCmd = require('../src/commands/admin/divulga25');
const xpgroupCmd = require('../src/commands/general/xpgroup');
const { searchBooks, resolvePdfUrl } = require('../src/services/bookService');
const { hasProvider, providersAtivos } = require('../src/services/llmService');

async function runTests() {
    console.log('🧪 Iniciando testes de Modo Divulgação, XP e Livros Web...\n');
    let passed = 0;

    // Teste 1: Modo Divulgação ativa todos os shields de segurança por padrão
    const testGroupJid = '120363999999999999@g.us';
    let replyMsg = '';
    const fakeReply = (msg) => { replyMsg = msg; return Promise.resolve(); };

    await mododivulgacaoCmd.execute({
        from: testGroupJid,
        args: ['on'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });

    const configs = dataService.getConfigsData();
    assert.strictEqual(configs[testGroupJid].divulgacaoMode?.enabled, true, 'divulgacaoMode deve estar ativado');
    assert.strictEqual(configs[testGroupJid].antilink, true, 'antilink deve estar ativado por padrão');
    assert.strictEqual(configs[testGroupJid].antitrava, true, 'antitrava deve estar ativado por padrão');
    assert.strictEqual(configs[testGroupJid].antispam, true, 'antispam deve estar ativado por padrão');
    assert.strictEqual(configs[testGroupJid].autokick, true, 'autokick deve estar ativado por padrão');
    assert.strictEqual(configs[testGroupJid].antilinkConfig?.platforms?.whatsapp, true, 'whatsapp links devem ser bloqueados');
    assert.strictEqual(configs[testGroupJid].antilinkConfig?.platforms?.telegram, true, 'telegram links devem ser bloqueados');
    console.log('  ✅ PASS: Modo Divulgação ativa todos os filtros de segurança por padrão');
    passed++;

    // Teste 2: Configuração de link e mensagem de fechamento para divulgação
    await mododivulgacaoCmd.execute({
        from: testGroupJid,
        args: ['link', 'https://chat.whatsapp.com/teste-divulgacao'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });
    const cfgAfterLink = dataService.getConfigsData();
    assert.strictEqual(cfgAfterLink[testGroupJid].divulgacaoMode?.link, 'https://chat.whatsapp.com/teste-divulgacao');

    await mododivulgacaoCmd.execute({
        from: testGroupJid,
        args: ['msg', 'Grupo {grupo} fechado para parceiros! Canal: {link}'],
        isGroup: true,
        reply: fakeReply,
        prefix: '.'
    });
    const cfgAfterMsg = dataService.getConfigsData();
    assert.strictEqual(cfgAfterMsg[testGroupJid].divulgacaoMode?.closeMessage, 'Grupo {grupo} fechado para parceiros! Canal: {link}');
    console.log('  ✅ PASS: Link e mensagem customizada de fechamento salvos com sucesso');
    passed++;

    // Teste 3: Toggle de XP por mensagem e aviso de level up
    await xpgroupCmd.execute({
        from: testGroupJid,
        args: ['off'],
        isGroup: true,
        isAdmin: true,
        reply: fakeReply,
        prefix: '.'
    });
    const cfgAfterXpOff = dataService.getConfigsData();
    assert.strictEqual(cfgAfterXpOff[testGroupJid].xpEnabled, false, 'xpEnabled deve ser falso após .xpgrupo off');

    await xpgroupCmd.execute({
        from: testGroupJid,
        args: ['msg', 'off'],
        isGroup: true,
        isAdmin: true,
        reply: fakeReply,
        prefix: '.'
    });
    const cfgAfterMsgOff = dataService.getConfigsData();
    assert.strictEqual(cfgAfterMsgOff[testGroupJid].notifyLevelUp, false, 'notifyLevelUp deve ser falso após .xpgrupo msg off');

    await xpgroupCmd.execute({
        from: testGroupJid,
        args: ['on'],
        isGroup: true,
        isAdmin: true,
        reply: fakeReply,
        prefix: '.'
    });
    const cfgAfterXpOn = dataService.getConfigsData();
    assert.strictEqual(cfgAfterXpOn[testGroupJid].xpEnabled, true, 'xpEnabled deve voltar a ser true');
    console.log('  ✅ PASS: Toggle de ganho de XP e aviso silencioso de level up funcionando');
    passed++;

    // Teste 4: LLM Service tem provedor resiliente mesmo sem API keys
    assert.strictEqual(hasProvider(), true, 'hasProvider() deve retornar true mesmo sem chaves');
    console.log('  ✅ PASS: LLM Service possui provedor resiliente ativo');
    passed++;

    // Teste 5: Busca de livros com crawler aberto na Web
    const bookResult = await searchBooks('Dom Casmurro', 1, 'pt');
    assert.ok(bookResult && bookResult.length > 0, 'Deve encontrar Dom Casmurro');
    const resolvedPdf = await resolvePdfUrl(bookResult[0].identifier, bookResult[0].title, 'pt');
    assert.ok(resolvedPdf && resolvedPdf.downloadUrl, 'Deve resolver a URL direta do PDF');
    console.log('  ✅ PASS: Busca de livros e resolução de PDF real via crawler funcionando');
    passed++;

    console.log(`\n📊 Todos os ${passed} testes passaram com sucesso!`);
}

runTests().catch(e => {
    console.error('❌ Falha nos testes:', e);
    process.exit(1);
});
