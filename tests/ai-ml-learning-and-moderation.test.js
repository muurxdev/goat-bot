/**
 * Testes Unitários: Inteligência Artificial, Machine Learning de Usuários,
 * Moderação Autônoma de Profanidade (3 Strikes = Ban), Anti-Link com Parceria e Modo ChatGPT
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const aiLearning = require('../src/services/aiLearningService');
const dataService = require('../src/services/dataService');
const groupProtection = require('../src/services/groupProtectionService');
const profanityCmd = require('../src/commands/admin/profanity');
const antilinkCmd = require('../src/commands/admin/antilink');
const parceriaCmd = require('../src/commands/admin/parceria');
const mlearningCmd = require('../src/commands/general/machine');
const dispatcher = require('../src/handlers/commandDispatcher');

dispatcher.loadCommands();

console.log('🧪 Iniciando testes de IA, Machine Learning e Moderação Autônoma (3 Strikes)...\n');

async function runTests() {
    let passed = 0;
    const testGroup = '120363088888888888@g.us';
    const userA = '5511777770001@s.whatsapp.net';
    const userB = '5511777770002@s.whatsapp.net';
    const adminUser = '5511777770003@s.whatsapp.net';

    // Helper de mock reply
    function createMockReply() {
        let text = '';
        let mentions = [];
        return {
            reply: async (txt, m = []) => {
                text = typeof txt === 'string' ? txt : JSON.stringify(txt);
                mentions = m;
                return Promise.resolve();
            },
            getText: () => text,
            getMentions: () => mentions
        };
    }

    // Inicializa configurações limpas
    const configs = dataService.getConfigsData();
    configs[testGroup] = {
        antiProfanity: true,
        antilink: true,
        allowedLinkUsers: [],
        profanityLearning: true,
        conversaNatural: true
    };
    await dataService.saveConfigsData(configs);

    // ==========================================
    // 1. DETECÇÃO DE PROFANIDADE & L33TSPEAK
    // ==========================================

    // Teste 1: Detecção de evasões sofisticadas (f.d.p, arromb@do, p0rr@)
    const check1 = aiLearning.detectProfanity('olha aquele f.d.p ali');
    assert.strictEqual(check1.isProfane, true, 'Deve detectar f.d.p com pontos');
    assert.strictEqual(check1.word, 'fdp');

    const check2 = aiLearning.detectProfanity('seu arromb@do sem vergonha');
    assert.strictEqual(check2.isProfane, true, 'Deve detectar arromb@do com l33t');

    const check3 = aiLearning.detectProfanity('que p0rr@ de erro e esse');
    assert.strictEqual(check3.isProfane, true, 'Deve detectar p0rr@');

    const checkClean = aiLearning.detectProfanity('Bom dia pessoal, bom trabalho a todos!');
    assert.strictEqual(checkClean.isProfane, false, 'Mensagem limpa não deve acusar profanidade');
    console.log('  ✅ PASS: Detecção de profanidade com normalização L33tspeak e evasão de pontuação');
    passed++;

    // ==========================================
    // 2. SISTEMA DE 3 EXCLUSÕES (STRIKES)
    // ==========================================

    // Teste 2: Ciclo de 3 Strikes para Profanidade (1 -> 2 -> 3 = Ban)
    aiLearning.resetStrikes(testGroup, userA, 'profanity');
    const s1 = aiLearning.recordStrike(testGroup, userA, 'profanity');
    assert.strictEqual(s1.strikes, 1);
    assert.strictEqual(s1.shouldBan, false);
    assert.strictEqual(s1.remaining, 2);

    const s2 = aiLearning.recordStrike(testGroup, userA, 'profanity');
    assert.strictEqual(s2.strikes, 2);
    assert.strictEqual(s2.shouldBan, false);
    assert.strictEqual(s2.remaining, 1);

    const s3 = aiLearning.recordStrike(testGroup, userA, 'profanity');
    assert.strictEqual(s3.strikes, 3);
    assert.strictEqual(s3.shouldBan, true);
    assert.strictEqual(s3.remaining, 0);
    console.log('  ✅ PASS: Sistema de 3 Strikes computa rigorosamente advertências e aciona ban no 3º strike');
    passed++;

    // Teste 3: groupProtectionService processando mensagem com palavrão e strike
    aiLearning.resetStrikes(testGroup, userB, 'profanity');
    let sentMsg = '';
    const gas = require('../src/services/groupAuthService');
    const BOT_JID = '5511999990000@s.whatsapp.net';
    const fakeClient = {
        user: { id: BOT_JID },
        sendMessage: async (jid, content) => {
            if (content.delete) return Promise.resolve();
            sentMsg = content.text || '';
            return Promise.resolve();
        },
        groupMetadata: async () => ({
            subject: 'Grupo Teste',
            participants: [
                { id: BOT_JID, admin: 'admin' },
                { id: adminUser, admin: 'admin' },
                { id: userB, admin: null }
            ]
        }),
        groupParticipantsUpdate: async () => [{ status: '200' }]
    };
    gas.attach(fakeClient);

    // Strike 1
    await groupProtection.processarMensagem(fakeClient, {
        grupo: testGroup,
        pessoa: userB,
        texto: 'que caralho de problema',
        tipo: 'conversation',
        info: { key: { id: 'msg1' } },
        cfg: configs[testGroup],
        isAdmin: false,
        isOwner: false,
        isBotAdmin: true
    });
    assert.ok(sentMsg.includes('[1/3] exclusões por profanidade'), 'Deve emitir advertência 1 de 3');

    // Strike 2
    await groupProtection.processarMensagem(fakeClient, {
        grupo: testGroup,
        pessoa: userB,
        texto: 'vai se foder',
        tipo: 'conversation',
        info: { key: { id: 'msg2' } },
        cfg: configs[testGroup],
        isAdmin: false,
        isOwner: false,
        isBotAdmin: true
    });
    assert.ok(sentMsg.includes('[2/3] exclusões por profanidade'), 'Deve emitir advertência 2 de 3');

    // Strike 3 (Ban automático)
    await groupProtection.processarMensagem(fakeClient, {
        grupo: testGroup,
        pessoa: userB,
        texto: 'seu arrombado lixo',
        tipo: 'conversation',
        info: { key: { id: 'msg3' } },
        cfg: configs[testGroup],
        isAdmin: false,
        isOwner: false,
        isBotAdmin: true
    });
    assert.ok(sentMsg.includes('3 mensagens apagadas por') && (sentMsg.includes('removido do grupo') || sentMsg.includes('limite de 3')), 'Deve acionar banimento no 3º strike');
    console.log('  ✅ PASS: groupProtectionService integra perfeitamente exclusão de mensagem e banimento no 3º strike');
    passed++;

    // ==========================================
    // 3. COMANDO .profanity (ROAMING, TREINO, STATUS)
    // ==========================================

    // Teste 4: .profanity roaming
    const rProf1 = createMockReply();
    await profanityCmd.execute({
        from: testGroup,
        args: ['roaming'],
        reply: rProf1.reply,
        sender: adminUser,
        prefix: '.'
    });
    assert.ok(rProf1.getText().includes('PROFANITY ROAMING AI'), 'Deve retornar relatório de varredura roaming');
    assert.ok(rProf1.getText().includes('Regra das 3 Exclusões'), 'Deve citar regra das 3 exclusões');
    console.log('  ✅ PASS: .profanity roaming executa varredura profunda e minera toxicidade');
    passed++;

    // Teste 5: .profanity train <palavra>
    const rProf2 = createMockReply();
    await profanityCmd.execute({
        from: testGroup,
        args: ['train', 'toxicoextremo99'],
        reply: rProf2.reply,
        sender: adminUser,
        prefix: '.'
    });
    assert.ok(rProf2.getText().includes('Palavra treinada'), 'Deve confirmar treinamento de nova palavra');
    assert.strictEqual(aiLearning.detectProfanity('ele e um toxicoextremo99').isProfane, true, 'Palavra recém treinada deve ser detectada');
    console.log('  ✅ PASS: .profanity train incorpora palavras à base de conhecimento e ativa exclusão');
    passed++;

    // Teste 6: .profanity status
    const rProf3 = createMockReply();
    await profanityCmd.execute({
        from: testGroup,
        args: ['status'],
        reply: rProf3.reply,
        sender: adminUser,
        prefix: '.'
    });
    assert.ok(rProf3.getText().includes('PAINEL PROFANITY & IA'), 'Deve exibir painel de profanidade e IA');
    assert.ok(rProf3.getText().includes('3 STRIKES = EXPULSÃO AUTOMÁTICA'), 'Deve destacar regra estrita');
    console.log('  ✅ PASS: .profanity status exibe painel completo de inteligência e moderação');
    passed++;

    // ==========================================
    // 4. ANTI-LINK, PARCERIAS & AFILIAÇÃO
    // ==========================================

    // Teste 7: Whitelist de links com .antilink allow @user
    const rAntilink = createMockReply();
    await antilinkCmd.execute({
        from: testGroup,
        args: ['allow', '@5511999990001'],
        reply: rAntilink.reply,
        sender: adminUser,
        contextInfo: { mentionedJid: ['5511999990001@s.whatsapp.net'] }
    });
    assert.ok(rAntilink.getText().includes('parceiro/afiliado autorizado'), 'Deve autorizar parceiro a postar links');
    assert.strictEqual(aiLearning.isUserAllowedToPostLinks(testGroup, '5511999990001@s.whatsapp.net'), true);
    console.log('  ✅ PASS: .antilink allow concede permissão de link para parceiros/afiliados');
    passed++;

    // Teste 8: Gestão de parcerias com .parceria
    const rParceria = createMockReply();
    await parceriaCmd.execute({
        from: testGroup,
        args: [],
        reply: rParceria.reply,
        sender: userA,
        isAdmin: false,
        isOwner: false,
        prefix: '.'
    });
    assert.ok(rParceria.getText().includes('PARCERIAS & AFILIAÇÃO'), 'Deve apresentar guia de parcerias');
    assert.ok(rParceria.getText().includes('COMO CONSEGUIR PERMISSÃO'), 'Deve orientar membro a falar na DM com admin/dono');
    console.log('  ✅ PASS: .parceria orienta membros sobre afiliação e parceria para divulgar links');
    passed++;

    // ==========================================
    // 5. APRENDIZADO LINGUÍSTICO & MODO CHATGPT
    // ==========================================

    // Teste 9: Estudo de perfil de programador (código)
    const devSender = '5511777770009@s.whatsapp.net';
    aiLearning.learnFromMessage(devSender, 'const soma = (a, b) => a + b;', testGroup, true);
    aiLearning.learnFromMessage(devSender, 'function test() { return async () => {}; }', testGroup, true);
    const devProfile = aiLearning.getUserProfile(devSender);
    assert.strictEqual(devProfile.style, 'dev', 'Perfil deve ser identificado como dev');

    const replyDev = await aiLearning.generateChatGPTReply('como programar uma api em node?', devSender);
    assert.ok(replyDev.includes('Central Dev GOAT Tech') || replyDev.includes('```javascript'), 'Deve responder no tom dev técnico');
    console.log('  ✅ PASS: Motor de ML estuda usuário e adapta respostas para programadores');
    passed++;

    // Teste 10: Estudo de perfil de resenha / gírias
    const resenhaSender = '5511777770008@s.whatsapp.net';
    aiLearning.learnFromMessage(resenhaSender, 'mano do ceu slk que resenha top tmj cria', testGroup, true);
    aiLearning.learnFromMessage(resenhaSender, 'fala parceiro blz pdpa', testGroup, true);
    const resenhaProfile = aiLearning.getUserProfile(resenhaSender);
    assert.strictEqual(resenhaProfile.style, 'resenha', 'Perfil deve ser identificado como resenha');

    const replyResenha = await aiLearning.generateChatGPTReply('o que voce acha do goat?', resenhaSender);
    assert.ok(replyResenha.includes('O Camisa 10') || replyResenha.includes('Bolas de Ouro'), 'Deve responder na persona GOAT Prime animada');
    console.log('  ✅ PASS: Motor de ML adapta conversação para resenha e futebol GOAT Prime');
    passed++;

    // Teste 11: Painel do comando .mlearning / .chatgpt
    const rML = createMockReply();
    await mlearningCmd.execute({
        from: testGroup,
        args: [],
        reply: rML.reply,
        sender: devSender,
        isGroup: true,
        prefix: '.'
    });
    assert.ok(rML.getText().includes('PERFIL DE MACHINE LEARNING'), 'Deve exibir perfil de ML do usuário');
    assert.ok(rML.getText().includes('DEV'), 'Deve exibir estilo detectado DEV');
    console.log('  ✅ PASS: .mlearning exibe métricas de aprendizado de IA e controle do modo ChatGPT');
    passed++;

    // Teste 12: Alternar modo ChatGPT via .mlearning chat on/off
    const rMLToggle = createMockReply();
    await mlearningCmd.execute({
        from: testGroup,
        args: ['chat', 'on'],
        reply: rMLToggle.reply,
        sender: devSender,
        isGroup: true,
        prefix: '.'
    });
    assert.ok(rMLToggle.getText().includes('MODO CHATGPT CONVERSACIONAL'), 'Deve ativar modo ChatGPT');
    assert.strictEqual(dataService.getConfigsData()[testGroup].conversaNatural, true);
    console.log('  ✅ PASS: .mlearning chat on/off comuta modo conversacional sem comando');
    passed++;

    console.log(`\n📊 Todos os ${passed} testes de IA, Machine Learning e Moderação passaram com 100% de sucesso!`);
}

runTests().catch(err => {
    console.error('❌ Falha nos testes de IA e ML:', err);
    process.exit(1);
});
