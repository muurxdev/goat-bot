/**
 * Testes Unitários: Painel Unificado de Configurações (.config),
 * Mensagens Automáticas e Menu Especializado de Grupos (.menugrupo)
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const configCmd = require('../src/commands/admin/config');
const menuGrupoCmd = require('../src/commands/general/menugrupo');
const dataService = require('../src/services/dataService');
const dispatcher = require('../src/handlers/commandDispatcher');

dispatcher.loadCommands();

console.log('🧪 Iniciando testes de Configurações Unificadas e Menus de Grupo...\n');

async function runTests() {
    let passed = 0;
    const testJid = '999999999999@g.us';
    let replyMsg = '';
    const fakeReply = (msg) => {
        replyMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
        return Promise.resolve();
    };

    // Teste 1: Painel Geral (.config) exibe todas as mensagens automáticas e rotinas
    await configCmd.execute({
        from: testJid,
        args: [],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });

    assert.ok(replyMsg.includes('MENSAGENS AUTOMÁTICAS'), 'Deve conter seção de mensagens automáticas');
    assert.ok(replyMsg.includes('Abertura'), 'Deve conter status de abertura');
    assert.ok(replyMsg.includes('Fechamento'), 'Deve conter status de fechamento');
    assert.ok(replyMsg.includes('Boas-Vindas'), 'Deve conter status de boas-vindas');
    assert.ok(replyMsg.includes('Despedida'), 'Deve conter status de despedida');
    assert.ok(replyMsg.includes('ROTINAS & AUTONOMIA'), 'Deve conter seção de rotinas');
    assert.ok(replyMsg.includes('Agenda Automática'), 'Deve conter agenda automática');
    assert.ok(replyMsg.includes('Conteúdo Autônomo'), 'Deve conter conteúdo autônomo');
    // Seção renomeada em 2026-10-26 (b225738d): "SEGURANÇA & ESCUDOS"; o preset continua na linha "Preset Ativo".
    assert.ok(replyMsg.includes('SEGURANÇA & ESCUDOS') && replyMsg.includes('Preset Ativo'), 'Deve conter escudos e presets');
    console.log('  ✅ PASS: Painel geral .config consolida 100% das mensagens automáticas e rotinas');
    passed++;

    // Teste 2: Configuração e ativação de abertura via .config abertura on / msg
    await configCmd.execute({
        from: testJid,
        args: ['abertura', 'msg', 'Bom dia guerreiros! Grupo liberado!'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    let cfg = dataService.getConfigsData()[testJid];
    assert.strictEqual(cfg.aberturaMsg, 'Bom dia guerreiros! Grupo liberado!');
    assert.strictEqual(cfg.abertura, true);

    await configCmd.execute({
        from: testJid,
        args: ['preview'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'configabertura'
    });
    assert.ok(replyMsg.includes('Bom dia guerreiros! Grupo liberado!'), 'Preview deve refletir mensagem salva');
    console.log('  ✅ PASS: .config abertura permite salvar texto personalizado e visualizar preview');
    passed++;

    // Teste 3: Configuração de Fechamento via .config fechamento
    await configCmd.execute({
        from: testJid,
        args: ['fechamento', 'msg', 'Boa noite! Grupo trancado para descanso.'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    cfg = dataService.getConfigsData()[testJid];
    assert.strictEqual(cfg.fechamentoMsg, 'Boa noite! Grupo trancado para descanso.');

    await configCmd.execute({
        from: testJid,
        args: ['preview'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'configfechamento'
    });
    assert.ok(replyMsg.includes('Boa noite! Grupo trancado para descanso.'));
    console.log('  ✅ PASS: .config fechamento permite customização e validação');
    passed++;

    // Teste 4: Boas-Vindas e Despedida no .config
    await configCmd.execute({
        from: testJid,
        args: ['boasvindas', 'on'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    cfg = dataService.getConfigsData()[testJid];
    assert.strictEqual(cfg.welcome, true);

    await configCmd.execute({
        from: testJid,
        args: ['despedida', 'on'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    cfg = dataService.getConfigsData()[testJid];
    assert.strictEqual(cfg.leave, true);
    console.log('  ✅ PASS: .config boasvindas e .config despedida ativando módulos perfeitamente');
    passed++;

    // Teste 5: Menu Especializado de Grupos (.menugrupo)
    await menuGrupoCmd.execute({
        from: testJid,
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        prefix: '.'
    });
    assert.ok(replyMsg.includes('COMANDOS DE GRUPO // GOAT 10'));
    assert.ok(replyMsg.includes('ABERTURA & FECHAMENTO'));
    assert.ok(replyMsg.includes('CONFIGURAÇÕES & MENSAGENS'));
    assert.ok(replyMsg.includes('SEGURANÇA & PRESETS'));
    assert.ok(replyMsg.includes('MODERAÇÃO DE MEMBROS'));
    assert.ok(replyMsg.includes('COMUNICAÇÃO & ENGAJAMENTO'));
    assert.ok(replyMsg.includes('AUTONOMIA SKYCODE'));
    assert.ok(replyMsg.includes('.config'));
    assert.ok(replyMsg.includes('.preset'));
    console.log('  ✅ PASS: .menugrupo mapeia integralmente os comandos de grupo organizados na régua');
    passed++;

    // Teste 6: Atalhos no Dispatcher
    const aliases = ['configabertura', 'configfechamento', 'configboasvindas', 'configagenda', 'configpreset', 'menugrupo', 'grupomenu', 'comandosgrupo', 'configfigurinhas', 'configfigurinha', 'configstickers'];
    for (const a of aliases) {
        const found = dispatcher.findCommand(a);
        assert.ok(found, `Alias .${a} deve resolver com sucesso no dispatcher`);
    }
    console.log('  ✅ PASS: Todos os 11 novos atalhos de configuração, figurinhas e menu de grupo ativos no JIT');
    passed++;

    // Teste 7: Validação de Diferenciação Absoluta de Figurinhas vs Wallpapers
    const figurinhaService = require('../src/services/figurinhaEventoService');
    const difCheck = figurinhaService.verificarDiferenciacao();
    assert.strictEqual(difCheck.colisoes, 0, 'Nenhuma figurinha pode colidir com wallpapers de mensagens automáticas');
    assert.ok(difCheck.totalFigurinhas >= 15, 'Deve possuir acervo robusto de figurinhas exclusivas');
    console.log(`  ✅ PASS: 100% das ${difCheck.totalFigurinhas} figurinhas de eventos são rigorosamente distintas dos wallpapers (0 colisões)`);
    passed++;

    // Teste 8: Rotação e Anti-Repetição de Figurinhas
    const fakeClient = {
        sentStickers: [],
        sendMessage: async (jid, payload) => {
            if (payload.sticker) {
                fakeClient.sentStickers.push(payload.sticker);
            }
            return { key: { id: 'FAKE_MSG_ID' } };
        }
    };

    // Envio 1
    await figurinhaService.enviar(fakeClient, testJid, 'boasvindas', { forcar: true });
    // Envio 2
    await figurinhaService.enviar(fakeClient, testJid, 'boasvindas', { forcar: true });
    assert.strictEqual(fakeClient.sentStickers.length, 2, 'Deve ter enviado 2 figurinhas');
    assert.notDeepStrictEqual(fakeClient.sentStickers[0], fakeClient.sentStickers[1], 'Figurinhas consecutivas no mesmo grupo não devem repetir');
    console.log('  ✅ PASS: Rotação ativa garante figurinhas diferentes e sem repetição imediata no grupo');
    passed++;

    // Teste 9: Controle Granular de Figurinhas via .config
    await configCmd.execute({
        from: testJid,
        args: ['boasvindas', 'figurinha', 'off'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    cfg = dataService.getConfigsData()[testJid];
    assert.strictEqual(cfg.welcomeFigurinha, false);

    await configCmd.execute({
        from: testJid,
        args: ['boasvindas', 'figurinha', 'on'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    cfg = dataService.getConfigsData()[testJid];
    assert.strictEqual(cfg.welcomeFigurinha, true);

    await configCmd.execute({
        from: testJid,
        args: ['despedida', 'figurinha', 'off'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    cfg = dataService.getConfigsData()[testJid];
    assert.strictEqual(cfg.leaveFigurinha, false);

    await configCmd.execute({
        from: testJid,
        args: ['figurinhas', 'status'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    assert.ok(replyMsg.includes('CONFIG: FIGURINHAS DE EVENTOS'), 'Deve abrir tela de figurinhas');
    assert.ok(replyMsg.includes('Diferenciação de Mídia'), 'Deve mostrar garantia de diferenciação de wallpapers');
    console.log('  ✅ PASS: .config permite alternar figurinhas de entrada, saída e exibir status de diferenciação');
    passed++;

    // Teste 10: .config agenda com edição completa de mensagens (paridade total com boas-vindas)
    const scheduleService = require('../src/services/groupScheduleService');
    await configCmd.execute({
        from: testJid,
        args: ['agenda', 'on'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    let sched = scheduleService.getSchedule(testJid);
    assert.strictEqual(sched.enabled, true, 'Agenda deve estar ativada');

    await configCmd.execute({
        from: testJid,
        args: ['agenda', 'msgfechar', '🔒 Grupo fechado pela gerência! Bom descanso a todos!'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    sched = scheduleService.getSchedule(testJid);
    assert.strictEqual(sched.closeMsg, '🔒 Grupo fechado pela gerência! Bom descanso a todos!');

    await configCmd.execute({
        from: testJid,
        args: ['agenda', 'msgabrir', '🔓 Bom dia campeões! O grupo está aberto novamente!'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    sched = scheduleService.getSchedule(testJid);
    assert.strictEqual(sched.openMsg, '🔓 Bom dia campeões! O grupo está aberto novamente!');

    await configCmd.execute({
        from: testJid,
        args: ['agenda', 'preview'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    assert.ok(replyMsg.includes('CONFIG: AGENDA AUTOMÁTICA'), 'Preview deve exibir painel de agenda');
    assert.ok(replyMsg.includes('Grupo fechado pela gerência'), 'Preview deve incluir msgfechar personalizada');
    assert.ok(replyMsg.includes('Bom dia campeões'), 'Preview deve incluir msgabrir personalizada');

    await configCmd.execute({
        from: testJid,
        args: ['agenda', 'reset'],
        reply: fakeReply,
        sender: '551199999999@s.whatsapp.net',
        commandName: 'config'
    });
    sched = scheduleService.getSchedule(testJid);
    assert.strictEqual(sched.closeMsg, null, 'closeMsg deve ser null após reset');
    assert.strictEqual(sched.openMsg, null, 'openMsg deve ser null após reset');
    console.log('  ✅ PASS: .config agenda permite ativar, editar mensagens de abrir/fechar, ver prévia e resetar');
    passed++;

    // Teste 11: Reação com ❌ em comandos inexistentes (não-reconhecidos)
    let reacoesEnviadas = [];
    const mockContextInexistente = {
        from: testJid,
        sender: '551199999999@s.whatsapp.net',
        isGroup: true,
        commandName: 'comandoquenaoexiste999xyz',
        args: [],
        reply: fakeReply,
        react: async (emoji) => {
            reacoesEnviadas.push(emoji);
        }
    };
    await dispatcher.dispatch(mockContextInexistente);
    assert.ok(reacoesEnviadas.includes('❌'), 'Comando inexistente deve reagir com ❌');
    assert.ok(!reacoesEnviadas.includes('✅'), 'Comando inexistente JAMAIS deve reagir com ✅');
    console.log('  ✅ PASS: Comando inexistente reage com ❌ e nunca com ✅');
    passed++;

    // Teste 12: Reação com ❌ quando um comando falha em validação ou retorna erro
    reacoesEnviadas = [];
    const mockContextErro = {
        from: testJid,
        sender: '551199999999@s.whatsapp.net',
        isGroup: true,
        isAdmin: true,
        isBotAdmin: true,
        isOwner: true,
        commandName: 'kick',
        args: [], // sem marcar ninguém -> comando responde com ❌ de validação
        reply: async (txt) => {
            replyMsg = txt;
        },
        react: async (emoji) => {
            reacoesEnviadas.push(emoji);
        }
    };
    await dispatcher.dispatch(mockContextErro);
    assert.ok(reacoesEnviadas.includes('❌'), 'Comando com validação/erro deve reagir com ❌');
    assert.ok(!reacoesEnviadas.includes('✅'), 'Comando com validação/erro JAMAIS deve reagir com ✅');
    console.log('  ✅ PASS: Comando com erro de validação/argumento reage com ❌ e nunca com ✅');
    passed++;

    // Teste 13: Reação com ✅ apenas em execuções bem-sucedidas
    reacoesEnviadas = [];
    const mockContextSucesso = {
        from: testJid,
        sender: '551199999999@s.whatsapp.net',
        isGroup: true,
        isAdmin: true,
        isOwner: true,
        commandName: 'ping',
        args: [],
        reply: async (txt) => {
            replyMsg = txt;
        },
        react: async (emoji) => {
            reacoesEnviadas.push(emoji);
        }
    };
    await dispatcher.dispatch(mockContextSucesso);
    assert.ok(reacoesEnviadas.includes('✅'), 'Comando executado com sucesso deve reagir com ✅');
    console.log('  ✅ PASS: Comando executado com sucesso conclui ciclo com ✅');
    passed++;

    console.log(`\n📊 Todos os ${passed} testes de Configuração, Menus e Figurinhas passaram com 100% de sucesso!`);
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de configuração:', err);
    process.exit(1);
});
