/**
 * Testes Unitários e de Integração:
 * - Correção dos Escudos de Segurança (Anti-Link, Anti-Spam, Anti-Fake, Anti-Trava, Anti-Delete, Anti-Scam)
 * - Correção do Painel .config ("se não ativou não fica lá como ativado, se desligar fica desligado")
 * - Transcrição de Áudio (.transcrever) com Ficha Técnica e Subcomandos
 * - Anti-Delete no messageHandler com recuperação de mensagens revogadas
 */

const assert = require('assert')
const path = require('path')

describe('🛡️ Escudos Anti-*, .config e .transcrever', () => {
    const dataService = require('../src/services/dataService')
    const configCmd = require('../src/commands/admin/config')
    const antideleteCmd = require('../src/commands/admin/antidelete')
    const antiscamCmd = require('../src/commands/admin/antiscam')
    const transcreverCmd = require('../src/commands/media/transcrever')
    const { handleIncomingMessage, _recentMessages, recordRecentMessage } = require('../src/handlers/messageHandler')

    const testGroup = '120363999999999999@g.us'
    const testSender = '5511999999999@s.whatsapp.net'

    beforeEach(async () => {
        // Limpa estado do grupo de teste no SQLite
        const configs = dataService.getConfigsData()
        configs[testGroup] = {}
        await dataService.saveConfigsData(configs)
        _recentMessages.clear()
    })

    it('1. Grupo novo sem configuração NÃO deve exibir nada como "🟢 Ativado" no painel .config', async () => {
        let sentMessage = ''
        const reply = (msg) => { sentMessage = typeof msg === 'string' ? msg : (msg?.text || msg?.caption || '') }

        await configCmd.execute({
            from: testGroup,
            args: [],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })

        // Garante que abertura, fechamento e figurinhas começam desligados
        assert.ok(sentMessage.includes('Abertura:* 🔴 Desativado'), 'Abertura não deve começar ativada')
        assert.ok(sentMessage.includes('Fechamento:* 🔴 Desativado'), 'Fechamento não deve começar ativado')
        assert.ok(sentMessage.includes('Boas-Vindas:* 🔴 Desativado'), 'Boas-Vindas não deve começar ativada')
        assert.ok(sentMessage.includes('Despedida:* 🔴 Desativado'), 'Despedida não deve começar ativada')
        assert.ok(sentMessage.includes('Figurinhas de Evento:* 🔴 Desativadas'), 'Figurinhas não devem começar ativadas')

        // Garante que os escudos começam desligados
        assert.ok(sentMessage.includes('Anti-Link:* 🔴 Desligado'), 'Anti-Link não deve começar ativo')
        assert.ok(sentMessage.includes('Anti-Spam:* 🔴 Desligado'), 'Anti-Spam não deve começar ativo')
        assert.ok(sentMessage.includes('Anti-Fake (+55):* 🔴 Desligado'), 'Anti-Fake não deve começar ativo')
        assert.ok(sentMessage.includes('Anti-Trava:* 🔴 Desligado'), 'Anti-Trava não deve começar ativo')
        assert.ok(sentMessage.includes('Anti-Delete:* 🔴 Desligado'), 'Anti-Delete não deve começar ativo')
        assert.ok(sentMessage.includes('Anti-Golpe (Scam):* 🔴 Desligado'), 'Anti-Golpe não deve começar ativo')
    })

    it('2. Subcomandos do .config devem ligar e desligar escudos com persistência', async () => {
        let sentMessage = ''
        const reply = (msg) => { sentMessage = typeof msg === 'string' ? msg : (msg?.text || '') }

        // Ativa antilink via .config
        await configCmd.execute({
            from: testGroup,
            args: ['antilink', 'on'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        let configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antilink, true, 'Antilink deve estar true no SQLite')

        // Desativa antilink via .config
        await configCmd.execute({
            from: testGroup,
            args: ['antilink', 'off'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antilink, false, 'Antilink deve estar false no SQLite')

        // Ativa antidelete via .config
        await configCmd.execute({
            from: testGroup,
            args: ['antidelete', 'on'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antidelete, true, 'Antidelete deve estar true no SQLite')

        // Ativa antiscam via .config
        await configCmd.execute({
            from: testGroup,
            args: ['antiscam', 'on'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antiscam, true, 'Antiscam deve estar true no SQLite')
    })

    it('3. Comando direto .antidelete on/off deve alternar o estado do grupo', async () => {
        let sentMessage = ''
        const reply = (msg) => { sentMessage = typeof msg === 'string' ? msg : (msg?.text || '') }

        await antideleteCmd.execute({
            from: testGroup,
            args: ['on'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        let configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antidelete, true)
        assert.ok(sentMessage.includes('ATIVADO'))

        await antideleteCmd.execute({
            from: testGroup,
            args: ['off'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antidelete, false)
        assert.ok(sentMessage.includes('DESATIVADO'))
    })

    it('4. Comando direto .antiscam on/off deve alternar o estado de proteção contra fraudes', async () => {
        let sentMessage = ''
        const reply = (msg) => { sentMessage = typeof msg === 'string' ? msg : (msg?.text || '') }

        await antiscamCmd.execute({
            from: testGroup,
            args: ['on'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        let configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antiscam, true)

        await antiscamCmd.execute({
            from: testGroup,
            args: ['off'],
            reply,
            sender: testSender,
            isOwner: true,
            isAdmin: true,
            prefix: '.'
        })
        configs = dataService.getConfigsData()
        assert.strictEqual(configs[testGroup]?.antiscam, false)
    })

    it('5. Anti-Delete: Ao receber REVOKE de mensagem recente, deve avisar o grupo se ativo', async () => {
        const configs = dataService.getConfigsData()
        configs[testGroup] = { antidelete: true }
        await dataService.saveConfigsData(configs)

        const msgId = 'MSG_TEST_REVOKE_123'
        recordRecentMessage(msgId, {
            id: msgId,
            text: 'Texto confidencial que o usuário apagou',
            sender: testSender,
            from: testGroup,
            timestamp: Date.now()
        })

        let sentPayload = null
        const mockClient = {
            sendMessage: async (to, payload) => {
                sentPayload = { to, payload }
                return { key: { id: 'RESP_1' } }
            },
            readMessages: async () => {}
        }

        const revokeMessage = {
            key: { remoteJid: testGroup, id: 'REVOKE_EVENT_ID', participant: testSender },
            message: {
                protocolMessage: {
                    type: 0, // REVOKE
                    key: { remoteJid: testGroup, id: msgId, participant: testSender }
                }
            }
        }

        await handleIncomingMessage(mockClient, { messages: [revokeMessage] })

        assert.ok(sentPayload, 'Deveria ter enviado notificação de anti-delete')
        assert.strictEqual(sentPayload.to, testGroup)
        assert.ok(sentPayload.payload.text.includes('ANTI-DELETE ATIVO'))
        assert.ok(sentPayload.payload.text.includes('Texto confidencial que o usuário apagou'))
    })

    it('6. .transcrever: Ficha técnica exibida com dignidade e precisão quando sem provedor STT', async () => {
        let sentText = ''
        const reply = (msg) => { sentText = typeof msg === 'string' ? msg : (msg?.text || '') }

        const mockClient = {
            sendMessage: async () => ({ key: { id: 'OK' } })
        }

        // Simula áudio baixado de 140 KB
        const audioBuffer = Buffer.alloc(140 * 1024, 0x12)
        const mediaService = require('../src/services/mediaService')
        const originalDownload = mediaService.downloadWhatsAppMedia
        mediaService.downloadWhatsAppMedia = async () => audioBuffer

        // Garante sem provedor STT para testar a Ficha Técnica
        const transcriptionService = require('../src/services/transcriptionService')
        const originalHasStt = transcriptionService.hasSttProvider
        transcriptionService.hasSttProvider = () => false

        try {
            await transcreverCmd.execute({
                from: testGroup,
                reply,
                client: mockClient,
                info: {
                    key: { remoteJid: testGroup, id: 'AUD_1' },
                    message: {
                        audioMessage: { mimetype: 'audio/ogg; codecs=opus' }
                    }
                },
                args: [],
                sender: testSender
            })

            assert.ok(sentText.includes('ÁUDIO DETECTADO (STT)'), 'Deve apresentar o cabeçalho de áudio detectado')
            assert.ok(sentText.includes('Ficha Técnica da Mensagem'), 'Deve conter ficha técnica')
            assert.ok(sentText.includes('140.0 KB'), 'Deve calcular tamanho exato')
            assert.ok(!sentText.includes('Não consegui abrir esse áudio'), 'Não deve mentir com erro de abertura')
        } finally {
            mediaService.downloadWhatsAppMedia = originalDownload
            transcriptionService.hasSttProvider = originalHasStt
        }
    })

    it('7. .transcrever: Subcomandos resumo e tradução com provedor STT ativo', async () => {
        let sentText = ''
        const reply = (msg) => { sentText = typeof msg === 'string' ? msg : (msg?.text || '') }

        const mockClient = {
            sendMessage: async () => ({ key: { id: 'OK' } })
        }

        const audioBuffer = Buffer.alloc(10 * 1024, 0x55)
        const mediaService = require('../src/services/mediaService')
        const aiService = require('../src/services/aiService')
        const transcriptionService = require('../src/services/transcriptionService')

        const originalDownload = mediaService.downloadWhatsAppMedia
        const originalTranscribeDirect = aiService.transcribeAudioDirect
        const originalAskAI = aiService.askAI
        const originalHasStt = transcriptionService.hasSttProvider

        mediaService.downloadWhatsAppMedia = async () => audioBuffer
        transcriptionService.hasSttProvider = () => true
        aiService.transcribeAudioDirect = async () => ({
            text: 'Reunião marcada para as 15 horas sobre o lançamento do novo servidor.',
            engine: 'Groq Whisper Large V3'
        })
        aiService.askAI = async (prompt) => {
            if (prompt.includes('resumo')) return '• Reunião às 15h sobre lançamento de servidor.'
            if (prompt.includes('Traduza')) return 'Meeting scheduled for 3 PM about the new server launch.'
            return 'OK'
        }

        try {
            // Teste de Resumo
            await transcreverCmd.execute({
                from: testGroup,
                reply,
                client: mockClient,
                info: {
                    key: { remoteJid: testGroup, id: 'AUD_2' },
                    message: { audioMessage: { mimetype: 'audio/ogg' } }
                },
                args: ['resumo'],
                sender: testSender
            })
            assert.ok(sentText.includes('TRANSCRIÇÃO & RESUMO'))
            assert.ok(sentText.includes('Reunião às 15h sobre lançamento de servidor.'))

            // Teste de Tradução
            await transcreverCmd.execute({
                from: testGroup,
                reply,
                client: mockClient,
                info: {
                    key: { remoteJid: testGroup, id: 'AUD_3' },
                    message: { audioMessage: { mimetype: 'audio/ogg' } }
                },
                args: ['traduzir', 'en'],
                sender: testSender
            })
            assert.ok(sentText.includes('TRANSCRIÇÃO & TRADUÇÃO'))
            assert.ok(sentText.includes('Meeting scheduled for 3 PM'))
        } finally {
            mediaService.downloadWhatsAppMedia = originalDownload
            aiService.transcribeAudioDirect = originalTranscribeDirect
            aiService.askAI = originalAskAI
            transcriptionService.hasSttProvider = originalHasStt
        }
    })
})
