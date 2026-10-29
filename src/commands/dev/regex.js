/**
 * Comando .regex
 * Testador seguro de Expressões Regulares (RegExp)
 */

const { testRegex } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

function telaUso(prefix, titulo, intro) {
    return F.tela({
        emoji: '🔬',
        titulo,
        intro,
        secoes: [
            { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'regex', '/padrão/flags texto de teste'), F.cmd(prefix, 'regex', 'padrão texto de teste')] },
            { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                F.cmd(prefix, 'regex', '/[0-9]{3}/g Meu código é 123 e 456') + ' — acha todos os números de 3 dígitos',
                F.cmd(prefix, 'regex', '/^[a-z0-9]+$/i goat123') + ' — confere se só tem letras e números',
                F.cmd(prefix, 'regex', '/(?<ano>\\d{4})/ nasci em 1998') + ' — captura um grupo com nome'
            ]) }
        ],
        dica: 'Flags: g acha todas as ocorrências, i ignora maiúsculas, m trata cada linha separada.',
        proximos: [{ nome: 'regexcheatsheet', oque: 'colinha de expressões regulares' }],
        prefix
    })
}

module.exports = {
    name: 'regex',
    aliases: ["regexp","regextest","cmd_regex","alt_regex","atalho_regex","abrev_regex","call_regex","func_regex"],
    category: 'dev',
    subcategory: 'Regex',
    description: 'Testa uma expressão regular contra um texto e mostra o que ela encontra',
    usage: '/padrão/flags <texto>',
    examples: ['/[0-9]{3}/g código 123 e 456 — acha números de 3 dígitos', '/^[a-z]+$/i ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — confere se só tem letras'],
    execute: async ({ text, args, reply, prefix = '.' }) => {
        if (!text) {
            return reply(telaUso(prefix, 'Testador de regex', 'Mostra se uma expressão regular encontra algo no texto e o que ela captura.'))
        }

        // Formato esperado: /pattern/flags texto de teste
        const regexMatch = text.match(/^\/(.+?)\/([gimsuy]*)\s+([\s\S]+)$/)

        let pattern = ''
        let flags = ''
        let testString = ''

        if (regexMatch) {
            pattern = regexMatch[1]
            flags = regexMatch[2]
            testString = regexMatch[3]
        } else {
            // Formato alternativo: .regex pattern texto
            pattern = args[0]
            testString = args.slice(1).join(' ')
        }

        if (!pattern || !testString) {
            return reply(telaUso(prefix, 'Faltou o texto de teste', 'Mande a expressão e, depois de um espaço, o texto onde ela deve procurar.'))
        }

        try {
            const res = testRegex(pattern, flags, testString)
            const linhas = [
                F.campo('Padrão', '`/' + pattern + '/' + flags + '`'),
                F.campo('Entrada', '`' + testString.slice(0, 200) + '`')
            ]
            const achados = []
            if (res.matched) {
                achados.push(F.campo('Primeira ocorrência', '`' + res.firstMatch + '`'))
                if (res.allMatches && res.allMatches.length > 1) {
                    achados.push(F.campo(`Todas (${res.allMatches.length})`, '`' + res.allMatches.slice(0, 30).join(', ') + '`'))
                }
                if (res.groups) achados.push('*Grupos capturados:*\n```json\n' + JSON.stringify(res.groups, null, 2) + '\n```')
            }

            await reply(F.tela({
                emoji: '🔬',
                titulo: 'Teste de regex',
                intro: res.matched ? '✅ *MATCH ENCONTRADO*' : '❌ *Nenhuma ocorrência encontrada*',
                secoes: [
                    { emoji: '📋', titulo: 'Entrada', linhas },
                    { emoji: '🎯', titulo: 'Resultado', linhas: achados }
                ],
                dica: res.matched
                    ? (flags.includes('g') ? 'Com a flag g eu listo todas as ocorrências.' : 'Quer todas as ocorrências? Adicione a flag g depois da barra final.')
                    : 'Confira maiúsculas (flag i) e se o texto de teste tem mesmo o que você procura.',
                proximos: [{ nome: 'regexcheatsheet', oque: 'colinha de expressões regulares' }],
                prefix
            }))
        } catch (err) {
            logger.warn(`[REGEX] Padrão inválido "/${pattern}/${flags}": ${err.message}`)
            await reply(telaUso(prefix, 'Expressão com erro de escrita',
                `Não consegui montar a expressão *${pattern}*. Costuma ser parêntese, colchete ou chave sem fechar, ou uma barra sem a contrabarra antes.`))
        }
    }
}
