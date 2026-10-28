/**
 * Testes Unitários e de Integração: Fluxo Estrito de Anti-Link
 * 
 * Regra: O anti-link sem parceria deve banir o usuário, depois mostrar o motivo,
 * e por fim apagar a mensagem com o link.
 */

const assert = require('assert');
const dataService = require('../src/services/dataService');
const groupAuthService = require('../src/services/groupAuthService');
const { handleIncomingMessage } = require('../src/handlers/messageHandler');

describe('🛡️ Anti-Link sem Parceria: Ban -> Motivo -> Apaga Mensagem', () => {
    const testGroup = '120363099999999999@g.us';
    const testUser = '5511888880001@s.whatsapp.net';
    const partnerUser = '5511888880002@s.whatsapp.net';
    const botJid = '553597379643:2@s.whatsapp.net';

    before(async () => {
        // Inicializa configurações
        const configs = dataService.getConfigsData();
        configs[testGroup] = {
            antilink: true,
            allowedLinkUsers: [partnerUser]
        };
        await dataService.saveConfigsData(configs);
    });

    it('1. Usuário sem parceria deve ser BANIDO primeiro, depois notificado do motivo, e por fim ter a mensagem apagada', async function() {
        this.timeout(10000);
        const callOrder = [];

        const mockClient = {
            user: { id: botJid, lid: '11111111111111@lid' },
            groupMetadata: async () => ({
                id: testGroup,
                subject: 'Grupo Teste',
                participants: [
                    { id: botJid, admin: 'admin' },
                    { id: testUser, admin: null }
                ]
            }),
            groupParticipantsUpdate: async (jid, participants, action) => {
                callOrder.push({ type: 'ban', jid, participants, action });
                return [{ jid: participants[0], status: '200' }];
            },
            sendMessage: async (jid, payload) => {
                if (payload.delete) {
                    callOrder.push({ type: 'delete', jid, key: payload.delete });
                } else if (payload.text) {
                    callOrder.push({ type: 'motivo', jid, text: payload.text, mentions: payload.mentions });
                }
                return { key: { id: 'RESP_' + Date.now() } };
            },
            readMessages: async () => {},
            sendPresenceUpdate: async () => {}
        };

        // Vincula cliente ao groupAuthService
        groupAuthService.attach(mockClient);

        const incomingMsg = {
            key: { remoteJid: testGroup, id: 'MSG_LINK_UNAUTHORIZED_1', participant: testUser },
            message: {
                conversation: 'Acesse o meu novo grupo galera: https://chat.whatsapp.com/ExemploGrupoLink123'
            }
        };

        await handleIncomingMessage(mockClient, { messages: [incomingMsg] });

        // Verificações estritas da ordem
        assert.strictEqual(callOrder.length, 3, `Deveria ter executado exatamente 3 ações, executou ${callOrder.length}`);
        
        // 1ª Ação: BAN
        assert.strictEqual(callOrder[0].type, 'ban', '1ª ação deve ser BAN (groupParticipantsUpdate remove)');
        assert.strictEqual(callOrder[0].action, 'remove');
        assert.ok(callOrder[0].participants.includes(testUser));

        // 2ª Ação: MOTIVO
        assert.strictEqual(callOrder[1].type, 'motivo', '2ª ação deve ser exibir o MOTIVO do banimento');
        assert.ok(callOrder[1].text.includes('BANIMENTO APLICADO') || callOrder[1].text.includes('Infrator'), 'Texto deve conter motivo do ban');
        assert.ok(callOrder[1].mentions.includes(testUser));

        // 3ª Ação: DELETE
        assert.strictEqual(callOrder[2].type, 'delete', '3ª ação deve ser APAGAR a mensagem');
        assert.strictEqual(callOrder[2].key.id, 'MSG_LINK_UNAUTHORIZED_1');
    });

    it('2. Usuário com parceria (whitelist) NÃO deve ser banido nem ter a mensagem apagada', async () => {
        const callOrder = [];

        const mockClient = {
            user: { id: botJid, lid: '11111111111111@lid' },
            groupMetadata: async () => ({
                id: testGroup,
                subject: 'Grupo Teste',
                participants: [
                    { id: botJid, admin: 'admin' },
                    { id: partnerUser, admin: null }
                ]
            }),
            groupParticipantsUpdate: async (jid, participants, action) => {
                callOrder.push({ type: 'ban', jid });
                return [{ jid: participants[0], status: '200' }];
            },
            sendMessage: async (jid, payload) => {
                if (payload.delete) {
                    callOrder.push({ type: 'delete', jid });
                } else {
                    callOrder.push({ type: 'text', jid });
                }
                return { key: { id: 'RESP_' + Date.now() } };
            },
            readMessages: async () => {},
            sendPresenceUpdate: async () => {}
        };

        groupAuthService.attach(mockClient);

        const incomingMsg = {
            key: { remoteJid: testGroup, id: 'MSG_LINK_PARTNER_1', participant: partnerUser },
            message: {
                conversation: 'Link do parceiro: https://instagram.com/perfilparceiro'
            }
        };

        await handleIncomingMessage(mockClient, { messages: [incomingMsg] });

        // Não deve banir nem apagar
        assert.strictEqual(callOrder.some(c => c.type === 'ban'), false, 'Parceiro não pode ser banido');
        assert.strictEqual(callOrder.some(c => c.type === 'delete'), false, 'Mensagem do parceiro não pode ser apagada');
    });
});
