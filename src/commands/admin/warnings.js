/**
 * Comando .warnings / .avisos
 * Mostra quantas advertências alguém tem, contra o limite do grupo.
 *
 * A tabela warns guarda só o jid, sem grupo: o total soma todos os grupos em
 * que o bot está. A tela diz isso em vez de prometer "neste grupo".
 *
 * Lia `chatJid`, campo que o contexto não tem — o limite mostrado era sempre 3,
 * mesmo com o grupo configurado para outro valor.
 */

const dataService = require('../../services/dataService')
const F = require('../../utils/formato')
const groupRemovalService = require('../../services/groupRemovalService')

module.exports = {
    name: 'warnings',
    aliases: ["avisos","warns","cmd_warnings","alt_warnings","atalho_warnings","abrev_warnings","call_warnings","func_warnings"],
    category: 'admin',
    description: 'Consulta a quantidade de advertências de um usuário',
    usage: '[@pessoa]',
    examples: [' — mostra as suas advertências', '@fulano — mostra as advertências de outra pessoa'],
    groupOnly: true,
    execute: async ({ info, sender, from, args = [], quotedSender, reply, prefix = '.' }) => {
        const alvo = groupRemovalService.extrairAlvo({ info, args, quotedSender }) || sender
        const total = dataService.getWarnsData()[alvo] || 0
        const limite = dataService.getConfigsData()[from]?.warnLimit || 3

        const eu = alvo === sender
        const quem = eu ? 'Você' : `@${alvo.split('@')[0].split(':')[0]}`
        const falta = limite - total
        const situacao = total === 0
            ? '🟢 Ficha limpa, nenhuma advertência.'
            : falta > 1 ? `🟡 Faltam ${falta} para chegar ao limite.`
                : falta === 1 ? '🟠 Mais uma advertência e a punição do grupo é aplicada.'
                    : '🔴 Chegou ao limite de advertências.'
        await reply(F.tela({
            emoji: '⚠️', titulo: 'Advertências', prefix,
            intro: `${quem} tem *${total} de ${limite}* advertências, somando todos os grupos em que estou. O limite é o deste grupo.`,
            secoes: [{ emoji: '📋', titulo: 'Situação', linhas: [
                F.campo('Advertências', `${total} de ${limite}`),
                F.barra(limite ? total / limite : 0),
                situacao
            ] }],
            dica: eu ? 'Para ver as de outra pessoa, marque ou responda a mensagem dela.' : '',
            proximos: [
                { nome: 'warnings', args: '@pessoa', oque: 'vê as advertências de alguém' },
                { nome: 'limparavisos', args: eu ? '@pessoa' : '@' + alvo.split('@')[0].split(':')[0], oque: 'zera as advertências (administração)' }
            ]
        }), [alvo])
    }
}
