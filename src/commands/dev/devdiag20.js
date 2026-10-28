/**
 * Comando .diagtopcmd — COMANDOS MAIS USADOS
 *
 * Ranking de uso real registrado no banco.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

/** Tela para quando a leitura falha (o detalhe já foi para o logger pela sonda). */
function semLeitura(prefix, emoji, titulo, oque) {
    return F.tela({ emoji, titulo, intro: 'Não consegui ler ' + oque + ' agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix })
}

module.exports = {
    name: 'diagtopcmd',
    aliases: ["diagtop","cmd_diagtopcmd","alt_diagtopcmd","atalho_diagtopcmd","abrev_diagtopcmd","call_diagtopcmd","func_diagtopcmd"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Ranking dos comandos mais usados, com dados reais do banco',
    examples: [' — mostra os 15 comandos mais usados'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const u = D.usoDeComandos(15)
    if (u.erro) return reply(semLeitura(prefix, '🔥', 'Comandos mais usados', 'o uso de comandos'))
    if (!u.topo.length) {
        return reply(F.tela({
            emoji: '🔥',
            titulo: 'Comandos mais usados',
            intro: 'Ainda não tenho nenhum uso registrado.',
            secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Os 15 comandos mais executados, com a quantidade de vezes de cada um. Cada comando que alguém usa entra na contagem.'] }],
            dica: 'Se eu já estou em uso há tempo e isto continua vazio, a gravação de uso pode estar desligada.',
            proximos: [
                { nome: 'menu', oque: 'usar um comando e começar a contagem' },
                { nome: 'diagtelemetria', oque: 'telemetria geral' }
            ],
            prefix
        }))
    }
    const maior = Math.max(...u.topo.map(c => Number(c.execution_count ?? c.count ?? 0)), 1)
    const linhas = u.topo.map((c, i) => {
        const nome = c.command_name || c.name || '?'
        const n = Number(c.execution_count ?? c.count ?? 0)
        return `${i + 1}. ${F.cmd(prefix, nome)} — *${n.toLocaleString('pt-BR')}* ${'▰'.repeat(Math.max(1, Math.round(n / maior * 8)))}`
    })
    const primeiro = u.topo[0]
    return reply(F.tela({
        emoji: '🔥',
        titulo: 'Comandos mais usados',
        intro: `O preferido é ${F.cmd(prefix, primeiro.command_name || primeiro.name || '?')}, de *${Number(u.total).toLocaleString('pt-BR')}* execuções registradas.`,
        secoes: [{ emoji: '🏆', titulo: 'Ranking', linhas }],
        dica: 'Os comandos do topo merecem mais cuidado: um erro neles afeta quase todo mundo.',
        proximos: [
            { nome: 'diaguso', oque: 'uso por categoria' },
            { nome: 'diagtelemetria', oque: 'telemetria geral' }
        ],
        prefix
    }))
    }
}
