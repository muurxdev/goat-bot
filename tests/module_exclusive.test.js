const assert = require('assert');
const moduleState = require('../src/services/moduleStateService');

console.log('🧪 Iniciando testes de módulos e ativação exclusiva por hierarquia...');

const testScope = '120363999999999999@g.us';

// 1. Teste de enableAll: liga todos os módulos comuns, MAS deixa skycode e divulgacao OFF
moduleState.enableAll(testScope);
const allMods = moduleState.listModules(testScope);

const skycodeMod = allMods.find(m => m.key === 'skycode');
const divulgacaoMod = allMods.find(m => m.key === 'divulgacao');
const rpgMod = allMods.find(m => m.key === 'rpg');
const cassinoMod = allMods.find(m => m.key === 'cassino');

assert.strictEqual(skycodeMod.enabled, false, 'skycode deve permanecer OFF no enableAll');
assert.strictEqual(divulgacaoMod.enabled, false, 'divulgacao deve permanecer OFF no enableAll');
assert.strictEqual(rpgMod.enabled, true, 'rpg deve estar ON no enableAll');
assert.strictEqual(cassinoMod.enabled, true, 'cassino deve estar ON no enableAll');

// 2. Teste de enableExclusiveHierarchy (ex: .modulo solo rpg)
// Deve ativar RPG e seu ecossistema (rpg, xp, economia, perfil), e desligar todos os outros principais (cassino, moderacao, etc.)
const resSoloRpg = moduleState.enableExclusiveHierarchy('rpg', testScope);
assert.strictEqual(resSoloRpg.ok, true, 'Ativação solo de RPG deve retornar ok');

const soloMods = moduleState.listModules(testScope);
const soloRpg = soloMods.find(m => m.key === 'rpg');
const soloXp = soloMods.find(m => m.key === 'xp');
const soloEco = soloMods.find(m => m.key === 'economia');
const soloPerfil = soloMods.find(m => m.key === 'perfil');
const soloCassino = soloMods.find(m => m.key === 'cassino');
const soloMod = soloMods.find(m => m.key === 'moderacao');
const soloSkycode = soloMods.find(m => m.key === 'skycode');

assert.strictEqual(soloRpg.enabled, true, 'RPG deve estar ON');
assert.strictEqual(soloXp.enabled, true, 'XP da hierarquia RPG deve estar ON');
assert.strictEqual(soloEco.enabled, true, 'Economia da hierarquia RPG deve estar ON');
assert.strictEqual(soloPerfil.enabled, true, 'Perfil da hierarquia RPG deve estar ON');
assert.strictEqual(soloCassino.enabled, false, 'Cassino deve estar OFF no solo RPG');
assert.strictEqual(soloMod.enabled, false, 'Moderação deve estar OFF no solo RPG');
assert.strictEqual(soloSkycode.enabled, false, 'Skycode deve estar OFF');

// 3. Teste de enableExclusiveHierarchy para Moderação (ex: .modulo solo moderacao)
const resSoloMod = moduleState.enableExclusiveHierarchy('moderacao', testScope);
assert.strictEqual(resSoloMod.ok, true, 'Ativação solo de Moderação deve retornar ok');

const modMods = moduleState.listModules(testScope);
assert.strictEqual(modMods.find(m => m.key === 'moderacao').enabled, true, 'Moderação deve estar ON');
assert.strictEqual(modMods.find(m => m.key === 'mensagens-grupo').enabled, true, 'Mensagens-grupo da hierarquia de moderação deve estar ON');
assert.strictEqual(modMods.find(m => m.key === 'rpg').enabled, false, 'RPG deve estar OFF no solo Moderação');
assert.strictEqual(modMods.find(m => m.key === 'cassino').enabled, false, 'Cassino deve estar OFF no solo Moderação');

console.log('✅ Todos os testes de módulos e hierarquia exclusiva passaram com sucesso!');
