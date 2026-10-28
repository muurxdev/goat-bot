/**
 * Fábrica de contexto para a auditoria de comandos.
 *
 * O `createMockContext` de src/dev/mockFactory.js cobre 13 campos; o ctx real
 * montado em src/handlers/messageHandler.js:909 tem 23. A diferença (user,
 * mentionedJid, type, directText, react, senderReal, quoted*) é justamente o
 * que os comandos leem, então um ctx pobre gera falso "comando quebrado".
 *
 * Aqui o ctx é montado com os 23 campos e com `user` vindo do xpService de
 * verdade — não um objeto inventado que diverge do schema real.
 */
const path = require('path')
const fs = require('fs')
const logger = require('../../src/core/logger')

const GRUPO = '120363000000000000@g.us'
const PV = '5511999990001@s.whatsapp.net'
const REMETENTE = '5511999990001@s.whatsapp.net'

const FIXTURES = path.join(__dirname, '..', 'fixtures')

/** Socket Baileys falso: qualquer método não listado vira async () => undefined. */
function criarClienteFalso (envios) {
    const base = {
        user: { id: '000000000000:1@s.whatsapp.net', name: 'GOAT Teste' },
        sendMessage: async (jid, conteudo, opcoes) => {
            envios.push({ jid, conteudo, opcoes })
            return { key: { id: 'env' + envios.length, remoteJid: jid } }
        },
        groupMetadata: async (jid) => ({
            id: jid,
            subject: 'Grupo Teste',
            desc: 'descricao de teste',
            owner: '5511999990001@s.whatsapp.net',
            participants: [
                { id: '5511999990001@s.whatsapp.net', admin: 'superadmin' },
                { id: '000000000000:1@s.whatsapp.net', admin: 'admin' },
                { id: '5511999990002@s.whatsapp.net', admin: null }
            ]
        }),
        groupParticipantsUpdate: async () => [{ status: '200' }],
        groupSettingUpdate: async () => true,
        groupUpdateSubject: async () => true,
        groupUpdateDescription: async () => true,
        groupInviteCode: async () => 'CODIGOFALSO123',
        groupRevokeInvite: async () => 'NOVOCODIGO456',
        profilePictureUrl: async () => 'https://exemplo.invalido/foto.jpg',
        updateProfilePicture: async () => true,
        sendPresenceUpdate: async () => true,
        readMessages: async () => true,
        onWhatsApp: async (n) => [{ exists: true, jid: String(n).replace(/\D/g, '') + '@s.whatsapp.net' }],
        fetchStatus: async () => ({ status: 'status de teste' }),
        ws: { readyState: 1 }
    }
    return new Proxy(base, {
        get (t, p) {
            if (p in t) return t[p]
            // Sem estas guardas o proxy vira "thenable": um `await client` (ou
            // qualquer Promise.resolve em cima dele) chama esse `then` falso,
            // que nunca resolve, e o comando aparece como travado. A interpolação
            // `${client}` lançava "Cannot convert object to primitive value" e
            // virava falso "quebrado".
            if (p === 'then' || p === 'catch' || p === 'finally') return undefined
            if (p === Symbol.toPrimitive) return () => '[cliente de teste]'
            if (p === Symbol.iterator || p === Symbol.asyncIterator) return undefined
            if (p === 'toJSON') return () => ({ falso: true })
            return async () => undefined
        }
    })
}

/** Mensagem citada com mídia real de tests/fixtures, para exercitar sharp/ffmpeg. */
function construirCitada (tipo) {
    if (!tipo) return null
    if (tipo === 'imagem') {
        return {
            imageMessage: {
                mimetype: 'image/png',
                fileLength: '4085',
                width: 240,
                height: 240,
                caption: '',
                mediaKey: Buffer.alloc(32),
                url: 'https://mmg.whatsapp.net/falso'
            }
        }
    }
    if (tipo === 'audio') {
        return { audioMessage: { mimetype: 'audio/ogg; codecs=opus', seconds: 2, fileLength: '4000', ptt: true, mediaKey: Buffer.alloc(32) } }
    }
    if (tipo === 'video') {
        return { videoMessage: { mimetype: 'video/mp4', seconds: 2, fileLength: '20000', width: 240, height: 240, mediaKey: Buffer.alloc(32) } }
    }
    if (tipo === 'texto') {
        return { conversation: 'texto da mensagem citada' }
    }
    return null
}

function lerFixture (tipo) {
    const arquivo = { imagem: 'imagem.png', audio: 'audio.mp3', video: 'video.mp4' }[tipo]
    if (!arquivo) return null
    const caminho = path.join(FIXTURES, arquivo)
    if (!fs.existsSync(caminho)) {
        logger.debug('[CTX-FALSO] fixture ausente: ' + arquivo)
        return null
    }
    return fs.readFileSync(caminho)
}

/**
 * @param {object} o
 * @param {object} o.cmd          comando (usa name/category)
 * @param {string[]} o.args
 * @param {boolean} o.isGroup     default true
 * @param {boolean} o.isOwner     default true (fura a camada opt-in do dispatcher)
 * @param {string|null} o.citada  'imagem' | 'audio' | 'video' | 'texto' | null
 */
function criarCtx (o = {}) {
    const cmd = o.cmd || { name: 'teste', category: 'general' }
    const args = o.args || []
    const isGroup = o.isGroup !== false
    const from = isGroup ? GRUPO : PV
    const sender = o.sender || REMETENTE
    const respostas = []
    const reacoes = []
    const envios = []

    const citada = construirCitada(o.citada)
    const textoCitado = o.citada === 'texto' ? 'texto da mensagem citada' : ''

    const mensagemBase = citada
        ? {
            extendedTextMessage: {
                text: '.' + cmd.name + (args.length ? ' ' + args.join(' ') : ''),
                contextInfo: {
                    stanzaId: 'citada1',
                    participant: '5511999990002@s.whatsapp.net',
                    quotedMessage: citada,
                    mentionedJid: []
                }
            }
        }
        : { conversation: '.' + cmd.name + (args.length ? ' ' + args.join(' ') : '') }

    const info = {
        key: { id: 'msg1', remoteJid: from, fromMe: false, participant: isGroup ? sender : undefined },
        message: mensagemBase,
        messageTimestamp: Math.floor(Date.now() / 1000),
        pushName: 'Usuario Teste'
    }

    let user = {}
    try {
        const xpService = require('../../src/services/xpService')
        user = xpService.initializeUser(sender, {}, [])
        user.registered = true
        user.rpgEnabled = true
    } catch (err) {
        logger.warn('[CTX-FALSO] initializeUser falhou, usando user minimo: ' + err.message)
        user = { jid: sender, xp: 0, level: 1, coins: 0, registered: true, rpgEnabled: true, inventario: [] }
    }

    const ctx = {
        commandName: cmd.name,
        args,
        text: args.join(' '),
        directText: args.join(' '),
        body: '.' + cmd.name + (args.length ? ' ' + args.join(' ') : ''),
        from,
        sender,
        senderReal: sender,
        roleJid: sender,
        isGroup,
        isAdmin: o.isAdmin !== false,
        isBotAdmin: o.isBotAdmin !== false,
        isOwner: o.isOwner !== false,
        // Derivado das flags, nunca fixo: um userRole de dono cravado aqui faz
        // um "usuario comum" passar por checagens de admin e mascara o resultado.
        userRole: o.isOwner !== false
            ? { level: 5, name: 'OWNER' }
            : (o.isAdmin !== false ? { level: 3, name: 'GROUP_ADMIN' } : { level: 1, name: 'USER' }),
        client: criarClienteFalso(envios),
        reply: async (texto, mentions) => {
            respostas.push({ texto: String(texto ?? ''), mentions: mentions || [] })
            return { key: { id: 'r' + respostas.length, remoteJid: from } }
        },
        react: async (emoji) => { reacoes.push(emoji); return true },
        info,
        type: citada ? 'extendedTextMessage' : 'conversation',
        quotedMsg: citada,
        quotedText: textoCitado,
        quotedSender: citada ? '5511999990002@s.whatsapp.net' : null,
        isQuoted: !!citada,
        prefix: '.',
        user,
        mentionedJid: o.mentionedJid || []
    }

    return { ctx, respostas, reacoes, envios }
}

module.exports = { criarCtx, criarClienteFalso, lerFixture, GRUPO, PV, REMETENTE }
