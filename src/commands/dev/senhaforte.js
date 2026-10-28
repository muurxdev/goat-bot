/**
 * Comando .senhaforte — gera uma senha forte aleatória.
 * Uso: .senhaforte [tamanho=16]
 */
const crypto = require('crypto')
const F = require('../../utils/formato')

module.exports = {
    name: 'senhaforte',
    aliases: ["senha","gerarpass","cmd_senhaforte","alt_senhaforte","atalho_senhaforte","abrev_senhaforte","call_senhaforte","func_senhaforte"],
    category: 'dev',
    subcategory: 'Ferramentas',
    description: 'Gera uma senha forte aleatória (ex.: .senhaforte 20)',
    usage: '[tamanho]',
    examples: [' — senha de 16 caracteres', '20 — senha de 20 caracteres', '64 — senha bem longa'],
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.' }) => {
        let len = parseInt(args[0], 10)
        const ajustado = !isNaN(len) && (len < 6 || len > 128)
        if (isNaN(len) || len < 6) len = 16
        len = Math.min(len, 128)
        const sets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?-_'
        let pass = ''
        const bytes = crypto.randomBytes(len)
        for (let i = 0; i < len; i++) pass += sets[bytes[i] % sets.length]
        const forca = len >= 20 ? '🟢 Muito forte' : len >= 12 ? '🟡 Forte' : '🟠 Média'
        return reply(F.tela({
            emoji: '🔐',
            titulo: 'Senha gerada',
            intro: '`' + pass + '`',
            secoes: [{
                emoji: '📋', titulo: 'Detalhes',
                linhas: [
                    F.campo('Tamanho', `${len} caracteres`),
                    F.campo('Força', forca),
                    F.campo('Tipos', 'minúsculas, maiúsculas, números e símbolos'),
                    ajustado ? F.campo('Aviso', 'ajustei o tamanho: aceito de 6 a 128') : null
                ]
            }],
            dica: 'Guarde num gerenciador de senhas. Esta mensagem fica no grupo: para uma senha real, gere em conversa privada.',
            proximos: [
                { nome: 'senhaforte', args: '24', oque: 'senha maior' },
                { nome: 'genpasspin', oque: 'PIN só de números' }
            ],
            prefix
        }))
    }
}
