/**
 * Comando .genpassstrong — Gera senha forte aleatória: .genpassstrong [tamanho=16]
 */
const F = require('../../utils/formato')

module.exports = {
    name: "genpassstrong",
    aliases: ["genpassstrong-cmd","cmd-genpassstrong","cmd_genpassstrong","alt_genpassstrong","atalho_genpassstrong","abrev_genpassstrong","call_genpassstrong","func_genpassstrong"],
    category: "dev",
    subcategory: "Segurança",
    description: "Gera uma senha forte aleatória de 8 a 64 caracteres",
    usage: '[tamanho]',
    examples: [' — senha de 16 caracteres', '24 — senha de 24 caracteres'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const len = Math.min(64, Math.max(8, parseInt(args[0]) || 16));
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
            let pass = "";
            for (let i = 0; i < len; i++) pass += chars[Math.floor(Math.random() * chars.length)];
            const bits = Math.round(len * Math.log2(chars.length));
            return reply(F.tela({
                emoji: '🔑',
                titulo: 'Senha forte gerada',
                intro: '`' + pass + '`',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Tamanho', `${len} caracteres (aceito de 8 a 64)`),
                        F.campo('Tipos', 'minúsculas, maiúsculas, números e símbolos'),
                        F.campo('Força estimada', `${bits} bits`)
                    ]
                }],
                dica: 'Guarde num gerenciador de senhas. Esta mensagem fica no grupo: para uma senha real, gere em conversa privada.',
                proximos: [
                    { nome: 'genpassstrong', args: '32', oque: 'senha ainda maior' },
                    { nome: 'genpasspin', oque: 'PIN só de números' }
                ],
                prefix
            }));
        }
};
