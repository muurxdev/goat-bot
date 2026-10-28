/**
 * Comando .json
 * Validador e formatador/minificador de JSON
 */

const { processJson } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

const MODOS = ['format', 'formatar', 'minify', 'minificar', 'validate', 'validar']

function telaUso(prefix, titulo, intro) {
    return F.tela({
        emoji: '📋',
        titulo,
        intro,
        secoes: [
            { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'json', '<format|minify|validate> <json>')] },
            { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                F.cmd(prefix, 'json', 'format {"nome":"GOAT","versao":2}') + ' — organiza com recuo',
                F.cmd(prefix, 'json', 'minify {"a": 1, "b": 2}') + ' — tira os espaços',
                F.cmd(prefix, 'json', 'validate {"status": "ok"}') + ' — só confere'
            ]) }
        ],
        dica: 'Chaves e textos em JSON usam aspas duplas; aspas simples dão erro.',
        prefix
    })
}

module.exports = {
    name: 'json',
    aliases: ["jsonformat","jsonminify","jsonval","cmd_json","alt_json","atalho_json","abrev_json","call_json","func_json"],
    category: 'dev',
    subcategory: 'Dev',
    description: 'Valida, formata ou compacta um texto em JSON',
    usage: '<format|minify|validate> <json>',
    examples: ['format {"nome":"GOAT"} — organiza com recuo', 'minify {"a": 1} — tira os espaços', 'validate {"ok": true} — só confere'],
    execute: async ({ args, text, reply, prefix = '.' }) => {
        const sub = args[0]?.toLowerCase()

        if (!text || (!MODOS.includes(sub) && args.length < 1)) {
            return reply(telaUso(prefix, 'Ferramenta de JSON', 'Formata, compacta ou valida JSON. Diga o modo e cole o conteúdo.'))
        }

        const isMinify = sub === 'minify' || sub === 'minificar'
        const rawJson = MODOS.includes(sub) ? args.slice(1).join(' ') : text

        if (!rawJson) {
            return reply(telaUso(prefix, 'Faltou o JSON', `Você escolheu *${sub}*, mas não colou o conteúdo depois.`))
        }

        try {
            const result = processJson(rawJson, isMinify ? 'minify' : 'format')
            if (sub === 'validate' || sub === 'validar') {
                return reply(F.tela({
                    emoji: '✅',
                    titulo: 'JSON válido',
                    intro: 'A estrutura segue o padrão JSON (RFC 8259).',
                    secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Caracteres', String(rawJson.length))] }],
                    proximos: [{ nome: 'json', args: 'format ' + rawJson.slice(0, 40), oque: 'ver formatado' }],
                    prefix
                }))
            }

            await reply(F.tela({
                emoji: '📋',
                titulo: `JSON ${isMinify ? 'MINIFICADO' : 'FORMATADO'}`,
                intro: '```json\n' + result.slice(0, 3000) + '\n```',
                secoes: [{
                    emoji: '📏', titulo: 'Tamanho',
                    linhas: [F.campo('Antes', `${rawJson.length} caracteres`), F.campo('Depois', `${result.length} caracteres`), result.length > 3000 ? F.campo('Aviso', 'resultado cortado em 3000 caracteres') : null]
                }],
                proximos: [isMinify
                    ? { nome: 'json', args: 'format ' + result.slice(0, 40), oque: 'formatar com recuo' }
                    : { nome: 'json', args: 'minify ' + rawJson.slice(0, 40), oque: 'compactar' }],
                prefix
            }))
        } catch (err) {
            logger.warn(`[JSON] Conteúdo inválido: ${err.message}`)
            const pos = String(err.message).match(/position (\d+)/)
            await reply(telaUso(prefix, 'JSON com erro de escrita',
                'Não consegui ler esse JSON.' + (pos ? ` O problema começa perto do caractere *${pos[1]}*.` : '') +
                ' Confira aspas duplas, vírgulas sobrando e chaves sem fechar.'))
        }
    }
}
