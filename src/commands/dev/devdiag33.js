/**
 * Comando .diagassets — PASTA DE RECURSOS
 *
 * Peso das minhas imagens, áudios e figurinhas fixas.
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
    name: 'diagassets',
    aliases: ["diagrecursosarq","cmd_diagassets","alt_diagassets","atalho_diagassets","abrev_diagassets","call_diagassets","func_diagassets"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Peso das minhas imagens, áudios e figurinhas fixas',
    examples: [' — mostra a pasta de recursos'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.pesoDoDiretorio('assets')
    if (r.erro) return reply(semLeitura(prefix, '🎨', 'Pasta de recursos', 'a pasta de recursos'))
    if (!r.existe) {
        return reply(F.tela({
            emoji: '🎨',
            titulo: 'Pasta de recursos',
            intro: 'A pasta de recursos não existe. Figurinhas e áudios de eventos e imagens de menu não vão aparecer.',
            proximos: [{ nome: 'diagdisco', oque: 'espaço de todas as pastas' }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🎨',
        titulo: 'Pasta de recursos',
        intro: `*${r.arquivos}* arquivo(s) somando *${D.tamanho(r.bytes)}*.`,
        secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [F.campo('Arquivos', String(r.arquivos) + (r.truncado ? ' (contagem parcial)' : '')), F.campo('Peso', D.tamanho(r.bytes)), F.campo('Conteúdo', 'imagens, figurinhas e áudios fixos')] }],
        dica: 'Esta pasta muda pouco. Crescimento grande de uma hora para outra costuma ser arquivo enviado por engano.',
        proximos: [{ nome: 'diagdisco', oque: 'espaço de todas as pastas' }],
        prefix
    }))
    }
}
