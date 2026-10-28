/**
 * Comando .jwtdecode
 * Decodificador rápido do conteúdo de tokens JWT
 */

const F = require("../../utils/formato");
const logger = require("../../core/logger");

const EXEMPLO = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.assinatura';

module.exports = {
    name: "jwtdecode",
    aliases: ["decodificarjwt","parsejwt","jwtinfo","cmd_jwtdecode","alt_jwtdecode","atalho_jwtdecode","abrev_jwtdecode","call_jwtdecode","func_jwtdecode"],
    category: "dev",
    subcategory: "Dev",
    description: "Mostra rapidamente o conteúdo de um token JWT",
    usage: '<token>',
    examples: [`${EXEMPLO} — decodifica um token de exemplo`],
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = '.' }) => {
    const token = args[0];
    if (!token || !token.includes(".")) {
        return reply(F.tela({
            emoji: '🔑',
            titulo: 'Decodificar token JWT',
            intro: 'Mostra o conteúdo (a parte do meio) de um token JWT.',
            secoes: [
                { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'jwtdecode', '<cabeçalho.conteúdo.assinatura>')] },
                { emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'jwtdecode', EXEMPLO)] }
            ],
            dica: 'Não cole tokens de produção no grupo: qualquer pessoa aqui consegue ler o conteúdo.',
            proximos: [{ nome: 'jwtinspect', args: EXEMPLO, oque: 'ver também o cabeçalho' }],
            prefix
        }));
    }
    try {
        const parts = token.split(".");
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        const exp = payload.exp ? new Date(payload.exp * 1000) : null;
        return reply(F.tela({
            emoji: '🔑',
            titulo: 'Conteúdo do JWT',
            intro: '```json\n' + JSON.stringify(payload, null, 2).slice(0, 1800) + '\n```',
            secoes: [{
                emoji: '📋', titulo: 'Resumo',
                linhas: [
                    F.campo('Campos', String(Object.keys(payload).length)),
                    exp ? F.campo('Expira em', exp.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + (Date.now() > exp.getTime() ? ' (já expirou)' : ' (ainda vale)')) : F.campo('Expira em', 'sem data de expiração')
                ]
            }],
            dica: 'A assinatura não foi verificada: decodificar só mostra o que está escrito.',
            proximos: [{ nome: 'jwtinspect', args: token.slice(0, 40) + '...', oque: 'ver também o cabeçalho' }],
            prefix
        }));
    } catch (e) {
        logger.warn(`[JWTDECODE] Falha ao decodificar token: ${e.message}`);
        return reply(F.tela({
            emoji: '🔑',
            titulo: 'Não consegui ler o token',
            intro: 'A parte do meio do token não é um JSON válido. Confira se copiou o token inteiro, sem espaços.',
            secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'jwtdecode', EXEMPLO)] }],
            prefix
        }));
    }
}
};
