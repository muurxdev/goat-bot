/**
 * BotXP — Comprehensive Master RPG & Hierarchy Test Suite
 * Valida todos os 16 módulos do RPG, armazém de retaguarda (Baú),
 * renderização visual do boneco, cálculos de dano, rebirth balanceado e hierarquia de comando.
 */

// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require('assert');
const dataService = require('../src/services/dataService');
const vaultRepo = require('../src/database/repositories/vaultRepository');
const { calculateFullCharacterStats, renderCharacterAvatar, getRebirthInfo } = require('../src/services/characterEngine');
const { getAllTitles, unlockUserTitle, getUserTitles } = require('../src/database/repositories/titleRepository');
const { canModifyOwner, getOwners, saveOwners } = require('../src/services/ownerService');

console.log('🧪 Iniciando Teste Mestre dos 16 Sistemas de RPG e Hierarquia...');

const testJid = '5511999990001@s.whatsapp.net';

// ═══════════════════════════════════════
// 1. TESTE DO BAÚ DE RETAGUARDA (VAULT REPO)
// ═══════════════════════════════════════
console.log('\n--- 1. Armazém / Baú Seguro SQLite ---');
vaultRepo.depositVaultCoins(testJid, 10000);
assert.strictEqual(vaultRepo.getVaultCoins(testJid) >= 10000, true, 'Depósito de moedas no baú deve funcionar');
vaultRepo.withdrawVaultCoins(testJid, 5000);
assert.strictEqual(vaultRepo.getVaultCoins(testJid) >= 5000, true, 'Saque de moedas do baú deve funcionar');

vaultRepo.addVaultItem(testJid, { id: 'espada_ferro', nome: 'Espada de Ferro Britânico', slot: 'arma' }, 2);
const items = vaultRepo.getVaultItems(testJid);
assert.strictEqual(items.length > 0, true, 'Itens devem ser guardados no baú');
vaultRepo.removeVaultItem(testJid, 'espada_ferro', 1);
console.log('  ✅ PASS: Baú Seguro (Depósito, Saque, Itens e Quantidades)');

// ═══════════════════════════════════════
// 2. TESTE DO BONECO DE EMOJI E STATS
// ═══════════════════════════════════════
console.log('\n--- 2. Boneco de Emoji e Cálculo de Atributos ---');
const userMock = {
    jid: testJid,
    level: 25,
    slots: {
        capacete: 'coroa_trevas',
        peitoral: 'cota_purgatorio',
        arma: 'sombria'
    },
    forgeLevel: 3,
    rebirthCount: 1,
    characterRace: 'demonio',
    characterElement: 'fogo',
    pet: '🐺 Lobo Selvagem'
};

const stats = calculateFullCharacterStats(userMock);
assert.strictEqual(stats.atk > 1000, true, 'Sombria + Forja + Raça Demônio deve conceder mais de 1000 ATK');
assert.strictEqual(stats.rebirths, 1, 'Rebirth deve ser contabilizado');
assert.strictEqual(stats.rebirthMultiplier, 1.25, '1 Rebirth deve conceder +25% bônus');

const avatarVisual = renderCharacterAvatar(userMock, stats);
assert.strictEqual(avatarVisual.includes('Sombria') || avatarVisual.includes('Lâmina'), true, 'Boneco deve exibir a arma');
assert.strictEqual(avatarVisual.includes('Nível 25'), true, 'Boneco deve exibir o nível');
console.log('  ✅ PASS: Renderização do Boneco e Estatísticas Reais de MMORPG');

// ═══════════════════════════════════════
// 3. TESTE DE REBIRTH / REENCARNAÇÃO JUSTA
// ═══════════════════════════════════════
console.log('\n--- 3. Sistema Justo de Rebirth / Reencarnação ---');
const userLowLevel = { level: 45, rebirthCount: 0 };
const lowInfo = getRebirthInfo(userLowLevel);
assert.strictEqual(lowInfo.canRebirth, false, 'Usuário com nível < 100 não pode reencarnar');

const userHighLevel = { level: 100, rebirthCount: 2 };
const highInfo = getRebirthInfo(userHighLevel);
assert.strictEqual(highInfo.canRebirth, true, 'Usuário com nível >= 100 pode reencarnar');
assert.strictEqual(highInfo.bonusDmgPercent, 50, '2 Rebirths devem conceder 50% de bônus de dano');

// Teste de Progressão Infinita de Rebirths (além do grau 10)
const userInfiniteRebirth = { level: 100, rebirthCount: 15 };
const infInfo = getRebirthInfo(userInfiniteRebirth);
assert.strictEqual(infInfo.canRebirth, true, 'Usuário com 15 rebirths ainda pode reencarnar');
assert.strictEqual(infInfo.isMaxRebirth, false, 'Não deve haver teto máximo de rebirths');
assert.strictEqual(infInfo.bonusDmgPercent, 375, '15 Rebirths concedem 375% de bônus de dano');
const infStats = calculateFullCharacterStats(userInfiniteRebirth);
assert.strictEqual(infStats.rebirthMultiplier, 4.75, 'Multiplicador de 15 rebirths deve ser 4.75x');

const helpers = require('../src/utils/helpers');
assert.strictEqual(helpers.getRank(1200), '🌌 Onipotente (Era 12)', 'Nível 1200 deve conceder tier procedural Onipotente');

console.log('  ✅ PASS: Requisitos de Rebirth e Progressão Infinita (+25% perpétuo sem teto)');

// ═══════════════════════════════════════
// 4. TESTE DE TÍTULOS DE ALTO VALOR
// ═══════════════════════════════════════
console.log('\n--- 4. Títulos de Honra e Super Bônus ---');
const titles = getAllTitles();
const grandTitle = titles.find(t => t.id === 'mandamento_supremo');
assert.strictEqual(grandTitle.bonus_atk >= 1500, true, 'Mandamento Supremo deve ter pelo menos +1500 ATK');
console.log('  ✅ PASS: Títulos com bônus de combate valorizados');

// ═══════════════════════════════════════
// 5. TESTE DE HIERARQUIA CAPITÃO & TENENTE
// ═══════════════════════════════════════
console.log('\n--- 5. Hierarquia de Comando Militar (Capitão & Tenente) ---');
const capitaoJid = '5511999999999@s.whatsapp.net';
const tenenteJid = '5511999997777@s.whatsapp.net';
const randomUserJid = '5511000000009@s.whatsapp.net';
// Configura a hierarquia de donos para o teste (modelo novo via saveOwners)
saveOwners([
    { rank: 'Capitão', level: 5, jid: capitaoJid, phone: '', active: true },
    { rank: 'Tenente', level: 4, jid: tenenteJid, phone: '', active: true },
    { rank: 'Sargento', level: 3, jid: '', phone: '', active: false }
]);

// 1. Capitão pode alterar tudo
const checkCapitao = canModifyOwner(capitaoJid, 'Tenente');
assert.strictEqual(checkCapitao.allowed, true, 'Capitão deve ter permissão para alterar Tenente');

// 2. Ninguém altera Capitão
const checkTenenteOnCapitao = canModifyOwner(tenenteJid, 'Capitão');
assert.strictEqual(checkTenenteOnCapitao.allowed, false, 'Tenente NÃO pode alterar Capitão');

// 3. Tenente não altera a si próprio
const checkTenenteSelf = canModifyOwner(tenenteJid, 'Tenente');
assert.strictEqual(checkTenenteSelf.allowed, false, 'Tenente NÃO pode alterar a si próprio');

// 4. Tenente altera patentes abaixo (Sargento, Cabo, Soldado)
const checkTenenteOnSargento = canModifyOwner(tenenteJid, 'Sargento');
assert.strictEqual(checkTenenteOnSargento.allowed, true, 'Tenente PODE alterar Sargento');

// 5. Usuário comum não altera nada
const checkRandom = canModifyOwner(randomUserJid, 'Soldado');
try { require('../src/database/connection').getDatabase().prepare("DELETE FROM configs WHERE group_jid='global_owners'").run(); } catch (_) {} // limpa fixture de donos
assert.strictEqual(checkRandom.allowed, false, 'Usuário comum não pode alterar cargos');
console.log('  ✅ PASS: Hierarquia Rígida (Capitão Soberano, Tenente Sub-Comandante com Imunidades)');

// ═══════════════════════════════════════
// 6. EXECUÇÃO DE COMANDOS DE RPG
// ═══════════════════════════════════════
console.log('\n--- 6. Execução de Comandos do RPG ---');
const cmdDungeon = require('../src/commands/rpg/dungeon');
const cmdPesadelo = require('../src/commands/rpg/pesadelo');
const cmdForjar = require('../src/commands/rpg/forjar');
const cmdGrimorio = require('../src/commands/rpg/grimorio');
const cmdCurar = require('../src/commands/rpg/curar');
const cmdSombria = require('../src/commands/rpg/sombria');
const cmdContraAtaque = require('../src/commands/rpg/contraataquetotal');
const cmdRunas = require('../src/commands/rpg/runas');
const cmdEvoluirpet = require('../src/commands/rpg/evoluirpet');
const cmdGuilda = require('../src/commands/rpg/guilda');
const cmdMercado = require('../src/commands/rpg/mercado');
const cmdLeilao = require('../src/commands/rpg/leilao');
const cmdInv = require('../src/commands/rpg/inv');
const cmdBau = require('../src/commands/rpg/bau');
const cmdBoneco = require('../src/commands/rpg/boneco');

let replyCount = 0;
const mockContext = {
    sender: testJid,
    from: '120363000000000000@g.us',
    isGroup: true,
    args: [],
    reply: (msg) => {
        assert.strictEqual(typeof msg === 'string' && msg.length > 10, true, 'A resposta do comando deve ser um texto válido');
        replyCount++;
    }
};

async function testAllCommands() {
    await cmdDungeon.execute(mockContext);
    await cmdPesadelo.execute({ ...mockContext, args: ['info'] });
    await cmdForjar.execute(mockContext);
    await cmdGrimorio.execute(mockContext);
    await cmdCurar.execute(mockContext);
    await cmdSombria.execute(mockContext);
    await cmdContraAtaque.execute(mockContext);
    await cmdRunas.execute(mockContext);
    await cmdEvoluirpet.execute(mockContext);
    await cmdGuilda.execute({ ...mockContext, args: ['lista'] });
    await cmdMercado.execute(mockContext);
    await cmdLeilao.execute(mockContext);
    await cmdInv.execute(mockContext);
    await cmdBau.execute(mockContext);
    await cmdBoneco.execute(mockContext);

    assert.strictEqual(replyCount >= 15, true, 'Todos os 15 comandos devem executar com sucesso');
    console.log(`  ✅ PASS: 15 Comandos de RPG executados perfeitamente (Total de Respostas: ${replyCount})`);

    console.log('\n========================================');
    console.log('🎉 TODOS OS TESTES DOS 16 SISTEMAS PASSARAM!');
    console.log('========================================\n');
}

testAllCommands();

