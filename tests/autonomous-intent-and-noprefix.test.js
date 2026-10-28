/**
 * Testes Unitários e de Integração:
 * - Execução de Comandos Sem Prefixo (ex: "menu", "perfil", "dono", "cassino")
 * - Mapeamento de Intenções em Linguagem Natural ("mostra o menu", "quem é o dono")
 * - Modo ChatGPT Conversacional e Autônomo 24h
 */

const assert = require('assert');
const autonomousIntent = require('../src/services/autonomousIntentService');
const dataService = require('../src/services/dataService');
const { handleIncomingMessage } = require('../src/handlers/messageHandler');

describe('🧠 Motor de Intenção Autônoma e Comandos Sem Prefixo', () => {
    const testGroup = '120363000000000099@g.us';
    const testSender = '5511999990001@s.whatsapp.net';

    it('1. resolveAutonomousAction deve identificar "menu" sem prefixo como comando', () => {
        const action = autonomousIntent.resolveAutonomousAction('menu', {
            from: testGroup,
            sender: testSender,
            isGroup: true,
            configs: { [testGroup]: { conversaNatural: true } }
        });

        assert.strictEqual(action.isCommand, true);
        assert.strictEqual(action.commandName, 'menu');
    });

    it('2. resolveAutonomousAction deve identificar "mostra o menu" como comando "menu"', () => {
        const action = autonomousIntent.resolveAutonomousAction('mostra o menu', {
            from: testGroup,
            sender: testSender,
            isGroup: true,
            configs: {}
        });

        assert.strictEqual(action.isCommand, true);
        assert.strictEqual(action.commandName, 'menu');
    });

    it('3. resolveAutonomousAction deve identificar "quem é o dono" como comando "dono"', () => {
        const action = autonomousIntent.resolveAutonomousAction('quem é o dono do bot', {
            from: testGroup,
            sender: testSender,
            isGroup: true,
            configs: {}
        });

        assert.strictEqual(action.isCommand, true);
        assert.strictEqual(action.commandName, 'dono');
    });

    it('4. resolveAutonomousAction deve identificar "treinar palavra xyz" como comando "machine train xyz"', () => {
        const action = autonomousIntent.resolveAutonomousAction('treinar palavra boboca', {
            from: testGroup,
            sender: testSender,
            isGroup: true,
            configs: {}
        });

        assert.strictEqual(action.isCommand, true);
        assert.strictEqual(action.commandName, 'machine');
        assert.deepStrictEqual(action.args, ['train', 'boboca']);
    });

    it('5. No PV (DM), comandos diretos sem prefixo devem ser sempre aceitos', () => {
        const action = autonomousIntent.resolveAutonomousAction('ping', {
            from: testSender,
            sender: testSender,
            isGroup: false,
            configs: {}
        });

        assert.strictEqual(action.isCommand, true);
        assert.strictEqual(action.commandName, 'ping');
    });

    it('6. Comandos universais (menu, regras, dono, cassino) devem rodar mesmo em grupo sem modo chat', () => {
        const action = autonomousIntent.resolveAutonomousAction('cassino', {
            from: testGroup,
            sender: testSender,
            isGroup: true,
            configs: { [testGroup]: { conversaNatural: false } }
        });

        assert.strictEqual(action.isCommand, true);
        assert.strictEqual(action.commandName, 'cassino');
    });

    it('7. Conversa livre no modo ChatGPT ativo deve cair em isChat para resposta da IA', () => {
        const action = autonomousIntent.resolveAutonomousAction('o que você acha do futebol brasileiro?', {
            from: testGroup,
            sender: testSender,
            isGroup: true,
            configs: { [testGroup]: { conversaNatural: true } }
        });

        assert.strictEqual(action.isChat, true);
        assert.strictEqual(action.cleanPrompt, 'o que você acha do futebol brasileiro?');
    });

    it('7.1. Intenções variadas em linguagem natural devem mapear corretamente', () => {
        const testCases = [
            { text: 'revela essa foto', cmd: 'revelar', args: [] },
            { text: 'qual o ping do bot', cmd: 'ping', args: [] },
            { text: 'abrir cassino', cmd: 'cassino', args: [] },
            { text: 'fazer varredura de palavrões', cmd: 'profanity', args: ['roaming'] },
            { text: 'mostra as regras do grupo', cmd: 'regras', args: [] },
            { text: 'meu saldo', cmd: 'carteira', args: [] },
            { text: 'status do bot', cmd: 'machine', args: ['status'] }
        ];

        for (const tc of testCases) {
            const action = autonomousIntent.resolveAutonomousAction(tc.text, {
                from: testGroup,
                sender: testSender,
                isGroup: true,
                configs: {}
            });
            assert.strictEqual(action.isCommand, true, `Falhou para texto: "${tc.text}"`);
            assert.strictEqual(action.commandName, tc.cmd, `Comando incorreto para: "${tc.text}"`);
            assert.deepStrictEqual(action.args, tc.args, `Args incorretos para: "${tc.text}"`);
        }
    });

    it('8. Integração no messageHandler: enviar "menu" sem ponto executa o menu', async function() {
        this.timeout(10000);
        process.env.NODE_ENV = 'test';
        const groupAuthService = require('../src/services/groupAuthService');
        const configs = dataService.getConfigsData();
        configs[testGroup] = { conversaNatural: true };
        await dataService.saveConfigsData(configs);

        // Garante usuário cadastrado para passar pelo gate de login
        const user = dataService.getUser(testSender);
        user.registered = true;
        user.name = 'Testador';
        await dataService.saveUser(user);

        let sentMessage = '';
        const mockClient = {
            user: { id: '553597379643:1@s.whatsapp.net', lid: '99999999999999:1@lid' },
            groupMetadata: async () => ({ id: testGroup, subject: 'Teste', participants: [{ id: '99999999999999@lid', admin: 'admin' }, { id: testSender, admin: null }] }),
            sendMessage: async (to, payload) => {
                const text = payload.text || payload.caption || '';
                if (text) sentMessage = text;
                return { key: { id: 'RESP_MENU' } };
            },
            readMessages: async () => {},
            sendPresenceUpdate: async () => {},
            profilePictureUrl: async () => null
        };

        groupAuthService.attach(mockClient);

        const incomingMsg = {
            key: { remoteJid: testGroup, id: 'MSG_NO_PREFIX_1', participant: testSender },
            message: {
                conversation: 'menu'
            }
        };

        await handleIncomingMessage(mockClient, { messages: [incomingMsg] });

        // Garante que o menu do bot foi montado e respondido
        assert.ok(sentMessage.includes('MENU') || sentMessage.includes('COMANDOS') || sentMessage.includes('GOAT') || sentMessage.includes('PRINCIPAL'),
            `Deveria ter respondido com o menu, recebeu: ${sentMessage.slice(0, 100)}`);
    });
});
