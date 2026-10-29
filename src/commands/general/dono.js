const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .dono / .donos / .owner
 * Mostra quem são os donos, com a patente de cada um, contato e quem nomeou.
 */

const { getOwners, resolveOwnerName } = require('../../services/ownerService')
const { getBotName } = require('../../config/botConfig')
const { formatPhoneFromJid } = require('../../config/env')
const F = require('../../utils/formato')

const ICONES = {
    'Capitão': '🎖️',
    'Tenente': '⚔️',
    'Sargento': '🛡️',
    'Cabo': '🔹',
    'Soldado': '▫️'
}

const TITULOS = {
    'Capitão': 'Capitão (comandante)',
    'Tenente': 'Tenente (subcomandante)',
    'Sargento': 'Sargento',
    'Cabo': 'Cabo',
    'Soldado': 'Soldado'
}

module.exports = {
    name: 'dono',
    aliases: ['owner', 'criador', 'donos', 'patentes', 'donodobot'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Mostra quem são os donos do bot, a patente e o contato de cada um',
    examples: [' — lista os donos, as patentes e como falar com eles'],
    execute: async ({ reply, prefix = '.' }) => {
        const owners = getOwners()
        const botName = getBotName()
        const mentions = []

        const ativos = owners.filter(o => o.active && o.jid)
        const vagos = owners.filter(o => !(o.active && o.jid))

        const linhasAtivos = []
        for (const o of ativos) {
            mentions.push(o.jid)
            const icone = ICONES[o.rank] || '👑'
            const patente = o.customTitle ? `${o.customTitle} (${TITULOS[o.rank] || o.rank})` : (TITULOS[o.rank] || o.rank)
            const marca = `${nomeDoMembro(o.jid)}`
            // Nome puxado do perfil do WhatsApp ou do nick cadastrado
            const nome = resolveOwnerName(o)
            const quem = nome && nome !== o.rank ? `${marca} (${nome})` : marca
            const contato = o.phone || formatPhoneFromJid(o.jid)

            // Linha em branco entre um dono e outro
            linhasAtivos.push(`${linhasAtivos.length ? '\n' : ''}${icone} *${patente}*`)
            linhasAtivos.push(F.campo('Quem', quem))
            if (contato) linhasAtivos.push(F.campo('Contato', contato))
            if (o.appointedBy) linhasAtivos.push(F.campo('Nomeado por', o.appointedBy))
        }

        const doc = F.tela({
            emoji: '👑',
            titulo: 'Meus donos',
            intro: `Sou *${botName}*. ` + (ativos.length
                ? `${ativos.length === 1 ? 'Uma pessoa cuida de mim, e é com ela' : `${ativos.length} pessoas cuidam de mim, e é com elas`} que você fala sobre aluguel, problemas ou sugestões.`
                : 'Ainda não tenho nenhum dono cadastrado.'),
            secoes: [
                { emoji: '🎖️', titulo: ativos.length === 1 ? 'Dono' : `Donos (${ativos.length})`, linhas: linhasAtivos },
                {
                    emoji: '▫️',
                    titulo: `Patentes vagas (${vagos.length})`,
                    linhas: vagos.length ? [vagos.map(o => o.customTitle || o.rank).join(', ')] : []
                }
            ],
            dica: `Novas patentes são dadas pelos próprios donos, com ${prefix}setdono <patente> @pessoa.`,
            proximos: [
                { nome: 'menu', oque: 'ver tudo o que posso fazer' },
                { nome: 'login', args: '<seu nick>', oque: 'fazer seu cadastro' }
            ],
            prefix
        })

        return reply(doc, mentions)
    }
}
