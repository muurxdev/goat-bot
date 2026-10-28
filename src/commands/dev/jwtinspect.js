/**
 * Comando .jwtinspect — Mostra cabeçalho e conteúdo de um token JWT: .jwtinspect <token>
 */
const F = require('../../utils/formato')
const logger = require('../../core/logger')

const EXEMPLO = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.assinatura'

module.exports = {
    name: "jwtinspect",
    aliases: ["jwtinspect-cmd","cmd-jwtinspect","cmd_jwtinspect","alt_jwtinspect","atalho_jwtinspect","abrev_jwtinspect","call_jwtinspect","func_jwtinspect"],
    category: "dev",
    subcategory: "Dev",
    description: "Mostra o cabeçalho e o conteúdo de um token JWT",
    usage: '<token>',
    examples: [`${EXEMPLO} — decodifica um token de exemplo`],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const token = args[0] || "";
            const parts = token.split(".");
            if (parts.length !== 3) return reply(F.tela({
                emoji: '🔐',
                titulo: token ? 'Token com formato errado' : 'Inspecionar token JWT',
                intro: token
                    ? `Um JWT tem 3 partes separadas por ponto, e o seu tem ${parts.length}.`
                    : 'Mostra o que vai dentro de um token JWT: o cabeçalho e o conteúdo.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'jwtinspect', '<cabeçalho.conteúdo.assinatura>')] },
                    { emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'jwtinspect', EXEMPLO)] }
                ],
                dica: 'Não cole tokens de produção no grupo: qualquer pessoa aqui consegue ler o conteúdo.',
                proximos: [{ nome: 'jwt', args: EXEMPLO, oque: 'inspeção com data de expiração' }],
                prefix
            }));
            try {
                const h = JSON.parse(Buffer.from(parts[0], "base64").toString("utf-8"));
                const p = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
                return reply(F.tela({
                    emoji: '🔐',
                    titulo: 'JWT decodificado',
                    intro: `Algoritmo *${h.alg || 'não informado'}*. A assinatura não foi verificada.`,
                    secoes: [
                        { emoji: '📦', titulo: 'Cabeçalho', linhas: ['```json\n' + JSON.stringify(h, null, 2) + '\n```'] },
                        { emoji: '📋', titulo: 'Conteúdo', linhas: ['```json\n' + JSON.stringify(p, null, 2).slice(0, 1500) + '\n```'] }
                    ],
                    dica: 'Decodificar não é validar: qualquer um pode montar um token assim. Só a assinatura prova que ele é legítimo.',
                    proximos: [{ nome: 'jwt', args: token.slice(0, 40) + '...', oque: 'ver expiração do token' }],
                    prefix
                }));
            } catch (e) {
                logger.warn(`[JWTINSPECT] Falha ao decodificar token: ${e.message}`);
                return reply(F.tela({
                    emoji: '🔐',
                    titulo: 'Não consegui ler o token',
                    intro: 'As partes do token não formam um JSON válido. Confira se copiou o token inteiro, sem espaços.',
                    secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'jwtinspect', EXEMPLO)] }],
                    prefix
                }));
            }
        }
};
