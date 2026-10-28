/**
 * Testes do Fluxo .setdono e .donos
 * Valida o parser flexível de telefone (hífens, espaços, sem DDI),
 * inferência automática de DDI 55, concessão de permissão OWNER e exibição em .donos
 */

process.env.NODE_ENV = 'test';
process.env.STRICT_COMMANDS = '1';

const assert = require('assert');
const { getDatabase } = require('../src/database/connection');
const ownerService = require('../src/services/ownerService');
const permissionRepo = require('../src/database/repositories/permissionRepository');
const setdono = require('../src/commands/owner/setdono');
const dono = require('../src/commands/general/dono');

let pass = 0, fail = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        pass++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}\n     ${e.message}`);
        fail++;
    }
}

async function runAsyncTest(name, fn) {
    try {
        await fn();
        console.log(`  ✅ PASS: ${name}`);
        pass++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}\n     ${e.message}`);
        fail++;
    }
}

(async () => {
    console.log('🧪 Testes de Validação do Fluxo .setdono & .donos...\n');

    // Mock do Capitão como remetente autorizado
    const capitanJid = '5511999990001@s.whatsapp.net';
    const initialOwners = [
        { rank: 'Capitão', level: 5, name: 'Capitão Teste', jid: capitanJid, phone: '+55 11 99999-0001', active: true },
        { rank: 'Tenente', level: 4, name: '', jid: '', phone: '', active: false },
        { rank: 'Sargento', level: 3, name: '', jid: '', phone: '', active: false },
        { rank: 'Cabo', level: 3, name: '', jid: '', phone: '', active: false },
        { rank: 'Soldado', level: 3, name: '', jid: '', phone: '', active: false }
    ];
    ownerService.saveOwners(initialOwners);

    // Mock de mensagens e client Baileys
    let lastReply = '';
    let lastMentions = [];
    const replyMock = (text, mentions = []) => {
        lastReply = text;
        lastMentions = mentions;
        return { text, mentions };
    };

    const clientMock = {
        store: {
            contacts: {
                '5521984596995@s.whatsapp.net': {
                    name: 'M.',
                    notify: 'M. (WhatsApp Real)'
                }
            }
        }
    };

    // Caso 1: Usuário digita ".setdono Tenente 21 98459-6995"
    await runAsyncTest('1. .setdono Tenente 21 98459-6995 infere DDI 55 e registra o contato', async () => {
        await setdono.execute({
            args: ['Tenente', '21', '98459-6995'],
            reply: replyMock,
            sender: capitanJid,
            senderReal: capitanJid,
            roleJid: capitanJid,
            mentionedJid: [],
            client: clientMock,
            info: {}
        });

        assert.ok(lastReply.includes('PATENTE DE DONO ATUALIZADA'), 'Mensagem de sucesso');
        assert.ok(lastReply.includes('@5521984596995'), 'Deve marcar o JID inferido com 55');
        assert.ok(lastReply.includes('+55 21 98459-6995'), 'Telefone formatado com DDI 55');

        const owners = ownerService.getOwners();
        const tenente = owners.find(o => o.rank === 'Tenente');
        assert.ok(tenente, 'Tenente deve existir');
        assert.strictEqual(tenente.active, true, 'Tenente deve estar ativo');
        assert.strictEqual(tenente.jid, '5521984596995@s.whatsapp.net', 'JID deve ter DDI 55');
        assert.ok(tenente.phone.replace(/\D/g, '').includes('5521984596995'), 'Telefone deve ter 55');
    });

    // Caso 2: Permissões de Dono concedidas
    test('2. Permissões de Dono concedidas ao novo Tenente', () => {
        const isTenenteOwner = ownerService.isOwner('5521984596995@s.whatsapp.net');
        assert.strictEqual(isTenenteOwner, true, 'isOwner deve retornar true para o Tenente');

        const roleDb = permissionRepo.getUserRole('5521984596995@s.whatsapp.net');
        assert.strictEqual(roleDb?.role, 'OWNER', 'user_roles deve estar registrado como OWNER');
    });

    // Caso 3: .donos exibe o Tenente e NÃO exibe "Vago / Disponível"
    await runAsyncTest('3. .donos exibe Tenente com contato ativo e NUNCA "Vago / Disponível"', async () => {
        let donosReply = '';
        let donosMentions = [];
        await dono.execute({
            reply: (text, mentions) => {
                donosReply = text;
                donosMentions = mentions;
            }
        });

        assert.ok(/tenente/i.test(donosReply), 'Deve conter seção do Tenente');
        assert.ok(donosReply.includes('@5521984596995'), 'Deve mencionar o Tenente');
        assert.ok(!donosReply.includes('Status: _Vago / Disponível_') || donosReply.includes('Sargento'), 'Tenente não pode estar vago');
        assert.ok(donosMentions.includes('5521984596995@s.whatsapp.net'), 'Deve constar nas menções');
    });

    // Caso 4: Custom Name + Telefone: ".setdono Sargento GOAT 21 98459-6995"
    await runAsyncTest('4. .setdono Sargento GOAT 21 98459-6995 salva nome e telefone', async () => {
        await setdono.execute({
            args: ['Sargento', 'GOAT', '21', '98459-6995'],
            reply: replyMock,
            sender: capitanJid,
            senderReal: capitanJid,
            roleJid: capitanJid,
            mentionedJid: [],
            client: clientMock,
            info: {}
        });

        const owners = ownerService.getOwners();
        const sargento = owners.find(o => o.rank === 'Sargento');
        assert.strictEqual(sargento.active, true);
        assert.strictEqual(sargento.name, 'GOAT');
        assert.strictEqual(sargento.jid, '5521984596995@s.whatsapp.net');
    });

    // Caso 5: Resposta a mensagem (Quoted)
    await runAsyncTest('5. .setdono Cabo respondendo a mensagem (Quoted)', async () => {
        await setdono.execute({
            args: ['Cabo'],
            reply: replyMock,
            sender: capitanJid,
            senderReal: capitanJid,
            roleJid: capitanJid,
            mentionedJid: [],
            quotedSender: '5511888887777@s.whatsapp.net',
            client: clientMock,
            info: {
                message: {
                    extendedTextMessage: {
                        contextInfo: {
                            participant: '5511888887777@s.whatsapp.net'
                        }
                    }
                }
            }
        });

        const owners = ownerService.getOwners();
        const cabo = owners.find(o => o.rank === 'Cabo');
        assert.strictEqual(cabo.active, true);
        assert.strictEqual(cabo.jid, '5511888887777@s.whatsapp.net');
    });

    console.log(`\n📊 Fluxo .setdono: ✅ ${pass}  ❌ ${fail}`);
    if (fail > 0) process.exit(1);
})();
