/**
 * Comando .diagloop — ATRASO DO LAÇO
 *
 * Mede se o processo está travando; explica lentidão geral.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagloop',
    aliases: ["diaglag","diaglaco","cmd_diagloop","alt_diagloop","atalho_diagloop","abrev_diagloop","call_diagloop","func_diagloop"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Mede se meu processo está travando; explica lentidão geral',
    examples: [' — mede o atraso do laço de eventos'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const r = await D.atrasoDoLaco(8)
    const veredito = r.mediaMs < 10 ? '🟢 Saudável' : r.mediaMs < 50 ? '🟡 Sob pressão' : '🔴 Travando'
    return reply(F.tela({
        emoji: '🔁',
        titulo: 'Atraso do laço',
        intro: `${veredito} · média de *${r.mediaMs.toFixed(2)} ms* por volta.`,
        secoes: [{
            emoji: '📋', titulo: 'Medição',
            linhas: [
                F.campo('Média', r.mediaMs.toFixed(2) + ' ms'),
                F.campo('Pior amostra', r.maiorMs.toFixed(2) + ' ms'),
                F.campo('Amostras', String(r.amostras)),
                F.campo('Referência', 'abaixo de 10 ms é saudável; acima de 50 ms trava tudo')
            ]
        }],
        dica: 'Atraso alto significa que algo bloqueia o processo inteiro. É a melhor pista quando eu demoro para responder.',
        proximos: [
            { nome: 'diagcpu', oque: 'uso de processador' },
            { nome: 'diagmemoria', oque: 'uso de memória' },
            { nome: 'diagtemp', oque: 'arquivos temporários acumulados' }
        ],
        prefix
    }))
    }
}
