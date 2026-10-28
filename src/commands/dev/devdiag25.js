/**
 * Comando .diagnegra — LISTA NEGRA
 *
 * Quem está bloqueado e por quê.
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
    name: 'diagnegra',
    aliases: ["diagblacklist","cmd_diagnegra","alt_diagnegra","atalho_diagnegra","abrev_diagnegra","call_diagnegra","func_diagnegra"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quem está bloqueado de me usar e por quê',
    examples: [' — mostra a lista negra'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const b = D.listaNegra()
    if (b.erro) return reply(semLeitura(prefix, '🚫', 'Lista negra', 'a lista negra'))
    if (!b.total) {
        return reply(F.tela({
            emoji: '🚫',
            titulo: 'Lista negra',
            intro: '🟢 Ninguém está bloqueado.',
            secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Os números impedidos de usar qualquer comando meu, em qualquer grupo, com o motivo do bloqueio.'] }],
            dica: 'Bloqueio pela lista negra vale em todos os grupos; para um grupo só, prefira as ferramentas de moderação do grupo.',
            proximos: [{ nome: 'blacklist', oque: 'gerenciar a lista negra' }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🚫',
        titulo: 'Lista negra',
        intro: `*${b.total}* número(s) bloqueado(s).`,
        secoes: [{
            emoji: '📋', titulo: b.total > b.amostra.length ? `Primeiros ${b.amostra.length}` : 'Bloqueados',
            linhas: F.lista(b.amostra.map(x => `+${String(x.jid).split('@')[0]} — ${x.motivo || 'sem motivo registrado'}`))
        }],
        dica: 'Registre sempre o motivo: daqui a meses ninguém vai lembrar por que o número foi bloqueado.',
        proximos: [{ nome: 'blacklist', oque: 'gerenciar a lista negra' }],
        prefix
    }))
    }
}
