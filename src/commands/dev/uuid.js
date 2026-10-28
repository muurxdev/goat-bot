/**
 * Comando .uuid
 * Gerador de identificadores únicos universais (UUID v4)
 */

const { generateUUID } = require('../../services/devService')

module.exports = {
    name: 'uuid',
    aliases: ["guid","uuidv4","cmd_uuid","alt_uuid","atalho_uuid","abrev_uuid","call_uuid","func_uuid"],
    category: 'dev',
    description: 'Gera identificadores únicos universais (UUID v4) criptograficamente seguros',
    execute: async ({ reply }) => {
        const id1 = generateUUID()
        const id2 = generateUUID()
        const id3 = generateUUID()

        const msg = `🆔 *GERADOR DE UUID v4*

1️⃣ \`${id1}\`
2️⃣ \`${id2}\`
3️⃣ \`${id3}\`

_🎲 Gerados com entropia criptográfica nativa (crypto.randomUUID)_`

        await reply(msg)
    }
}

