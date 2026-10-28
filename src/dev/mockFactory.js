/**
 * Mock Factory
 * Utilitários para criação de mocks do Baileys e contextos de mensagens
 */

function createMockSocket() {
    const sentMessages = []
    const groupUpdates = []

    return {
        sentMessages,
        groupUpdates,
        sendMessage: async (jid, content, options = {}) => {
            const msgObj = { jid, content, options, timestamp: Date.now() }
            sentMessages.push(msgObj)
            return msgObj
        },
        groupMetadata: async (groupJid) => ({
            id: groupJid,
            subject: 'Grupo Dev Teste',
            participants: [
                { id: '5511999999999@s.whatsapp.net', admin: 'admin' },
                { id: '5511888888888@s.whatsapp.net', admin: null },
                { id: '5511000000000@s.whatsapp.net', admin: 'superadmin' }
            ]
        }),
        groupParticipantsUpdate: async (groupJid, participants, action) => {
            const updateObj = { groupJid, participants, action, timestamp: Date.now() }
            groupUpdates.push(updateObj)
            return updateObj
        }
    }
}

function createMockMessage(text, sender = '5511888888888@s.whatsapp.net', from = '120363000000000000@g.us', isGroup = true) {
    return {
        key: {
            remoteJid: from,
            fromMe: false,
            id: `MOCK_MSG_${Date.now()}`,
            participant: isGroup ? sender : undefined
        },
        message: {
            conversation: text
        }
    }
}

function createMockContext(text, options = {}) {
    const sender = options.sender || '5511888888888@s.whatsapp.net'
    const isGroup = options.isGroup !== undefined ? options.isGroup : true
    const from = options.from || (isGroup ? '120363000000000000@g.us' : sender)
    const isAdmin = options.isAdmin !== undefined ? options.isAdmin : false
    const isBotAdmin = options.isBotAdmin !== undefined ? options.isBotAdmin : true
    const isOwner = options.isOwner !== undefined ? options.isOwner : false
    const client = options.client || createMockSocket()

    const capturedReplies = []
    const reply = async (msg, mentions = []) => {
        capturedReplies.push({ msg, mentions })
        return client.sendMessage(from, { text: msg, mentions })
    }

    const commandParts = (text || '').trim().split(/ +/)
    const commandName = commandParts[0]?.startsWith('.') ? commandParts[0].slice(1) : commandParts[0]
    const args = commandParts.slice(1)

    return {
        commandName,
        args,
        text: args.join(' '),
        body: text,
        from,
        sender,
        isGroup,
        isAdmin,
        isBotAdmin,
        isOwner,
        client,
        reply,
        capturedReplies,
        info: createMockMessage(text, sender, from, isGroup)
    }
}

module.exports = {
    createMockSocket,
    createMockMessage,
    createMockContext
}

