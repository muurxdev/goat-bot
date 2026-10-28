/**
 * Comando .hash
 * Gerador de hashes criptográficos (MD5, SHA1, SHA256, SHA512)
 */

const { generateHash } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

const ALGOS = ['md5', 'sha1', 'sha256', 'sha512']

module.exports = {
    name: 'hash',
    aliases: ["sha256","md5","sha512","sha1","cmd_hash","alt_hash","atalho_hash","abrev_hash","call_hash","func_hash"],
    category: 'dev',
    subcategory: 'Segurança',
    description: 'Gera o hash MD5, SHA1, SHA256 ou SHA512 de um texto',
    usage: '[algoritmo] <texto>',
    examples: ['sha256 minha_senha — hash SHA256', 'md5 texto — hash MD5', 'olá — sem algoritmo usa SHA256'],
    execute: async ({ commandName, command, args = [], text, reply, prefix = '.' }) => {
        const cmdUsed = (commandName || command || 'hash').toLowerCase()
        let algo = 'sha256'
        let input = text

        if (ALGOS.includes(cmdUsed)) {
            algo = cmdUsed
        } else if (ALGOS.includes(args[0]?.toLowerCase())) {
            algo = args[0].toLowerCase()
            input = args.slice(1).join(' ')
        }

        if (!input) {
            return reply(F.tela({
                emoji: '🔐',
                titulo: 'Gerador de hash',
                intro: 'Transforma um texto numa impressão digital de tamanho fixo. O mesmo texto sempre gera o mesmo hash.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'hash', '[algoritmo] <texto>'), 'Atalhos: ' + ALGOS.map(a => F.cmd(prefix, a, '<texto>')).join(', ')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                        F.cmd(prefix, 'hash', 'sha256 minha_senha_secreta'),
                        F.cmd(prefix, 'md5', 'texto_aqui'),
                        F.cmd(prefix, 'sha512', 'dados importantes')
                    ]) },
                    { emoji: '⚙️', titulo: 'Algoritmos', linhas: [ALGOS.join(', ') + ' (sem escolher, uso sha256)'] }
                ],
                dica: 'MD5 e SHA1 servem para conferir arquivos, mas não são seguros para senhas.',
                proximos: [{ nome: 'b64', args: 'encode texto', oque: 'codificar em Base64' }],
                prefix
            }))
        }

        try {
            const hashResult = generateHash(algo, input)
            await reply(F.tela({
                emoji: '🔐',
                titulo: 'HASH CRIPTOGRÁFICO',
                intro: '```\n' + hashResult + '\n```',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Algoritmo', algo.toUpperCase()),
                        F.campo('Entrada', '`' + input.slice(0, 50) + '`' + (input.length > 50 ? '…' : '')),
                        F.campo('Tamanho', `${hashResult.length} caracteres hexadecimais`)
                    ]
                }],
                dica: 'Mudar uma única letra da entrada gera um hash completamente diferente.',
                proximos: ALGOS.filter(a => a !== algo).slice(0, 2).map(a => ({ nome: a, args: input.slice(0, 30), oque: `o mesmo texto em ${a.toUpperCase()}` })),
                prefix
            }))
        } catch (err) {
            logger.warn(`[HASH] Falha ao gerar ${algo}: ${err.message}`)
            await reply(F.tela({
                emoji: '🔐',
                titulo: 'Não consegui gerar o hash',
                intro: 'Algo deu errado com esse texto. Tente de novo com outro texto.',
                secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'hash', 'sha256 teste')] }],
                prefix
            }))
        }
    }
}
