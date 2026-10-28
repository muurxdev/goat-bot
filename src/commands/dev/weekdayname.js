/**
 * Comando .weekdayname — Retorna o dia da semana de qualquer data: .weekdayname AAAA-MM-DD
 */
const F = require('../../utils/formato')

module.exports = {
    name: "weekdayname",
    aliases: ["weekdayname-cmd","cmd-weekdayname","cmd_weekdayname","alt_weekdayname","atalho_weekdayname","abrev_weekdayname","call_weekdayname","func_weekdayname"],
    category: "dev",
    subcategory: "Data",
    description: "Diz em que dia da semana cai uma data (sem data, usa hoje)",
    usage: '[AAAA-MM-DD]',
    examples: [' — dia da semana de hoje', '2026-12-25 — Natal de 2026', '2000-01-01 — virada do milênio'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const raw = args[0];
            const d = raw ? new Date(raw) : new Date();
            if (isNaN(d.getTime())) return reply(F.tela({
                emoji: '📅',
                titulo: 'Data não reconhecida',
                intro: `Não entendi a data *${raw}*. Use o formato ano-mês-dia.`,
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'weekdayname', '<AAAA-MM-DD>')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'weekdayname', '2026-12-25'), F.cmd(prefix, 'weekdayname', '2000-01-01')]) }
                ],
                prefix
            }));
            const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
            const iso = d.toISOString().split("T")[0];
            const hojeUtc = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z');
            const alvoUtc = new Date(iso + 'T00:00:00Z');
            const diff = Math.round((alvoUtc - hojeUtc) / 86400000);
            const distancia = diff === 0 ? 'hoje' : diff > 0 ? `daqui a ${diff.toLocaleString('pt-BR')} dia(s)` : `há ${Math.abs(diff).toLocaleString('pt-BR')} dia(s)`;
            const dia = dias[d.getUTCDay()];
            return reply(F.tela({
                emoji: '📅',
                titulo: dia,
                intro: `A data *${iso.split('-').reverse().join('/')}* cai numa *${dia.toLowerCase()}*.`,
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Formato ISO', '`' + iso + '`'),
                        F.campo('Distância', distancia),
                        F.campo('Fim de semana', d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 'sim' : 'não')
                    ]
                }],
                proximos: [
                    { nome: 'diffdays', args: diff === 0 ? `${iso} ${Number(iso.slice(0, 4)) + (iso.slice(5) > '12-25' ? 1 : 0)}-12-25` : `${hojeUtc.toISOString().split('T')[0]} ${iso}`, oque: 'dias entre duas datas' },
                    { nome: 'adddays', args: `30 ${iso}`, oque: 'somar dias a uma data' },
                    { nome: 'isleapyear', args: iso.slice(0, 4), oque: 'ver se o ano é bissexto' }
                ],
                prefix
            }));
        }
};
