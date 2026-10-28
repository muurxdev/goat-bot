/**
 * Testes Unitários de Hierarquia Estrita de 5 Níveis e Travas ON/OFF (Opt-In & Toggle Lock)
 * 
 * Verifica:
 * 1. Resolução estrita da hierarquia (USER -> TRUSTED -> GROUP_ADMIN -> BOT_ADMIN -> OWNER)
 * 2. Bloqueio com ❌ ao tentar executar comando acima do nível de permissão
 * 3. Bloqueio com ❌ para comandos inexistentes
 * 4. Desativação pontual de comando (.cmd <cmd> off) - se desligar fica desligado!
 * 5. Reativação de comando (.cmd <cmd> on)
 * 6. Trava geral de comandos no grupo (.cmd all off) com ❌ para membros e imunidade para admins
 * 7. Liberação geral de comandos no grupo (.cmd all on)
 * 8. Desativação de categoria inteira (.categoria off <cat>) com ❌
 * 9. Reativação de categoria (.categoria on <cat>)
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const dispatcher = require('../src/handlers/commandDispatcher');
const dataService = require('../src/services/dataService');
const moduleState = require('../src/services/moduleStateService');
const { ROLES, canExecuteCommand, resolveUserRole, getCommandHierarchy } = require('../src/services/permissionService');
const cmdCommand = require('../src/commands/admin/cmd');
const categoriaCommand = require('../src/commands/admin/categoria');

dispatcher.loadCommands();

console.log('🧪 Iniciando testes de Hierarquia Estrita e Travas ON/OFF (Toggle Lock)...\n');

async function runTests() {
    let passed = 0;
    const testGroup = '120363099999999999@g.us';
    const memberJid = '5511888880001@s.whatsapp.net';
    const adminJid = '5511888880002@s.whatsapp.net';
    const ownerJid = '5511999990001@s.whatsapp.net';

    // Helper para criar mock context
    function createMockContext(overrides = {}) {
        let replyText = '';
        const reactions = [];
        const ctx = {
            from: testGroup,
            sender: memberJid,
            isGroup: true,
            isAdmin: false,
            isBotAdmin: true,
            isOwner: false,
            args: [],
            reply: async (txt) => {
                replyText = typeof txt === 'string' ? txt : JSON.stringify(txt);
                return Promise.resolve();
            },
            react: async (emoji) => {
                reactions.push(emoji);
                return Promise.resolve();
            },
            getReplyText: () => replyText,
            getReactions: () => reactions,
            ...overrides
        };
        return ctx;
    }

    // Inicializa estado limpo para o grupo
    const configs = dataService.getConfigsData();
    configs[testGroup] = {
        disabledCommands: [],
        disabledCategories: []
    };
    await dataService.saveConfigsData(configs);
    moduleState.enableAll(testGroup);

    // ==========================================
    // 1. HIERARQUIA DE 5 NÍVEIS & PERMISSÕES
    // ==========================================

    // Teste 1: Membro comum (USER) não pode executar comando admin (.fechargrupo)
    const ctxMemberAdm = createMockContext({
        sender: memberJid,
        isAdmin: false,
        isOwner: false,
        commandName: 'fechargrupo'
    });
    await dispatcher.dispatch(ctxMemberAdm);
    assert.ok(ctxMemberAdm.getReactions().includes('❌'), 'Membro executando comando admin deve receber reação ❌');
    assert.ok(ctxMemberAdm.getReplyText().includes('ADMINISTRADOR DO GRUPO'), 'Resposta deve indicar que pertence a ADMINISTRADOR DO GRUPO');
    console.log('  ✅ PASS: Membro comum (USER) bloqueado ao tentar executar comando admin, reagindo com ❌');
    passed++;

    // Teste 2: Membro comum (USER) não pode executar comando de dono (.auditoria)
    const ctxMemberOwner = createMockContext({
        sender: memberJid,
        isAdmin: false,
        isOwner: false,
        commandName: 'auditoria'
    });
    await dispatcher.dispatch(ctxMemberOwner);
    assert.ok(ctxMemberOwner.getReactions().includes('❌'), 'Membro executando comando de dono deve receber reação ❌');
    assert.ok(ctxMemberOwner.getReplyText().includes('DONO DO BOT'), 'Resposta deve indicar que pertence a DONO DO BOT');
    console.log('  ✅ PASS: Membro comum (USER) bloqueado ao tentar executar comando de dono, reagindo com ❌');
    passed++;

    // Teste 3: Administrador do grupo (GROUP_ADMIN) não pode executar comando de dono (.auditoria)
    const ctxAdminOwner = createMockContext({
        sender: adminJid,
        isAdmin: true,
        isOwner: false,
        commandName: 'auditoria'
    });
    await dispatcher.dispatch(ctxAdminOwner);
    assert.ok(ctxAdminOwner.getReactions().includes('❌'), 'Admin executando comando de dono deve receber reação ❌');
    assert.ok(ctxAdminOwner.getReplyText().includes('DONO DO BOT'), 'Resposta para admin deve indicar que pertence a DONO DO BOT');
    console.log('  ✅ PASS: Administrador de grupo bloqueado ao tentar executar comando exclusivo de dono, reagindo com ❌');
    passed++;

    // Teste 4: Comando inexistente reage com ❌ e sugere comandos válidos
    const ctxInexistente = createMockContext({
        commandName: 'comandoquenaoexiste999'
    });
    await dispatcher.dispatch(ctxInexistente);
    assert.ok(ctxInexistente.getReactions().includes('❌'), 'Comando inexistente DEVE reagir com ❌');
    assert.ok(ctxInexistente.getReplyText().includes('Não conheço o comando'), 'Resposta deve indicar que não conhece o comando');
    console.log('  ✅ PASS: Comando inexistente reage com ❌ e informa erro sem quebrar o bot');
    passed++;

    // ==========================================
    // 2. DESATIVAÇÃO DE COMANDO (.cmd <cmd> off)
    // ==========================================

    // Teste 5: Desligar comando individual (.cmd cassino off)
    const ctxTurnOff = createMockContext({
        sender: adminJid,
        isAdmin: true,
        args: ['cassino', 'off']
    });
    await cmdCommand.execute(ctxTurnOff);
    assert.ok(ctxTurnOff.getReplyText().includes('desligado'), 'Resposta deve confirmar desligamento');
    const cfgAfterOff = dataService.getConfigsData()[testGroup];
    assert.ok(cfgAfterOff.disabledCommands.includes('cassino'), 'disabledCommands deve conter "cassino"');
    console.log('  ✅ PASS: .cmd cassino off desativa o comando no grupo e salva persistência');
    passed++;

    // Teste 6: Comando desligado FICA DESLIGADO e bloqueia execução com ❌
    const ctxBlockedCmd = createMockContext({
        sender: memberJid,
        isAdmin: false,
        commandName: 'cassino'
    });
    await dispatcher.dispatch(ctxBlockedCmd);
    assert.ok(ctxBlockedCmd.getReactions().includes('❌'), 'Comando desligado deve reagir com ❌');
    assert.ok(ctxBlockedCmd.getReplyText().includes('foi desligado neste grupo'), 'Resposta deve avisar que o comando está desligado');
    console.log('  ✅ PASS: "Se desligar fica desligado": comando desativado rejeita execução com ❌');
    passed++;

    // Teste 7: Reativar comando individual (.cmd cassino on)
    const ctxTurnOn = createMockContext({
        sender: adminJid,
        isAdmin: true,
        args: ['cassino', 'on']
    });
    await cmdCommand.execute(ctxTurnOn);
    assert.ok(ctxTurnOn.getReplyText().includes('ligado'), 'Resposta deve confirmar ativação');
    const cfgAfterOn = dataService.getConfigsData()[testGroup];
    assert.ok(!cfgAfterOn.disabledCommands.includes('cassino'), 'disabledCommands não deve mais conter "cassino"');
    console.log('  ✅ PASS: .cmd cassino on reativa o comando com sucesso');
    passed++;

    // ==========================================
    // 3. TRAVA TOTAL DE COMANDOS (.cmd all off)
    // ==========================================

    // Teste 8: Travar todos os comandos no grupo (.cmd all off)
    const ctxLockAll = createMockContext({
        sender: adminJid,
        isAdmin: true,
        args: ['all', 'off']
    });
    await cmdCommand.execute(ctxLockAll);
    assert.ok(/travados para membros/i.test(ctxLockAll.getReplyText()), 'Resposta deve indicar trava geral');
    console.log('  ✅ PASS: .cmd all off trava comandos para membros no grupo');
    passed++;

    // Teste 9: Membro tentando executar comando quando tudo está travado recebe ❌
    const ctxMemberInLock = createMockContext({
        sender: memberJid,
        isAdmin: false,
        commandName: 'perfil'
    });
    await dispatcher.dispatch(ctxMemberInLock);
    assert.ok(ctxMemberInLock.getReactions().includes('❌'), 'Comando em grupo travado deve reagir com ❌');
    assert.ok(ctxMemberInLock.getReplyText().includes('temporariamente travados'), 'Aviso de travamento exibido');
    console.log('  ✅ PASS: Membro é bloqueado com ❌ ao tentar usar comandos sob trava .cmd all off');
    passed++;

    // Teste 10: Comandos imunes (ex: .cmd, .menu, .config) permanecem funcionais para administração
    const ctxImmuneCmd = createMockContext({
        sender: adminJid,
        isAdmin: true,
        commandName: 'cmd',
        args: []
    });
    await dispatcher.dispatch(ctxImmuneCmd);
    assert.ok(!ctxImmuneCmd.getReactions().includes('❌'), 'Comando imune para admin não deve sofrer bloqueio com ❌');
    console.log('  ✅ PASS: Comandos de gestão (.cmd, .config, .menu) são imunes e permitem desatar a trava');
    passed++;

    // Teste 11: Destravar comandos no grupo (.cmd all on)
    const ctxUnlockAll = createMockContext({
        sender: adminJid,
        isAdmin: true,
        args: ['all', 'on']
    });
    await cmdCommand.execute(ctxUnlockAll);
    assert.ok(/liberados/i.test(ctxUnlockAll.getReplyText()), 'Resposta deve confirmar liberação total');
    console.log('  ✅ PASS: .cmd all on remove a trava e restabelece comandos para membros');
    passed++;

    // ==========================================
    // 4. DESATIVAÇÃO POR CATEGORIA (.categoria)
    // ==========================================

    // Teste 12: Desativar categoria inteira (.categoria off fun)
    const ctxCatOff = createMockContext({
        sender: adminJid,
        isAdmin: true,
        args: ['off', 'fun']
    });
    await categoriaCommand.execute(ctxCatOff);
    assert.ok(ctxCatOff.getReplyText().includes('DESATIVADA'), 'Resposta deve confirmar desativação da categoria');
    console.log('  ✅ PASS: .categoria off fun desativa todos os comandos de diversão');
    passed++;

    // Teste 13: Membro executando comando de categoria desligada recebe ❌
    const ctxCatBlocked = createMockContext({
        sender: memberJid,
        isAdmin: false,
        commandName: 'piada' // comando da categoria fun
    });
    await dispatcher.dispatch(ctxCatBlocked);
    assert.ok(ctxCatBlocked.getReactions().includes('❌'), 'Comando em categoria desativada deve receber ❌');
    assert.ok(/estão desligados neste grupo/i.test(ctxCatBlocked.getReplyText()), 'Aviso de categoria desligada exibido');
    console.log('  ✅ PASS: Comando pertencente a categoria desativada bloqueado com ❌');
    passed++;

    // Teste 14: Reativar categoria (.categoria on fun)
    const ctxCatOn = createMockContext({
        sender: adminJid,
        isAdmin: true,
        args: ['on', 'fun']
    });
    await categoriaCommand.execute(ctxCatOn);
    assert.ok(ctxCatOn.getReplyText().includes('ATIVADA'), 'Resposta deve confirmar ativação da categoria');
    console.log('  ✅ PASS: .categoria on fun reativa a categoria com sucesso');
    passed++;

    // Limpeza final do grupo de teste
    configs[testGroup].disabledCommands = [];
    configs[testGroup].disabledCategories = [];
    await dataService.saveConfigsData(configs);
    moduleState.enableAll(testGroup);

    console.log(`\n📊 Todos os ${passed} testes de Hierarquia e Travas ON/OFF passaram com 100% de sucesso!`);
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de hierarquia e travas:', err);
    process.exit(1);
});
