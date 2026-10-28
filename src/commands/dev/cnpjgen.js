/**
 * Comando .cnpjgen — Gera um CNPJ válido (apenas para testes de sistema)
 */
const F = require('../../utils/formato')

module.exports = {
    name: "cnpjgen",
    aliases: ["geradorcnpj","gerarcnpj","cmd_cnpjgen","alt_cnpjgen","atalho_cnpjgen","abrev_cnpjgen","call_cnpjgen","func_cnpjgen"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Gera um CNPJ com dígitos válidos, só para testar sistemas",
    examples: [' — gera um CNPJ fictício formatado e só com números'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
        const rnd = () => Math.floor(Math.random() * 9)
        const n = Array.from({ length: 12 }, rnd)
        const calc = (arr) => { const p = arr.length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2]; let s = 0; for (let i = 0; i < arr.length; i++) s += arr[i] * p[i]; const r = s % 11; return r < 2 ? 0 : 11 - r }
        n.push(calc(n)); n.push(calc(n))
        const s = n.join('')
        const fmt = s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        return reply(F.tela({
            emoji: '🏢',
            titulo: 'CNPJ de teste gerado',
            intro: '`' + fmt + '`',
            secoes: [{
                emoji: '📋', titulo: 'Detalhes',
                linhas: [
                    F.campo('Só números', '`' + s + '`'),
                    F.campo('Matriz/filial', s.slice(8, 12)),
                    F.campo('Dígitos verificadores', s.slice(12))
                ]
            }],
            dica: 'Os dígitos batem com a regra oficial, mas a empresa não existe. Use só para testar formulários e sistemas.',
            proximos: [
                { nome: 'validadorcnpj', args: s, oque: 'conferir os dígitos' },
                { nome: 'cpfgen', oque: 'gerar um CPF de teste' },
                { nome: 'cnpjgen', oque: 'gerar outro CNPJ' }
            ],
            prefix
        }))
    }
};
