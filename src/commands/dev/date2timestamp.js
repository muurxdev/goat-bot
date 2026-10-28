/**
 * Comando .date2timestamp — Gera timestamp unix da data atual ou especificada: .date2timestamp [AAAA-MM-DD]
 */
const F = require('../../utils/formato')

module.exports = {
    name: "date2timestamp",
    aliases: ["date2timestamp-cmd","cmd-date2timestamp","cmd_date2timestamp","alt_date2timestamp","atalho_date2timestamp","abrev_date2timestamp","call_date2timestamp","func_date2timestamp"],
    category: "dev",
    subcategory: "Data",
    description: "Transforma uma data em timestamp Unix (sem data, usa agora)",
    usage: '[AAAA-MM-DD]',
    examples: [' — timestamp de agora', '2026-12-25 — timestamp do Natal de 2026', '2026-12-25T18:00:00Z — com hora, em UTC'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const dateStr = args[0];
            const d = dateStr ? new Date(dateStr) : new Date();
            if (isNaN(d.getTime())) return reply(F.tela({
                emoji: '⏱️',
                titulo: 'Data não reconhecida',
                intro: `Não entendi a data *${dateStr}*. Use o formato ano-mês-dia.`,
                secoes: [{ emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'date2timestamp', '2026-12-25'), F.cmd(prefix, 'date2timestamp', '2026-12-25T18:00:00Z')]) }],
                proximos: [{ nome: 'date2timestamp', oque: 'timestamp de agora' }],
                prefix
            }));
            const seg = Math.floor(d.getTime() / 1000);
            return reply(F.tela({
                emoji: '⏱️',
                titulo: 'Timestamp Unix',
                intro: '`' + seg + '`',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Segundos', '`' + seg + '`'),
                        F.campo('Milissegundos', '`' + d.getTime() + '`'),
                        F.campo('Data (Brasília)', d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
                        F.campo('ISO 8601', '`' + d.toISOString() + '`')
                    ]
                }],
                dica: dateStr && !/T/.test(dateStr) ? 'Data sem hora é lida como meia-noite em UTC (21h do dia anterior em Brasília).' : 'Bancos e sistemas em JavaScript costumam usar milissegundos; a maioria das outras linguagens usa segundos.',
                proximos: [
                    { nome: 'timestamp2date', args: String(seg), oque: 'voltar de timestamp para data' },
                    { nome: 'timestamp', args: String(seg), oque: 'ver em vários formatos' }
                ],
                prefix
            }));
        }
};
