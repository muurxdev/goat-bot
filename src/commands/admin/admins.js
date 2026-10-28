const logger = require('../../core/logger')
const F = require('../../utils/formato')
const groupAuthService = require('../../services/groupAuthService')

module.exports = {
    name: 'admins',
    aliases: ["admlist","listadm","administradores","listaradmins","mods","cmd_admins","alt_admins","atalho_admins","abrev_admins","call_admins","func_admins"],
    category: 'admin',
    description: 'Lista os administradores do grupo',
    examples: [' — mostra quem administra o grupo'],
    groupOnly: true,
    execute: async ({ from, client, reply, prefix = '.' }) => {
        let groupData
        try {
            groupData = await groupAuthService.getGroupData(from)
        } catch (err) {
            logger.warn(`[ADMINS] Falha ao ler administradores de ${from}: ${err.message}`)
            return reply(F.tela({
                emoji: '❌', titulo: 'Não consegui ver os administradores', prefix,
                intro: 'O WhatsApp não me mandou a lista do grupo agora. Tente de novo em instantes.',
                proximos: [{ nome: 'admins', oque: 'tenta de novo' }]
            }))
        }

        const { admins, isBotAdmin } = groupData
        if (!admins || admins.size === 0) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Lista de administradores vazia', prefix,
                intro: 'O WhatsApp não me mostrou nenhum administrador neste grupo. Isso costuma passar sozinho; tente de novo em instantes.',
                proximos: [{ nome: 'admins', oque: 'tenta de novo' }]
            }))
        }

        const lista = Array.from(admins)
        const linhas = lista.map(jid => {
            const eu = groupAuthService.isBotJid(jid, client)
            return `${eu ? '🍺' : '👤'} @${jid.split('@')[0].split(':')[0]}${eu ? ' (eu)' : ''}`
        })

        return reply(F.tela({
            emoji: '👑', titulo: 'Administradores do grupo', prefix,
            intro: `Este grupo tem *${admins.size}* administrador${admins.size === 1 ? '' : 'es'}.`,
            secoes: [{ emoji: '🛡️', titulo: 'Quem administra', linhas }],
            dica: isBotAdmin
                ? 'Eu sou administrador aqui, então consigo promover, rebaixar, remover e fechar o grupo quando pedirem.'
                : 'Eu ainda não sou administrador aqui. Me promova para eu conseguir remover, promover e fechar o grupo.',
            proximos: [
                { nome: 'adm', args: '@pessoa', oque: 'promove ou rebaixa alguém' },
                { nome: 'infogrupo', oque: 'dados completos do grupo' }
            ]
        }), lista)
    }
}
