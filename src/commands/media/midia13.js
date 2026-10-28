/**
 * Comando .midiatemp — PASTA TEMPORÁRIA
 *
 * Quanto espaço a mídia baixada está ocupando.
 */

const M = require('../../services/mediaInfoService')
const F = require('../../utils/formato')

module.exports = {
    name: 'midiatemp',
    aliases: ["pastatemporaria"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Quanto espaço a mídia baixada está ocupando',
    examples: [' — mostra a pasta temporária de downloads'],
    cooldownMs: 2500,
    execute: async ({ reply, prefix = '.' }) => {
    const t = M.pesoTemporario()
    if (!t.existe) {
        return reply(F.tela({
            emoji: '🗑️',
            titulo: 'Pasta temporária',
            intro: 'A pasta temporária ainda não existe. Ela aparece no primeiro download.',
            proximos: [{ nome: 'queue', oque: 'downloads em andamento' }],
            prefix
        }))
    }
    const muitos = t.arquivos > 200
    return reply(F.tela({
        emoji: '🗑️',
        titulo: 'Pasta temporária',
        intro: t.arquivos
            ? `${muitos ? '🟡 Muitos arquivos acumulados' : '🟢 Espaço sob controle'}: *${t.arquivos}* arquivo(s), *${M.tamanho(t.bytes)}*.`
            : '🟢 Vazia. Nenhum download deixou arquivo para trás.',
        secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [F.campo('Arquivos', String(t.arquivos)), F.campo('Peso', M.tamanho(t.bytes))] }],
        dica: 'Aqui ficam áudios e vídeos enquanto eu baixo e envio. Depois do envio eles são apagados; arquivo parado costuma ser download que falhou.',
        proximos: [
            { nome: 'queue', oque: 'downloads em andamento' },
            { nome: 'midialimites', oque: 'tamanho máximo aceito' }
        ],
        prefix
    }))
    }
}
