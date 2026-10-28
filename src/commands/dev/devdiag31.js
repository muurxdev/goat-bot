/**
 * Comando .diagbackups — CÓPIAS DE SEGURANÇA
 *
 * Cópias de segurança gravadas e quando.
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
    name: 'diagbackups',
    aliases: ["diagselos","cmd_diagbackups","alt_diagbackups","atalho_diagbackups","abrev_diagbackups","call_diagbackups","func_diagbackups"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Cópias de segurança gravadas e quando foram feitas',
    examples: [' — lista as cópias de segurança'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.pesoDoDiretorio('backups')
    if (r.erro) return reply(semLeitura(prefix, '🔐', 'Cópias de segurança', 'a pasta de cópias'))
    if (!r.existe || !r.arquivos) {
        return reply(F.tela({
            emoji: '🔐',
            titulo: 'Cópias de segurança',
            intro: '🔴 Nenhuma cópia de segurança encontrada. Se o banco corromper hoje, não há de onde recuperar.',
            secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Quantas cópias existem, quanto pesam e há quantos dias cada uma foi feita.'] }],
            dica: 'Faça a primeira cópia agora; ela leva poucos segundos.',
            proximos: [
                { nome: 'backup', oque: 'fazer uma cópia de segurança agora' },
                { nome: 'diagintegridade', oque: 'verificar o banco' }
            ],
            prefix
        }))
    }
    const recentes = D.arquivosRecentes('backups', 8)
    const lista = Array.isArray(recentes) ? recentes : []
    const diasDe = (a) => Math.floor((Date.now() - new Date(a.modificadoEm).getTime()) / 86400000)
    const ultima = lista[0] ? diasDe(lista[0]) : null
    const situacao = ultima === null ? '🟡 Sem data' : ultima <= 1 ? '🟢 Em dia' : ultima <= 7 ? '🟡 Última há alguns dias' : '🔴 Desatualizada'
    return reply(F.tela({
        emoji: '🔐',
        titulo: 'Cópias de segurança',
        intro: `${situacao}: *${r.arquivos}* cópia(s), a mais nova de ${ultima === 0 ? 'hoje' : `há ${ultima} dia(s)`}.`,
        secoes: [
            { emoji: '📋', titulo: 'Resumo', linhas: [F.campo('Cópias', String(r.arquivos)), F.campo('Peso', D.tamanho(r.bytes))] },
            lista.length ? { emoji: '🕐', titulo: 'Mais recentes', linhas: F.lista(lista.map(a => `${a.nome.slice(0, 48)} · ${D.tamanho(a.bytes)} · há ${diasDe(a)} dia(s)`)) } : null
        ],
        dica: 'Para recuperar dados, use a cópia de antes do problema; não confunda com cópias feitas depois que o banco já estava ruim.',
        proximos: [
            { nome: 'backup', oque: 'fazer uma cópia agora' },
            { nome: 'backuplist', oque: 'lista completa das cópias' }
        ],
        prefix
    }))
    }
}
