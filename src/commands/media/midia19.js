/**
 * Comando .cabeenvio — VAI CABER?
 *
 * Diz se um arquivo cabe no limite de envio.
 */

const M = require('../../services/mediaInfoService')
const F = require('../../utils/formato')

module.exports = {
    name: 'cabeenvio',
    aliases: ["vaicaber"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Diz se um arquivo cabe no meu limite de envio',
    usage: '<tamanho em MB>',
    examples: ['120 — confere um arquivo de 120 MB', '15,5 — aceita vírgula'],
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const mb = parseFloat(String(args[0] || '').replace(',', '.'))
    const l = M.limites()
    if (!mb || mb < 0) {
        return reply(F.tela({
            emoji: '📤',
            titulo: 'Vai caber?',
            intro: 'Diga o tamanho do arquivo em MB e eu confiro se consigo enviar.',
            secoes: [
                { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'cabeenvio', '<tamanho em MB>')] },
                { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'cabeenvio', '120'), F.cmd(prefix, 'cabeenvio', '15,5')]) },
                l.MAX_FILE_SIZE_BYTES ? { emoji: '📏', titulo: 'Meu limite', linhas: [F.campo('Tamanho máximo', M.tamanho(l.MAX_FILE_SIZE_BYTES))] } : null
            ],
            proximos: [{ nome: 'pesovideo', oque: 'estimar o tamanho de um vídeo' }],
            prefix
        }))
    }
    const bytes = mb * 1024 * 1024
    if (!l.MAX_FILE_SIZE_BYTES) {
        return reply(F.tela({
            emoji: '📤',
            titulo: 'Vai caber?',
            intro: 'Não tenho um limite de envio configurado, então não consigo comparar.',
            secoes: [{ emoji: '📋', titulo: 'Arquivo', linhas: [F.campo('Tamanho', M.tamanho(bytes))] }],
            proximos: [{ nome: 'midialimites', oque: 'limites de mídia' }],
            prefix
        }))
    }
    const cabe = bytes <= l.MAX_FILE_SIZE_BYTES
    return reply(F.tela({
        emoji: '📤',
        titulo: cabe ? 'Cabe' : 'Não cabe',
        intro: cabe
            ? `🟢 Um arquivo de *${M.tamanho(bytes)}* cabe no meu limite de *${M.tamanho(l.MAX_FILE_SIZE_BYTES)}*.`
            : `🔴 Um arquivo de *${M.tamanho(bytes)}* passa do meu limite de *${M.tamanho(l.MAX_FILE_SIZE_BYTES)}*.`,
        secoes: [{
            emoji: '📋', titulo: 'Comparação',
            linhas: [
                F.campo('Arquivo', M.tamanho(bytes)),
                F.campo('Meu limite', M.tamanho(l.MAX_FILE_SIZE_BYTES)),
                F.campo('Uso do limite', F.barra(Math.min(1, bytes / l.MAX_FILE_SIZE_BYTES)))
            ]
        }],
        dica: cabe ? '' : 'Vídeo grande costuma caber pedindo uma qualidade menor (por exemplo 720p em vez de 1080p).',
        proximos: [
            cabe ? null : { nome: 'bitrateideal', oque: 'qual qualidade usar para caber' },
            { nome: 'pesovideo', oque: 'estimar o tamanho de um vídeo' }
        ].filter(Boolean),
        prefix
    }))
    }
}
