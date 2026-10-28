/**
 * Comando .b64
 * Codificador e decodificador Base64
 */

const { encodeBase64, decodeBase64 } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

const OPS = ['encode', 'decode', 'codificar', 'decodificar']

function telaUso(prefix, titulo, intro) {
    return F.tela({
        emoji: '🔒',
        titulo,
        intro,
        secoes: [
            { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'b64', 'encode <texto>'), F.cmd(prefix, 'b64', 'decode <base64>')] },
            { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                F.cmd(prefix, 'b64', 'encode Olá Mundo') + ' — transforma em Base64',
                F.cmd(prefix, 'b64', 'decode T2zDoSBNdW5kbw==') + ' — volta para texto'
            ]) }
        ],
        dica: 'Base64 não é criptografia: qualquer pessoa decodifica. Não use para esconder senhas.',
        proximos: [{ nome: 'textb64url', oque: 'Base64 seguro para links' }, { nome: 'hash', args: 'sha256 texto', oque: 'gerar um hash' }],
        prefix
    })
}

module.exports = {
    name: 'b64',
    aliases: ["base64","b64encode","b64decode","cmd_b64","alt_b64","atalho_b64","abrev_b64","call_b64","func_b64"],
    category: 'dev',
    subcategory: 'Cifra',
    description: 'Codifica texto em Base64 ou decodifica Base64 de volta para texto',
    usage: '<encode|decode> <texto>',
    examples: ['encode Olá Mundo — transforma em Base64', 'decode T2zDoSBNdW5kbw== — volta para texto'],
    execute: async ({ args, text, reply, prefix = '.' }) => {
        const sub = args[0]?.toLowerCase()

        if (!text || (!OPS.includes(sub) && args.length < 1)) {
            return reply(telaUso(prefix, 'Conversor Base64', 'Codifica texto em Base64 ou decodifica de volta. Diga a operação e o texto.'))
        }

        const isDecode = sub === 'decode' || sub === 'decodificar'
        const content = OPS.includes(sub) ? args.slice(1).join(' ') : text

        if (!content) {
            return reply(telaUso(prefix, 'Faltou o texto', `Você escolheu *${sub}*, mas não mandou o texto depois.`))
        }

        try {
            if (isDecode) {
                const decoded = decodeBase64(content)
                await reply(F.tela({
                    emoji: '🔓',
                    titulo: 'Base64 decodificado',
                    intro: '```\n' + decoded + '\n```',
                    secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Entrada', `${content.length} caracteres`), F.campo('Saída', `${decoded.length} caracteres`)] }],
                    dica: 'Se aparecerem símbolos estranhos, o texto de entrada provavelmente não era Base64.',
                    proximos: [{ nome: 'b64', args: 'encode ' + decoded.slice(0, 30), oque: 'codificar de novo' }],
                    prefix
                }))
            } else {
                const encoded = encodeBase64(content)
                await reply(F.tela({
                    emoji: '🔒',
                    titulo: 'Base64 codificado',
                    intro: '```\n' + encoded + '\n```',
                    secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Entrada', `${content.length} caracteres`), F.campo('Saída', `${encoded.length} caracteres`)] }],
                    dica: 'Base64 não é criptografia: qualquer pessoa decodifica.',
                    proximos: [{ nome: 'b64', args: 'decode ' + encoded.slice(0, 40), oque: 'decodificar de volta' }],
                    prefix
                }))
            }
        } catch (err) {
            logger.warn(`[B64] Falha ao ${isDecode ? 'decodificar' : 'codificar'}: ${err.message}`)
            await reply(telaUso(prefix, 'Não consegui converter', 'Confira se o texto está completo e tente de novo.'))
        }
    }
}
