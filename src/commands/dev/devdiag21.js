/**
 * Comando .diaguso — USO POR CATEGORIA
 *
 * Quais categorias de comando são realmente usadas.
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
    name: 'diaguso',
    aliases: ["diagusage","cmd_diaguso","alt_diaguso","atalho_diaguso","abrev_diaguso","call_diaguso","func_diaguso"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quais categorias de comando são realmente usadas',
    examples: [' — mostra o uso por categoria'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const u = D.usoDeComandos()
    if (u.erro) return reply(semLeitura(prefix, '📈', 'Uso por categoria', 'o uso de comandos'))
    const cats = u.categorias || []
    if (!cats.length) {
        return reply(F.tela({
            emoji: '📈',
            titulo: 'Uso por categoria',
            intro: 'Ainda não tenho dados de uso.',
            secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Cada categoria (RPG, economia, mídia...) com o total de execuções, para você ver o que o grupo realmente usa. A contagem começa quando alguém usa um comando.'] }],
            proximos: [
                { nome: 'diagtopcmd', oque: 'comandos mais usados' },
                { nome: 'diagcategorias', oque: 'quantos comandos cada categoria tem' }
            ],
            prefix
        }))
    }
    const valorDe = (c) => Number(c.total_executions ?? c.total ?? c.count ?? 0)
    const maior = Math.max(...cats.map(valorDe), 1)
    const total = Number(u.total) || cats.reduce((a, c) => a + valorDe(c), 0)
    const linhas = cats.map(c => {
        const nome = c.category || c.categoria || '?'
        const n = valorDe(c)
        const cmds = c.command_count ? ` · ${c.command_count} comandos` : ''
        return `${F.campo(nome, n.toLocaleString('pt-BR') + cmds)}\n${F.barra(n / maior, 8)}`
    })
    const topo = cats.slice().sort((a, b) => valorDe(b) - valorDe(a))[0]
    return reply(F.tela({
        emoji: '📈',
        titulo: 'Uso por categoria',
        intro: `*${topo.category || topo.categoria || '?'}* lidera, com ${Math.round(valorDe(topo) / Math.max(1, total) * 100)}% de *${total.toLocaleString('pt-BR')}* execuções.`,
        secoes: [{ emoji: '📊', titulo: 'Categorias', linhas }],
        dica: 'A barra compara cada categoria com a mais usada, não com o total.',
        proximos: [
            { nome: 'diagtopcmd', oque: 'comandos mais usados' },
            { nome: 'diagcategorias', oque: 'quantos comandos cada categoria tem' }
        ],
        prefix
    }))
    }
}
