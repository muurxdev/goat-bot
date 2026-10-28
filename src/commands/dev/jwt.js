/**
 * Comando .jwt
 * Decodificador e inspetor de cabeçalho e conteúdo de JSON Web Tokens (JWT)
 */

const { decodeJWT } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

const EXEMPLO = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.assinatura'

function telaUso(prefix, titulo, intro) {
    return F.tela({
        emoji: '🎫',
        titulo,
        intro,
        secoes: [
            { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'jwt', '<token>')] },
            { emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'jwt', EXEMPLO)] }
        ],
        dica: 'Não cole tokens de produção no grupo: qualquer pessoa aqui consegue ler o conteúdo.',
        proximos: [{ nome: 'jwtdecode', args: EXEMPLO, oque: 'só o conteúdo' }],
        prefix
    })
}

module.exports = {
    name: 'jwt',
    aliases: ["token","cmd_jwt","alt_jwt","atalho_jwt","abrev_jwt","call_jwt","func_jwt"],
    category: 'dev',
    subcategory: 'Dev',
    description: 'Mostra cabeçalho, conteúdo e validade de um token JWT',
    usage: '<token>',
    examples: [`${EXEMPLO} — inspeciona um token de exemplo`],
    execute: async ({ text, reply, prefix = '.' }) => {
        if (!text) {
            return reply(telaUso(prefix, 'Inspecionar token JWT', 'Mostra o cabeçalho, o conteúdo e se o token já expirou.'))
        }

        try {
            const decoded = decodeJWT(text.trim())
            const headerStr = JSON.stringify(decoded.header, null, 2)
            const payloadStr = JSON.stringify(decoded.payload, null, 2)
            const exp = decoded.payload.exp ? new Date(decoded.payload.exp * 1000) : null
            const expirado = exp ? Date.now() > exp.getTime() : false

            await reply(F.tela({
                emoji: '🎫',
                titulo: 'Inspeção de JWT',
                intro: exp
                    ? (expirado ? `⚠️ Este token *expirou* em ${exp.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.` : `✅ Este token *ainda vale* até ${exp.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.`)
                    : 'Este token não tem data de expiração.',
                secoes: [
                    { emoji: '📦', titulo: 'Cabeçalho', linhas: ['```json\n' + headerStr + '\n```'] },
                    { emoji: '📋', titulo: 'Conteúdo', linhas: ['```json\n' + payloadStr.slice(0, 1500) + '\n```'] },
                    { emoji: '🔏', titulo: 'Assinatura', linhas: [F.campo('Presente', decoded.signaturePresent ? 'sim' : 'não'), F.campo('Verificada', 'não (preciso da chave para isso)')] }
                ],
                dica: 'Decodificar não é validar: só a assinatura prova que o token é legítimo.',
                proximos: [{ nome: 'timestamp', args: decoded.payload.exp ? String(decoded.payload.exp) : '', oque: 'converter datas do token' }],
                prefix
            }))
        } catch (err) {
            logger.warn(`[JWT] Token não decodificado: ${err.message}`)
            const formato = /Formato de JWT/.test(err.message)
            await reply(telaUso(prefix,
                formato ? 'Token com formato errado' : 'Não consegui ler o token',
                formato ? 'Um JWT tem partes separadas por ponto, e o seu não tem.' : 'As partes do token não formam um JSON válido. Confira se copiou o token inteiro, sem espaços.'))
        }
    }
}
