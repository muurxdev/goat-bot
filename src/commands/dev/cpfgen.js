/**
 * Comando .cpfgen — Gera um CPF válido (apenas para testes de sistema)
 */
const F = require('../../utils/formato')

module.exports = {
    name: "cpfgen",
    aliases: ["geradorcpf","gerarcpf","cmd_cpfgen","alt_cpfgen","atalho_cpfgen","abrev_cpfgen","call_cpfgen","func_cpfgen"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Gera um CPF com dígitos válidos, só para testar sistemas",
    examples: [' — gera um CPF fictício formatado e só com números'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
        const rnd = () => Math.floor(Math.random() * 9)
        const n = Array.from({ length: 9 }, rnd)
        const dv = (arr) => { let s = 0; for (let i = 0; i < arr.length; i++) s += arr[i] * (arr.length + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r }
        n.push(dv(n)); n.push(dv(n))
        const s = n.join('')
        const fmt = s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        return reply(F.tela({
            emoji: '🪪',
            titulo: 'CPF de teste gerado',
            intro: '`' + fmt + '`',
            secoes: [{
                emoji: '📋', titulo: 'Detalhes',
                linhas: [
                    F.campo('Só números', '`' + s + '`'),
                    F.campo('Dígitos verificadores', s.slice(9))
                ]
            }],
            dica: 'Os dígitos batem com a regra oficial, mas o CPF não pertence a ninguém de propósito. Use só em testes.',
            proximos: [
                { nome: 'maskcpf', args: s, oque: 'mascarar o CPF' },
                { nome: 'cnpjgen', oque: 'gerar um CNPJ de teste' },
                { nome: 'cpfgen', oque: 'gerar outro CPF' }
            ],
            prefix
        }))
    }
};
