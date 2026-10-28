/**
 * Comando .diagtemp — PASTA TEMPORÁRIA
 *
 * Arquivos temporários acumulados.
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
    name: 'diagtemp',
    aliases: ["diagtemporarios","cmd_diagtemp","alt_diagtemp","atalho_diagtemp","abrev_diagtemp","call_diagtemp","func_diagtemp"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Arquivos temporários acumulados (downloads e conversões)',
    examples: [' — mostra a pasta temporária'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.pesoDoDiretorio('temp')
    if (r.erro) return reply(semLeitura(prefix, '🗑️', 'Pasta temporária', 'a pasta temporária'))
    const recentes = D.arquivosRecentes('temp', 8)
    const lista = Array.isArray(recentes) ? recentes : []
    const situacao = r.arquivos > 500 ? '🟡 Muitos arquivos acumulados' : r.arquivos ? '🟢 Sob controle' : '🟢 Vazia'
    return reply(F.tela({
        emoji: '🗑️',
        titulo: 'Pasta temporária',
        intro: r.arquivos
            ? `${situacao}: *${r.arquivos}* arquivo(s) somando *${D.tamanho(r.bytes)}*.`
            : '🟢 Vazia. Nenhum download ou conversão deixou arquivo para trás.',
        secoes: [
            { emoji: '📋', titulo: 'Resumo', linhas: [F.campo('Arquivos', String(r.arquivos)), F.campo('Peso', D.tamanho(r.bytes)), F.campo('Situação', situacao)] },
            lista.length ? { emoji: '🕐', titulo: 'Mais recentes', linhas: F.lista(lista.map(a => `${a.nome.slice(0, 32)} · ${D.tamanho(a.bytes)}`)) } : null
        ],
        dica: 'Aqui ficam os arquivos de downloads e figurinhas enquanto são processados. Arquivo antigo parado costuma ser download que falhou.',
        proximos: [
            { nome: 'queue', oque: 'downloads em andamento' },
            { nome: 'diagdisco', oque: 'espaço de todas as pastas' }
        ],
        prefix
    }))
    }
}
