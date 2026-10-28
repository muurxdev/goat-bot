/**
 * Testes da Remoção Profunda de Donos e Hierarquia Militar (.deldono / .delcargo)
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const {
    getOwners,
    saveOwners,
    findOwnerByQuery,
    canModifyOwner,
    demoteOwnerComplete,
    resolveOwnerProfileDetails,
    updateOwner,
    updateRankTitle
} = require('../src/services/ownerService');
const deldono = require('../src/commands/owner/deldono');
const userRepository = require('../src/database/repositories/userRepository');
const permissionRepository = require('../src/database/repositories/permissionRepository');

async function runTests() {
    console.log('🧪 Iniciando testes de Remoção Profunda de Donos e Hierarquia Militar...');

    // Setup: Cria lista limpa de donos para o teste
    const testOwners = [
        { rank: "Capitão",   level: 5, name: "CrazyGOAT", jid: "5511999990001@s.whatsapp.net", phone: "+55 11 99999-0001", active: true },
        { rank: "Tenente",   level: 4, name: "MuurxSub",      jid: "5511999990002@s.whatsapp.net", phone: "+55 11 99999-0002", active: true, customTitle: "Sub-Comandante" },
        { rank: "Sargento",  level: 3, name: "GuerreiroZ",    jid: "5511999990003@s.whatsapp.net", phone: "+55 11 99999-0003", active: true, appointedBy: "Tenente" },
        { rank: "Cabo",      level: 3, name: "",              jid: "",                             phone: "",                  active: false },
        { rank: "Soldado",   level: 3, name: "",              jid: "",                             phone: "",                  active: false }
    ];
    saveOwners(testOwners);

    // Salva perfil no SQLite para Sargento com display_nick
    const sargentoUser = {
        jid: "5511999990003@s.whatsapp.net",
        name: "João WhatsApp",
        display_nick: "CaveiraMestre",
        displayNick: "CaveiraMestre",
        phone: "+55 11 99999-0003"
    };
    userRepository.saveUser(sargentoUser);
    permissionRepository.setUserRole("5511999990003@s.whatsapp.net", "OWNER", "TEST");
    permissionRepository.setTrusted("5511999990003@s.whatsapp.net", true, "TEST");

    // 1. Testes de findOwnerByQuery
    console.log('--- 1. findOwnerByQuery ---');
    const byRank = findOwnerByQuery('tenente');
    assert.strictEqual(byRank?.rank, 'Tenente', 'Deve achar por patente base');

    const byTitle = findOwnerByQuery('sub-comandante');
    assert.strictEqual(byTitle?.rank, 'Tenente', 'Deve achar por customTitle');

    const byPhone = findOwnerByQuery('5511999990003');
    assert.strictEqual(byPhone?.rank, 'Sargento', 'Deve achar por dígitos de telefone');

    const byNick = findOwnerByQuery('CaveiraMestre');
    assert.strictEqual(byNick?.rank, 'Sargento', 'Deve achar pelo display_nick do perfil no bot');

    const byOwnerName = findOwnerByQuery('MuurxSub');
    assert.strictEqual(byOwnerName?.rank, 'Tenente', 'Deve achar pelo owner.name registrado');

    console.log('  ✅ PASS: findOwnerByQuery resolve por patente, título, telefone, nick do bot e nome do cargo');

    // 2. Testes de canModifyOwner (Hierarquia Militar Rígida)
    console.log('--- 2. canModifyOwner (Hierarquia Militar) ---');
    // Tenente tentando remover Capitão -> Deve falhar (Imunidade)
    const checkCapitaoByTenente = canModifyOwner("5511999990002@s.whatsapp.net", "Capitão");
    assert.strictEqual(checkCapitaoByTenente.allowed, false, 'Tenente NÃO pode remover Capitão');
    assert.ok(checkCapitaoByTenente.reason.includes('só pode ser alterado por ele mesmo'), 'Deve explicar que só o Capitão mexe no Capitão');
    assert.ok(!/IMUNIDADE|Acesso Negado/.test(checkCapitaoByTenente.reason), 'Recusa sem caixa alta');

    // Capitão (nomeado, fora do .env) tentando remover a si mesmo -> Deve falhar
    const checkCapitaoSelf = canModifyOwner("5511999990001@s.whatsapp.net", "Capitão", [], { remocao: true });
    assert.strictEqual(checkCapitaoSelf.allowed, false, 'Capitão NÃO pode remover a própria patente');
    assert.ok(checkCapitaoSelf.reason.includes('própria patente de Capitão'), 'Deve explicar a recusa');

    const naoDono = canModifyOwner("5511000000000@s.whatsapp.net", "Tenente");
    assert.strictEqual(naoDono.allowed, false);
    assert.ok(!/Acesso Negado/.test(naoDono.reason), 'Recusa sem caixa alta');

    // Tenente tentando remover outro Tenente ou a si mesmo -> Deve falhar
    const checkTenenteSelf = canModifyOwner("5511999990002@s.whatsapp.net", "Tenente");
    assert.strictEqual(checkTenenteSelf.allowed, false, 'Tenente NÃO pode remover Tenente');

    // Tenente removendo Sargento -> Deve permitir
    const checkSargentoByTenente = canModifyOwner("5511999990002@s.whatsapp.net", "Sargento");
    assert.strictEqual(checkSargentoByTenente.allowed, true, 'Tenente PODE remover Sargento');

    // Sargento tentando remover Cabo -> Deve falhar (Nível 3 não gerencia)
    const checkCaboBySargento = canModifyOwner("5511999990003@s.whatsapp.net", "Cabo");
    assert.strictEqual(checkCaboBySargento.allowed, false, 'Sargento NÃO pode remover donos');

    // Capitão removendo Tenente -> Deve permitir
    const checkTenenteByCapitao = canModifyOwner("5511999990001@s.whatsapp.net", "Tenente");
    assert.strictEqual(checkTenenteByCapitao.allowed, true, 'Capitão PODE remover Tenente');

    console.log('  ✅ PASS: Regras de hierarquia militar rígida respeitadas integralmente');

    // 3. Testes de resolveOwnerProfileDetails
    console.log('--- 3. resolveOwnerProfileDetails ---');
    const sargentoOwner = findOwnerByQuery('sargento');
    const profile = resolveOwnerProfileDetails(sargentoOwner);
    assert.strictEqual(profile.displayNick, 'CaveiraMestre', 'Deve extrair o nick configurado no bot via .login');
    assert.strictEqual(profile.pushName, 'João WhatsApp', 'Deve extrair o pushName do WhatsApp');
    assert.strictEqual(profile.ownerName, 'GuerreiroZ', 'Deve extrair o nome registrado no cargo');
    assert.strictEqual(profile.rank, 'Sargento', 'Deve extrair a patente');

    console.log('  ✅ PASS: resolveOwnerProfileDetails extrai nick do bot, pushName e dados do slot');

    // 4. Testes de demoteOwnerComplete
    console.log('--- 4. demoteOwnerComplete ---');
    const demoted = demoteOwnerComplete(sargentoOwner, { rank: 'Capitão' }, '5511999990001@s.whatsapp.net');
    assert.strictEqual(demoted.rank, 'Sargento');
    const ownersAfter = getOwners();
    const sargentoAfter = ownersAfter.find(o => o.rank === 'Sargento');
    assert.strictEqual(sargentoAfter.active, false, 'Slot deve ficar inativo');
    assert.strictEqual(sargentoAfter.jid, '', 'JID deve ser limpo');
    assert.strictEqual(sargentoAfter.name, '', 'Nome deve ser limpo');

    // Verifica que as permissões relacionais foram limpas
    const userRole = permissionRepository.getUserRole("5511999990003@s.whatsapp.net");
    assert.strictEqual(userRole, null, 'Cargo relacional em user_roles deve ser removido');
    assert.strictEqual(permissionRepository.isTrusted("5511999990003@s.whatsapp.net"), false, 'Trust deve ser revogado');

    console.log('  ✅ PASS: demoteOwnerComplete limpa slot, permissões relacionais e trust');

    // 5. Teste de execução do comando .deldono
    console.log('--- 5. deldono.execute com marcação @user e perfil do bot ---');
    // Prepara um novo dono ativo para ser removido pelo comando
    testOwners[2] = {
        rank: "Sargento",
        level: 3,
        name: "GuerreiroZ",
        jid: "5511999990003@s.whatsapp.net",
        phone: "+55 11 99999-0003",
        active: true,
        customTitle: "Guardião da Fortaleza",
        appointedBy: "Capitão (CrazyGOAT)"
    };
    saveOwners(testOwners);

    let sentReply = '';
    let sentMentions = [];

    const mockReply = (text, mentions = []) => {
        sentReply = text;
        sentMentions = mentions;
        return { text, mentions };
    };

    // Executa comando chamando por menção direta
    await deldono.execute({
        args: ['@5511999990003'],
        mentionedJid: ['5511999990003@s.whatsapp.net'],
        sender: '5511999990001@s.whatsapp.net',
        reply: mockReply,
        prefix: '.'
    });

    assert.ok(sentReply.includes('CARGO DE DONO REVOGADO'), 'Deve confirmar a revogação do cargo');
    assert.ok(sentReply.includes('@5511999990003'), 'Deve marcar o usuário alvo com @numero');
    assert.ok(sentReply.includes('CaveiraMestre'), 'Deve exibir o nick real do bot no perfil');
    assert.ok(sentReply.includes('João WhatsApp'), 'Deve exibir o nome do WhatsApp');
    assert.ok(sentReply.includes('Guardião da Fortaleza'), 'Deve exibir o título do cargo revogado');
    assert.ok(sentReply.includes('Sargento'), 'Deve exibir a patente revogada');
    assert.ok(sentReply.includes('@5511999990001'), 'Deve marcar o autor que revogou');
    assert.ok(sentMentions.includes('5511999990003@s.whatsapp.net'), 'Mentions deve conter o alvo');
    assert.ok(sentMentions.includes('5511999990001@s.whatsapp.net'), 'Mentions deve conter o autor');

    console.log('  ✅ PASS: deldono marca o usuário alvo (@user) e exibe seu nick no bot, pushName e hierarquia militar');

    console.log('\n========================================');
    console.log('📊 RESULTADO — Remoção Profunda de Donos:');
    console.log('   ✅ Todos os testes passaram com sucesso!');
    console.log('========================================\n');
}

runTests().catch(err => {
    console.error('❌ Teste de remoção de donos falhou:', err);
    process.exit(1);
});

