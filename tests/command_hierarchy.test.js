const assert = require('assert');
const { getCommandHierarchy, canExecuteCommand, ROLES } = require('../src/services/permissionService');

console.log('🧪 Iniciando testes de hierarquia de comandos...');

// Comandos de teste em cada nível
const cmdUser = { name: 'ping', category: 'utilitarios', description: 'Testa resposta' };
const cmdAdm = { name: 'fechargrupo', category: 'admin', adminOnly: true, groupOnly: true };
const cmdDono = { name: 'eval', category: 'dono', ownerOnly: true };

// Usuários simulados em cada nível
const roleUser = { level: ROLES.USER, name: 'USER' };
const roleAdm = { level: ROLES.GROUP_ADMIN, name: 'GROUP_ADMIN' };
const roleDono = { level: ROLES.OWNER, name: 'OWNER' };

// 1. Teste de identificação de hierarquia
assert.strictEqual(getCommandHierarchy(cmdUser), 'user', 'cmdUser deve ser nível user');
assert.strictEqual(getCommandHierarchy(cmdAdm), 'adm', 'cmdAdm deve ser nível adm');
assert.strictEqual(getCommandHierarchy(cmdDono), 'dono', 'cmdDono deve ser nível dono');

// 2. Teste de restrição de Membro Comum (User)
const userOnUser = canExecuteCommand(roleUser, cmdUser, { isGroup: true, isBotAdmin: true });
assert.strictEqual(userOnUser.allowed, true, 'User deve poder executar comando de user');

const userOnAdm = canExecuteCommand(roleUser, cmdAdm, { isGroup: true, isBotAdmin: true });
assert.strictEqual(userOnAdm.allowed, false, 'User NÃO pode executar comando de admin');
assert(userOnAdm.reason.includes('ADMINISTRADOR DO GRUPO'), 'Motivo deve citar ADMINISTRADOR DO GRUPO');

const userOnDono = canExecuteCommand(roleUser, cmdDono, { isGroup: true, isBotAdmin: true });
assert.strictEqual(userOnDono.allowed, false, 'User NÃO pode executar comando de dono');
assert(userOnDono.reason.includes('DONO DO BOT'), 'Motivo deve citar DONO DO BOT');

// 3. Teste de restrição de Administrador do Grupo (Adm)
const admOnUser = canExecuteCommand(roleAdm, cmdUser, { isGroup: true, isBotAdmin: true });
assert.strictEqual(admOnUser.allowed, true, 'Adm deve poder executar comando de user');

const admOnAdm = canExecuteCommand(roleAdm, cmdAdm, { isGroup: true, isBotAdmin: true });
assert.strictEqual(admOnAdm.allowed, true, 'Adm deve poder executar comando de admin');

const admOnDono = canExecuteCommand(roleAdm, cmdDono, { isGroup: true, isBotAdmin: true });
assert.strictEqual(admOnDono.allowed, false, 'Adm NÃO pode executar comando de dono');
assert(admOnDono.reason.includes('DONO DO BOT'), 'Motivo deve alertar que é restrito ao dono do bot');

// 4. Teste de Dono (Owner)
const donoOnUser = canExecuteCommand(roleDono, cmdUser, { isGroup: true, isBotAdmin: true });
assert.strictEqual(donoOnUser.allowed, true, 'Dono executa user');

const donoOnAdm = canExecuteCommand(roleDono, cmdAdm, { isGroup: true, isBotAdmin: true });
assert.strictEqual(donoOnAdm.allowed, true, 'Dono executa adm');

const donoOnDono = canExecuteCommand(roleDono, cmdDono, { isGroup: true, isBotAdmin: true });
assert.strictEqual(donoOnDono.allowed, true, 'Dono executa dono');

// 5. Teste de comando exclusivo de grupo
const cmdGrupoNoPv = canExecuteCommand(roleAdm, cmdAdm, { isGroup: false, isBotAdmin: true });
assert.strictEqual(cmdGrupoNoPv.allowed, false, 'Comando groupOnly deve ser bloqueado no privado');
assert(cmdGrupoNoPv.reason.includes('funciona só dentro de grupos'), 'Mensagem deve indicar exclusividade de grupo');

console.log('✅ Todos os testes de hierarquia de comandos passaram com sucesso!');
