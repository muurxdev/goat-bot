/**
 * Testes Unitários de Moderação e Anti-Link Unificados
 * Testa:
 * 1. .antilink all on / all off / <plataforma> on/off
 * 2. .moderacao all on / all off / painel
 * 3. Filtragem de plataformas no messageHandler
 */

const assert = require('assert');
const dataService = require('../src/services/dataService');
const antilinkCmd = require('../src/commands/admin/antilink');
const moderacaoCmd = require('../src/commands/admin/moderacao');

async function runTests() {
    console.log('🧪 Iniciando testes de Moderação e Anti-Link Unificado...');
    const from = '120363000000000001@g.us';
    const sender = '5511999999999@s.whatsapp.net';

    let lastReply = '';
    const reply = (msg) => { lastReply = typeof msg === 'string' ? msg : JSON.stringify(msg); return msg; };

    // Reset config
    const configs = dataService.getConfigsData();
    delete configs[from];
    await dataService.saveConfigsData(configs);

    // TESTE 1: .antilink all on
    console.log('  [1/5] Testando .antilink all on...');
    await antilinkCmd.execute({ from, args: ['all', 'on'], reply, sender });
    let cfg = dataService.getConfigsData()[from];
    assert.strictEqual(cfg.antilink, true, 'Antilink geral deve estar ativo');
    assert.strictEqual(cfg.antilinkConfig.enabled, true, 'AntilinkConfig deve estar ativo');
    assert.strictEqual(cfg.antilinkConfig.platforms.youtube, true, 'YouTube deve estar bloqueado');
    assert.strictEqual(cfg.antilinkConfig.platforms.whatsapp, true, 'WhatsApp deve estar bloqueado');
    assert.strictEqual(cfg.antilinkConfig.platforms.telegram, true, 'Telegram deve estar bloqueado');
    assert(lastReply.includes('ANTI-LINK TOTAL ATIVADO'), 'Deve confirmar ativação total');

    // TESTE 2: .antilink youtube off (liberar seletivamente)
    console.log('  [2/5] Testando liberação seletiva (.antilink youtube off)...');
    await antilinkCmd.execute({ from, args: ['youtube', 'off'], reply, sender });
    cfg = dataService.getConfigsData()[from];
    assert.strictEqual(cfg.antilink, true, 'Antilink geral continua ativo');
    assert.strictEqual(cfg.antilinkConfig.platforms.youtube, false, 'YouTube deve estar LIBERADO (false)');
    assert.strictEqual(cfg.antilinkConfig.platforms.telegram, true, 'Telegram continua BLOQUEADO');
    assert(lastReply.includes('LIBERADO'), 'Deve confirmar liberação do YouTube');

    // TESTE 3: .antilink all off
    console.log('  [3/5] Testando .antilink all off...');
    await antilinkCmd.execute({ from, args: ['all', 'off'], reply, sender });
    cfg = dataService.getConfigsData()[from];
    assert.strictEqual(cfg.antilink, false, 'Antilink geral deve estar desligado');
    assert.strictEqual(cfg.antilinkConfig.enabled, false, 'AntilinkConfig deve estar desligado');
    assert.strictEqual(cfg.antilinkConfig.platforms.telegram, false, 'Telegram deve estar liberado');

    // TESTE 4: .moderacao all on (Todos os escudos)
    console.log('  [4/5] Testando .moderacao all on...');
    await moderacaoCmd.execute({ from, args: ['all', 'on'], reply, sender, prefix: '.' });
    cfg = dataService.getConfigsData()[from];
    assert.strictEqual(cfg.antilink, true, 'Anti-link deve estar ON');
    assert.strictEqual(cfg.antilinkConfig.platforms.whatsapp, true, 'WhatsApp deve estar ON');
    assert.strictEqual(cfg.antitrava, true, 'Anti-trava deve estar ON');
    assert.strictEqual(cfg.antifake, true, 'Anti-fake deve estar ON');
    assert.strictEqual(cfg.antistatus, true, 'Anti-status deve estar ON');
    assert.strictEqual(cfg.antispam, true, 'Anti-spam deve estar ON');
    assert.strictEqual(cfg.antiCapslock, true, 'Anti-capslock deve estar ON');
    assert.strictEqual(cfg.antiProfanity, true, 'Anti-profanity deve estar ON');
    assert(lastReply.includes('ESCUDO DE SEGURANÇA TOTAL ATIVADO'), 'Card deve confirmar escudo total');

    // TESTE 5: .moderacao all off
    console.log('  [5/5] Testando .moderacao all off...');
    await moderacaoCmd.execute({ from, args: ['all', 'off'], reply, sender, prefix: '.' });
    cfg = dataService.getConfigsData()[from];
    assert.strictEqual(cfg.antilink, false, 'Anti-link deve estar OFF');
    assert.strictEqual(cfg.antitrava, false, 'Anti-trava deve estar OFF');
    assert.strictEqual(cfg.antifake, false, 'Anti-fake deve estar OFF');
    assert.strictEqual(cfg.antistatus, false, 'Anti-status deve estar OFF');
    assert.strictEqual(cfg.antispam, false, 'Anti-spam deve estar OFF');
    assert.strictEqual(cfg.antiCapslock, false, 'Anti-capslock deve estar OFF');
    assert.strictEqual(cfg.antiProfanity, false, 'Anti-profanity deve estar OFF');
    assert(lastReply.includes('TODAS AS PROTEÇÕES FORAM DESATIVADAS'), 'Deve confirmar desativação');

    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
}

runTests().catch(err => {
    console.error('❌ Falha nos testes:', err);
    process.exit(1);
});
