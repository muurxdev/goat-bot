/**
 * Suíte de Testes: Hierarquia Divisória (6 Níveis), Donos de Aluguel (Locatários) e Menus do Mestre
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const { ROLES, ROLE_LABELS, resolveUserRole, canExecuteCommand, getCommandHierarchy } = require('../src/services/permissionService');
const rentalService = require('../src/services/rentalService');
const { buildMenu } = require('../src/services/menuService');
const dispatcher = require('../src/handlers/commandDispatcher');
const hierarquiaCmd = require('../src/commands/general/hierarquia');
const meuAluguelCmd = require('../src/commands/general/meualuguel');

console.log('🧪 Iniciando testes de Hierarquia Divisória, Donos de Aluguel e Menus...');

let passed = 0;
function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✅ PASS: ${name}`);
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(err);
        process.exit(1);
    }
}

async function asyncTest(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  ✅ PASS: ${name}`);
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(err);
        process.exit(1);
    }
}

(async () => {
    // ═══════════════════════════════════════════════════
    // 1. RESOLUÇÃO DOS NÍVEIS HIERÁRQUICOS
    // ═══════════════════════════════════════════════════
    console.log('\n--- 1. Estrutura dos Níveis Hierárquicos ---');

    test('ROLES contém a hierarquia formal de 6 níveis incluindo RENTAL_OWNER (3.5)', () => {
        assert.strictEqual(ROLES.OWNER, 5);
        assert.strictEqual(ROLES.BOT_ADMIN, 4);
        assert.strictEqual(ROLES.RENTAL_OWNER, 3.5);
        assert.strictEqual(ROLES.GROUP_ADMIN, 3);
        assert.strictEqual(ROLES.TRUSTED, 2);
        assert.strictEqual(ROLES.USER, 1);

        assert.strictEqual(ROLE_LABELS[5], 'Dono do bot');
        assert.strictEqual(ROLE_LABELS[4], 'Administrador do bot');
        assert.strictEqual(ROLE_LABELS[3.5], 'Dono de aluguel (locatário)');
        assert.strictEqual(ROLE_LABELS[3], 'Administrador do grupo');
        assert.strictEqual(ROLE_LABELS[2], 'Membro de confiança');
        assert.strictEqual(ROLE_LABELS[1], 'Membro');
    });

    // ═══════════════════════════════════════════════════
    // 2. DONO DE ALUGUEL (LOCATÁRIO) & CONTROLE TEMPORÁRIO
    // ═══════════════════════════════════════════════════
    console.log('\n--- 2. Ciclo de Vida do Dono de Aluguel (Locatário) ---');

    const testGroupJid = '120363' + Date.now() + '@g.us';
    const renterJid = '5511944443333@s.whatsapp.net';
    const otherUserJid = '5511944442222@s.whatsapp.net';

    // Limpa estado anterior se houver
    const dataService = require('../src/services/dataService');
    const configs = dataService.getConfigsData();
    delete configs[testGroupJid];

    // Cria aluguel ativo com renterJid definido
    rentalService.setRental({
        targetJid: testGroupJid,
        targetName: 'Grupo Teste Aluguel',
        renterJid: renterJid,
        rentedBy: '5511944443333',
        durationStr: '30d'
    });

    test('isRentalOwner identifica o comprador como Dono de Aluguel no grupo ativo', () => {
        const isOwner = rentalService.isRentalOwner(renterJid, testGroupJid, true);
        assert.strictEqual(isOwner, true);

        const isOtherOwner = rentalService.isRentalOwner(otherUserJid, testGroupJid, true);
        assert.strictEqual(isOtherOwner, false);
    });

    test('resolveUserRole atribui nível 3.5 (RENTAL_OWNER) ao locatário ativo do grupo', () => {
        const role = resolveUserRole(renterJid, false, false, { from: testGroupJid, isGroup: true });
        assert.strictEqual(role.level, ROLES.RENTAL_OWNER);
        assert.strictEqual(role.name, 'RENTAL_OWNER');
        assert.strictEqual(role.isRentalOwner, true);
    });

    test('transferência de locatário via setRentalOwner passa poderes para outro usuário', () => {
        rentalService.setRentalOwner(testGroupJid, otherUserJid, renterJid);

        assert.strictEqual(rentalService.isRentalOwner(otherUserJid, testGroupJid, true), true);
        const newRole = resolveUserRole(otherUserJid, false, false, { from: testGroupJid, isGroup: true });
        assert.strictEqual(newRole.level, ROLES.RENTAL_OWNER);
    });

    test('quando o aluguel expira, o locatário perde o cargo e volta para USER', () => {
        const expiredGroupJid = '120363000000000099@g.us';
        const expiredRenter = '5511999990099@s.whatsapp.net';

        // Registra aluguel já expirado
        rentalService.setRental({
            targetJid: expiredGroupJid,
            targetName: 'Grupo Expirado',
            renterJid: expiredRenter,
            durationStr: '1s'
        });

        // Força expiração manipulando data no banco
        const { getDatabase } = require('../src/database/connection');
        const db = getDatabase();
        db.prepare('UPDATE rentals SET expires_at = ? WHERE group_jid = ?').run(Date.now() - 10000, expiredGroupJid);

        assert.strictEqual(rentalService.isRentalOwner(expiredRenter, expiredGroupJid, true), false);
        const roleAfter = resolveUserRole(expiredRenter, false, false, { from: expiredGroupJid, isGroup: true });
        assert.strictEqual(roleAfter.level, ROLES.USER);
    });

    // ═══════════════════════════════════════════════════
    // 3. MATRIZ DE PERMISSÕES & CANEXECUTECOMMAND
    // ═══════════════════════════════════════════════════
    console.log('\n--- 3. Matriz de Permissões com RENTAL_OWNER ---');

    test('Dono de Aluguel (3.5) tem permissão para comandos de administração de grupo (nível 3)', () => {
        const rentalRole = { level: ROLES.RENTAL_OWNER, name: 'RENTAL_OWNER' };
        const adminCmd = { name: 'kick', adminOnly: true, groupOnly: true };

        const check = canExecuteCommand(rentalRole, adminCmd, { isGroup: true, isBotAdmin: true });
        assert.strictEqual(check.allowed, true);
    });

    test('Dono de Aluguel (3.5) é bloqueado ao tentar executar comandos de Dono do Bot (nível 4 e 5)', () => {
        const rentalRole = { level: ROLES.RENTAL_OWNER, name: 'RENTAL_OWNER' };
        const ownerCmd = { name: 'eval', ownerOnly: true, category: 'dev' };

        const check = canExecuteCommand(rentalRole, ownerCmd, { isGroup: true });
        assert.strictEqual(check.allowed, false);
        assert.strictEqual(check.hierarchy, 'dono');
        assert.match(check.reason, /DONO DO BOT/);
    });

    test('Membro comum (nível 1) é bloqueado ao tentar comandos de locatário ou admin', () => {
        const userRole = { level: ROLES.USER, name: 'USER' };
        const locatarioCmd = { name: 'locatarioset', rentalOnly: true };

        const check = canExecuteCommand(userRole, locatarioCmd, { isGroup: true });
        assert.strictEqual(check.allowed, false);
        assert.match(check.reason, /DONO DE ALUGUEL/);
    });

    // ═══════════════════════════════════════════════════
    // 4. EXECUÇÃO DO COMANDO .HIERARQUIA E .MEUALUGUEL
    // ═══════════════════════════════════════════════════
    console.log('\n--- 4. Execução dos Comandos .hierarquia e .meualuguel ---');

    await asyncTest('comando .hierarquia exibe todos os 6 níveis e cargo atual do remetente', async () => {
        let responseText = '';
        await hierarquiaCmd.execute({
            from: testGroupJid,
            isGroup: true,
            sender: renterJid,
            userRole: { level: ROLES.RENTAL_OWNER, name: 'RENTAL_OWNER' },
            reply: (msg) => { responseText = msg; return msg; }
        });

        assert.match(responseText, /Hierarquia do Sistema/i);
        assert.match(responseText, /Nível 5 — Dono Master/i);
        assert.match(responseText, /Nível 4 — Sub-Dono/i);
        assert.match(responseText, /Nível 3.5 — Dono de Aluguel/i);
        assert.match(responseText, /Nível 3 — Administrador do Grupo/i);
        assert.match(responseText, /Nível 2 — VIP \/ Confiável/i);
        assert.match(responseText, /Nível 1 — Membro da Comunidade/i);
        assert.match(responseText, /Dono de aluguel \(locatário\)/i);
    });

    await asyncTest('comando .meualuguel exibe tempo restante, status e poderes no grupo', async () => {
        let responseText = '';
        await meuAluguelCmd.execute({
            from: testGroupJid,
            isGroup: true,
            sender: renterJid,
            userRole: { level: ROLES.RENTAL_OWNER, name: 'RENTAL_OWNER' },
            reply: (msg) => { responseText = msg; return msg; }
        });

        assert.match(responseText, /Status da Locação/i);
        assert.match(responseText, /Poderes de Gestão do Locatário/i);
        assert.match(responseText, /\.cmd on\/off/i);
        assert.match(responseText, /\.modulo on\/off/i);
        assert.match(responseText, /Tempo Restante:/i);
    });

    // ═══════════════════════════════════════════════════
    // 5. MENUS CATEGORIZADOS & IMAGEM DO MESTRE
    // ═══════════════════════════════════════════════════
    console.log('\n--- 5. Menus Estruturados & Categorias Predominantes ---');

    dispatcher.loadCommands();

    test('buildMenu organiza categorias predominantes e atalhos rápidos de hierarquia', () => {
        const menuResult = buildMenu({
            category: null,
            page: 1,
            prefix: '.',
            userLevel: 1,
            botName: 'GOATBOT',
            registry: dispatcher.getCommands(),
            totalAliases: dispatcher.getAliases().size
        });

        assert.strictEqual(menuResult.totalPages, 2);
        assert.strictEqual(menuResult.mediaKey, 'main');

        // Página 1: áreas predominantes
        const p1 = menuResult.pages[0];
        assert.match(p1, /RPG/);
        assert.match(p1, /Economia/);
        assert.match(p1, /Cassino/);
        assert.match(p1, /Moderação/);
        assert.match(p1, /IA & Pesquisa/);

        // Página 2: atalhos rápidos com hierarquia e aluguel
        const p2 = menuResult.pages[1];
        assert.match(p2, /\.hierarquia/);
        assert.match(p2, /\.meualuguel/);
    });

    test('submenus por categoria atribuem a mediaKey correta do GOAT Prime', () => {
        const catKeys = ['rpg', 'economia', 'cassino', 'moderacao', 'ia', 'owner'];
        for (const k of catKeys) {
            const subMenu = buildMenu({
                category: k,
                page: 1,
                prefix: '.',
                userLevel: 5,
                botName: 'GOATBOT',
                registry: dispatcher.getCommands(),
                totalAliases: dispatcher.getAliases().size
            });
            assert.strictEqual(subMenu.mediaKey, k);
            assert(subMenu.pages.length >= 1);
            assert(subMenu.total > 0);
        }
    });

    console.log(`\n========================================`);
    console.log(`📊 RESULTADO DOS TESTES DE HIERARQUIA & ALUGUEL:`);
    console.log(`   ✅ Passaram: ${passed}`);
    console.log(`   ❌ Falharam: 0`);
    console.log(`========================================\n`);
})();
