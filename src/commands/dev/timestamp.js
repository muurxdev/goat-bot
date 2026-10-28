/**
 * Comando .timestamp
 * Converte timestamps UNIX e datas para múltiplos formatos
 */

const { convertTimestamp } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

module.exports = {
    name: 'timestamp',
    aliases: ["epoch","ts","cmd_timestamp","alt_timestamp","atalho_timestamp","abrev_timestamp","call_timestamp","func_timestamp"],
    category: 'dev',
    subcategory: 'Data',
    description: 'Converte timestamp Unix e datas para ISO, UTC e horário de Brasília',
    usage: '[timestamp ou data]',
    examples: [' — agora em todos os formatos', '1700000000 — timestamp em segundos', '2026-08-30T18:00:00Z — data ISO'],
    cooldownMs: 2000,
    execute: async ({ text, reply, prefix = '.' }) => {
        try {
            const res = convertTimestamp(text)
            await reply(F.tela({
                emoji: '🕒',
                titulo: text ? 'Conversão de timestamp' : 'Timestamp de agora',
                intro: `Horário de Brasília: *${res.brt}*`,
                secoes: [
                    {
                        emoji: '🔢', titulo: 'Unix',
                        linhas: [
                            F.campo('Segundos', '`' + res.unixSeconds + '`'),
                            F.campo('Milissegundos', '`' + res.unixMillis + '`')
                        ]
                    },
                    {
                        emoji: '🌐', titulo: 'Formatos de data',
                        linhas: [
                            F.campo('ISO 8601', '`' + res.iso + '`'),
                            F.campo('UTC', res.utc)
                        ]
                    }
                ],
                dica: 'Número com até 10 dígitos eu leio como segundos; com mais, como milissegundos.',
                proximos: [
                    { nome: 'timestamp', args: String(res.unixSeconds), oque: 'converter um timestamp' },
                    { nome: 'timestamp2date', args: String(res.unixSeconds), oque: 'só a data legível' },
                    { nome: 'date2timestamp', args: '2026-12-25', oque: 'data para timestamp' }
                ],
                prefix
            }))
        } catch (err) {
            logger.warn(`[TIMESTAMP] Entrada não convertida "${String(text).slice(0, 60)}": ${err.message}`)
            await reply(F.tela({
                emoji: '🕒',
                titulo: 'Não entendi essa data',
                intro: `*${String(text).slice(0, 60)}* não é um timestamp nem uma data que eu reconheça.`,
                secoes: [{
                    emoji: '📝', titulo: 'Exemplos',
                    linhas: F.lista([
                        F.cmd(prefix, 'timestamp') + ' — agora',
                        F.cmd(prefix, 'timestamp', '1700000000') + ' — timestamp em segundos',
                        F.cmd(prefix, 'timestamp', '2026-08-30T18:00:00Z') + ' — data ISO'
                    ])
                }],
                prefix
            }))
        }
    }
}
