/**
 * Comando .diaglogs — ARQUIVOS DE REGISTRO
 *
 * Peso e data dos arquivos de registro (logs).
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
    name: 'diaglogs',
    aliases: ["diagregistros","cmd_diaglogs","alt_diaglogs","atalho_diaglogs","abrev_diaglogs","call_diaglogs","func_diaglogs"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Peso e data dos arquivos de registro de erros e eventos',
    examples: [' — mostra os arquivos de registro'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.pesoDoDiretorio('logs')
    if (r.erro) return reply(semLeitura(prefix, '📋', 'Arquivos de registro', 'a pasta de registros'))
    if (!r.existe || !r.arquivos) {
        return reply(F.tela({
            emoji: '📋',
            titulo: 'Arquivos de registro',
            intro: r.existe ? 'A pasta de registros está vazia.' : 'A pasta de registros ainda não existe.',
            secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Quantos arquivos de registro existem, quanto pesam e os mais recentes. A pasta é criada quando eu gravo o primeiro registro em arquivo.'] }],
            dica: 'Se estou no ar há tempo e nada foi gravado, os registros provavelmente estão indo só para o terminal (ou para o docker logs).',
            proximos: [{ nome: 'diagvida', oque: 'tempo no ar' }, { nome: 'diagdisco', oque: 'espaço de todas as pastas' }],
            prefix
        }))
    }
    const recentes = D.arquivosRecentes('logs', 8)
    const lista = Array.isArray(recentes) ? recentes : []
    return reply(F.tela({
        emoji: '📋',
        titulo: 'Arquivos de registro',
        intro: `*${r.arquivos}* arquivo(s) somando *${D.tamanho(r.bytes)}*.`,
        secoes: [
            { emoji: '📋', titulo: 'Resumo', linhas: [F.campo('Arquivos', String(r.arquivos)), F.campo('Peso', D.tamanho(r.bytes))] },
            lista.length ? { emoji: '🕐', titulo: 'Mais recentes', linhas: F.lista(lista.map(a => `${a.nome.slice(0, 30)} · ${D.tamanho(a.bytes)} · ${new Date(a.modificadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`)) } : null
        ],
        dica: 'Registros muito grandes deixam a máquina lenta para ler; apague os antigos de tempos em tempos.',
        proximos: [{ nome: 'diagdisco', oque: 'espaço de todas as pastas' }],
        prefix
    }))
    }
}
