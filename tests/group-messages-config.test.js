process.env.NODE_ENV = 'test';

const assert = require('assert');
const dataService = require('../src/services/dataService');
const groupGreetingService = require('../src/services/groupGreetingService');
const msgAberturaCmd = require('../src/commands/admin/msgabertura');
const msgFechamentoCmd = require('../src/commands/admin/msgfechamento');
const groupOpenCmd = require('../src/commands/admin/groupopen');
const groupCloseCmd = require('../src/commands/admin/groupclose');
const { createMockSocket } = require('../src/dev/mockFactory');

async function runGroupMessagesConfigTests() {
    console.log('🧪 Iniciando testes de Configuração de Mensagens de Abertura e Fechamento...\n');

    const testGroup = '120363888888888888@g.us';
    const testAdmin = '5511999991111@s.whatsapp.net';
    const testOwner = '5511988882222@s.whatsapp.net';
    const testSubdono = '5511977773333@s.whatsapp.net';

    const mockClient = {
        groupMetadata: async (jid) => ({
            id: jid,
            subject: 'Família GOAT XP',
            desc: 'Regras do grupo: respeito mútuo.',
            owner: testOwner,
            participants: [
                { id: testOwner, admin: 'superadmin' },
                { id: testSubdono, admin: 'admin' },
                { id: testAdmin, admin: 'admin' },
                { id: '5511966664444@s.whatsapp.net', admin: null }
            ]
        }),
        groupSettingUpdate: async () => true,
        sendMessage: async () => true
    };

    // ══════════════════════════════════════════
    // 1. TESTE DE VARIÁVEIS NO GROUP GREETING SERVICE
    // ══════════════════════════════════════════
    console.log('--- 1. Variáveis e Formatação de Template ---');
    const vars = await groupGreetingService.getGreetingVars(mockClient, testGroup, testAdmin, {
        tempo: '2h',
        adminJid: testAdmin
    });

    assert.strictEqual(vars.groupName, 'Família GOAT XP');
    assert.strictEqual(vars.donoTag, '@5511988882222');
    assert.strictEqual(vars.segundoAdmTag, '@5511977773333');
    assert.strictEqual(vars.adminTag, '@5511999991111');
    assert.strictEqual(vars.tempo, '2h');
    assert.strictEqual(vars.memberCount, 4);

    const tpl = 'Olá {grupo}! Dono: {dono}, Sucessor: {subdono}, Admins: {adms}, Executado por: {admin}. Tempo: {tempo}. Membros: {membros}';
    const formatted = groupGreetingService.formatTemplate(tpl, vars);
    assert(formatted.includes('Família GOAT XP'));
    assert(formatted.includes('@5511988882222'));
    assert(formatted.includes('@5511977773333'));
    assert(formatted.includes('@5511999991111'));
    assert(formatted.includes('Tempo: 2h'));
    assert(formatted.includes('Membros: 4'));

    const mentions = groupGreetingService.resolveMentionsForText(formatted, vars);
    assert(mentions.includes(testOwner));
    assert(mentions.includes(testSubdono));
    assert(mentions.includes(testAdmin));
    console.log('  ✅ PASS: Template substitui {grupo}, {dono}, {subdono}, {adms}, {admin}, {tempo} e extrai menções');

    // ══════════════════════════════════════════
    // 2. COMANDO .msgabertura
    // ══════════════════════════════════════════
    console.log('\n--- 2. Comando .msgabertura (.abertura) ---');

    let capturedReplies = [];
    const makeCtx = (args, cmdName = 'msgabertura') => ({
        from: testGroup,
        args,
        sender: testAdmin,
        text: args.join(' '),
        commandName: cmdName,
        client: mockClient,
        reply: async (msg, mentions = []) => {
            capturedReplies.push({ msg, mentions });
            return { msg, mentions };
        }
    });

    // 2.1 Painel sem argumentos
    capturedReplies = [];
    await msgAberturaCmd.execute(makeCtx([]));
    assert(capturedReplies[0].msg.includes('NOTIFICAÇÃO DE ABERTURA'));
    assert(capturedReplies[0].msg.includes('.msgabertura on'));
    assert(capturedReplies[0].msg.includes('.msgabertura msg <texto>'));
    console.log('  ✅ PASS: .msgabertura sem argumentos exibe o painel de status e guia');

    // 2.2 Configurar mensagem personalizada
    capturedReplies = [];
    await msgAberturaCmd.execute(makeCtx(['msg', '🔓', 'Atenção', '{grupo}!', 'O', 'grupo', 'foi', 'aberto', 'pelo', '{admin}.', 'Dono:', '{dono}']));
    assert(capturedReplies[0].msg.includes('ABERTURA CONFIGURADA'));
    const cfgAfterMsg = dataService.getConfigsData()[testGroup] || {};
    assert.strictEqual(cfgAfterMsg.aberturaMsg, '🔓 Atenção {grupo}! O grupo foi aberto pelo {admin}. Dono: {dono}');
    assert.strictEqual(cfgAfterMsg.abertura, true);
    console.log('  ✅ PASS: .msgabertura msg salva mensagem personalizada e ativa');

    // 2.3 Simulação / Preview (-config)
    capturedReplies = [];
    await msgAberturaCmd.execute(makeCtx(['-config']));
    assert(capturedReplies[0].msg.includes('CONFIG: ABERTURA DE GRUPO'));
    assert(capturedReplies[0].msg.includes('Família GOAT XP'));
    assert(capturedReplies[0].msg.includes('@5511988882222'));
    console.log('  ✅ PASS: .msgabertura -config exibe simulação com dados reais e variáveis substituídas');

    // 2.4 Desativar (off) e Reativar (on)
    capturedReplies = [];
    await msgAberturaCmd.execute(makeCtx(['off']));
    assert(capturedReplies[0].msg.includes('DESATIVADO'));
    assert.strictEqual(dataService.getConfigsData()[testGroup].abertura, false);

    capturedReplies = [];
    await msgAberturaCmd.execute(makeCtx(['on']));
    assert(capturedReplies[0].msg.includes('ATIVADO'));
    assert.strictEqual(dataService.getConfigsData()[testGroup].abertura, true);
    console.log('  ✅ PASS: .msgabertura off e on alteram o estado da notificação');

    // 2.5 Resetar para o padrão
    capturedReplies = [];
    await msgAberturaCmd.execute(makeCtx(['reset']));
    assert(capturedReplies[0].msg.includes('redefinida para o modelo padrão'));
    const cfgAfterReset = dataService.getConfigsData()[testGroup] || {};
    assert.strictEqual(cfgAfterReset.aberturaMsg, undefined);
    console.log('  ✅ PASS: .msgabertura reset restaura o modelo padrão oficial');

    // ══════════════════════════════════════════
    // 3. COMANDO .msgfechamento
    // ══════════════════════════════════════════
    console.log('\n--- 3. Comando .msgfechamento (.fechamento) ---');

    // 3.1 Painel sem argumentos
    capturedReplies = [];
    await msgFechamentoCmd.execute(makeCtx([], 'fechamentomsg'));
    assert(capturedReplies[0].msg.includes('NOTIFICAÇÃO DE FECHAMENTO'));
    assert(capturedReplies[0].msg.includes('.msgfechamento on'));
    console.log('  ✅ PASS: .msgfechamento sem argumentos exibe painel de status');

    // 3.2 Configurar mensagem personalizada
    capturedReplies = [];
    await msgFechamentoCmd.execute(makeCtx(['msg', '🔒', 'Grupo', '{grupo}', 'fechado', 'pelo', 'admin', '{admin}.', 'Tempo:', '{tempo}'], 'msgfechamento'));
    assert(capturedReplies[0].msg.includes('FECHAMENTO CONFIGURADO'));
    const cfgFech = dataService.getConfigsData()[testGroup] || {};
    assert.strictEqual(cfgFech.fechamentoMsg, '🔒 Grupo {grupo} fechado pelo admin {admin}. Tempo: {tempo}');
    console.log('  ✅ PASS: .msgfechamento msg salva mensagem personalizada');

    // 3.3 Simulação / Preview (-config)
    capturedReplies = [];
    await msgFechamentoCmd.execute(makeCtx(['-config'], 'msgfechamento'));
    assert(capturedReplies[0].msg.includes('CONFIG: FECHAMENTO DE GRUPO'));
    assert(capturedReplies[0].msg.includes('Família GOAT XP'));
    console.log('  ✅ PASS: .msgfechamento -config exibe simulação completa');

    // ══════════════════════════════════════════
    // 4. DELEGAÇÃO VIA .abrir E .fechar
    // ══════════════════════════════════════════
    console.log('\n--- 4. Integração de Palavras-Chave em .abrir e .fechar ---');

    // 4.1 .abrir msg ... delega para msgabertura
    capturedReplies = [];
    await groupOpenCmd.execute(makeCtx(['msg', 'Mensagem', 'via', '.abrir'], 'abrir'));
    assert(capturedReplies[0].msg.includes('ABERTURA CONFIGURADA'));
    assert.strictEqual(dataService.getConfigsData()[testGroup].aberturaMsg, 'Mensagem via .abrir');
    console.log('  ✅ PASS: .abrir msg delega de forma transparente para .msgabertura');

    // 4.2 .fechar msg ... delega para msgfechamento
    capturedReplies = [];
    await groupCloseCmd.execute(makeCtx(['msg', 'Mensagem', 'via', '.fechar'], 'fechar'));
    assert(capturedReplies[0].msg.includes('FECHAMENTO CONFIGURADO'));
    assert.strictEqual(dataService.getConfigsData()[testGroup].fechamentoMsg, 'Mensagem via .fechar');
    console.log('  ✅ PASS: .fechar msg delega de forma transparente para .msgfechamento');

    console.log('\n========================================');
    console.log('🎉 TODOS OS TESTES DE CONFIGURAÇÃO DE MENSAGENS PASSARAM!');
    console.log('========================================\n');
}

runGroupMessagesConfigTests().catch(err => {
    console.error('❌ Falha nos testes:', err);
    process.exit(1);
});
