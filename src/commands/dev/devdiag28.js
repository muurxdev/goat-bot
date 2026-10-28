/**
 * Comando .diagdisco — ESPAÇO EM DISCO
 *
 * Quanto espaço ocupa cada pasta de dados minha.
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

const PASTAS = [
    ['data', 'banco e configurações'],
    ['temp', 'downloads em andamento'],
    ['logs', 'registros de erro'],
    ['backups', 'cópias de segurança'],
    ['sessao', 'login no WhatsApp'],
    ['assets', 'imagens e áudios fixos']
]

module.exports = {
    name: 'diagdisco',
    aliases: ["diagespaco","cmd_diagdisco","alt_diagdisco","atalho_diagdisco","abrev_diagdisco","call_diagdisco","func_diagdisco"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quanto espaço ocupa cada pasta de dados minha',
    examples: [' — mostra o peso de cada pasta'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    let total = 0
    const lidas = PASTAS.map(([p, uso]) => ({ p, uso, r: D.pesoDoDiretorio(p) }))
    for (const x of lidas) if (!x.r.erro && x.r.existe) total += x.r.bytes
    const maior = lidas.filter(x => !x.r.erro && x.r.existe).sort((a, b) => b.r.bytes - a.r.bytes)[0]
    const linhas = lidas.map(({ p, uso, r }) => {
        if (r.erro) return F.campo(p, 'não consegui ler')
        if (!r.existe) return F.campo(p, 'não existe')
        return F.campo(p, `${D.tamanho(r.bytes)} · ${r.arquivos} arquivos (${uso})${r.truncado ? ' · contagem parcial' : ''}`)
    })
    return reply(F.tela({
        emoji: '💽',
        titulo: 'Espaço em disco',
        intro: `Minhas pastas somam *${D.tamanho(total)}*${maior ? `; a maior é *${maior.p}*` : ''}.`,
        secoes: [{ emoji: '📁', titulo: 'Por pasta', linhas }],
        dica: 'Pasta temp grande costuma ser download que travou no meio; logs e backups crescem com o tempo e podem ser podados.',
        proximos: [
            { nome: 'diagtemp', oque: 'arquivos temporários' },
            { nome: 'diaglogs', oque: 'arquivos de registro' },
            { nome: 'diagbackups', oque: 'cópias de segurança' }
        ],
        prefix
    }))
    }
}
