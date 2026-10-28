/**
 * Comando .armazenamento — Converte unidades de armazenamento (b, kb, mb, gb, tb) base 1024
 */
const F = require('../../utils/formato')

const U = { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 }
const fmt = (r) => Number.isInteger(r) ? r.toLocaleString('pt-BR') : r.toLocaleString('pt-BR', { maximumFractionDigits: 4 })

module.exports = {
    name: "armazenamento",
    aliases: ["bytesconv","dataunit","cmd_armazenamento","alt_armazenamento","atalho_armazenamento","abrev_armazenamento","call_armazenamento","func_armazenamento"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Converte tamanhos de arquivo entre b, kb, mb, gb e tb (base 1024)",
    usage: '<valor> <de> [para]',
    examples: ['1 gb — mostra 1 GB em todas as unidades', '512 mb gb — converte 512 MB para GB', '2,5 tb mb — aceita vírgula'],
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.' }) => {
        const uso = (titulo, intro) => F.tela({
            emoji: '💾',
            titulo,
            intro,
            secoes: [
                { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'armazenamento', '<valor> <de> [para]')] },
                { emoji: '📏', titulo: 'Unidades', linhas: [Object.keys(U).join(', ') + ' (1 kb = 1024 b)'] },
                { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                    F.cmd(prefix, 'armazenamento', '1 gb') + ' — 1 GB em todas as unidades',
                    F.cmd(prefix, 'armazenamento', '512 mb gb') + ' — 512 MB em GB',
                    F.cmd(prefix, 'armazenamento', '2,5 tb mb') + ' — aceita vírgula'
                ]) }
            ],
            proximos: [{ nome: 'unitconverter', oque: 'outro conversor de tamanhos' }],
            prefix
        })

        const v = parseFloat((args[0] || '').replace(',', '.'))
        if (isNaN(v)) return reply(uso('Conversor de armazenamento', 'Converte tamanhos de arquivo entre unidades, na base 1024.'))
        const de = (args[1] || '').toLowerCase()
        if (!(de in U)) return reply(uso('Unidade não reconhecida', `Não conheço a unidade *${de || '(vazia)'}*. Use uma destas: ${Object.keys(U).join(', ')}.`))
        const base = v * U[de]
        const ate = (args[2] || '').toLowerCase()

        if (ate in U) {
            const r = base / U[ate]
            return reply(F.tela({
                emoji: '💾',
                titulo: 'Conversão pronta',
                intro: `*${fmt(v)} ${de}* = *${fmt(r)} ${ate}*`,
                secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Em bytes', fmt(base) + ' b'), F.campo('Base', '1024')] }],
                dica: 'Fabricantes de disco usam base 1000, por isso um HD de 1 TB aparece com menos espaço no computador.',
                proximos: [{ nome: 'armazenamento', args: `${args[0]} ${de}`, oque: 'ver em todas as unidades' }],
                prefix
            }))
        }

        const linhas = Object.keys(U).filter(k => k !== de).map(k => F.campo(k, fmt(base / U[k])))
        return reply(F.tela({
            emoji: '💾',
            titulo: 'Conversão pronta',
            intro: `*${fmt(v)} ${de}* equivale a:`,
            secoes: [{ emoji: '📋', titulo: 'Em outras unidades', linhas }],
            dica: 'Quer só uma unidade? Coloque a de destino no fim.',
            proximos: [{ nome: 'armazenamento', args: `${args[0]} ${de} ${de === 'gb' ? 'mb' : 'gb'}`, oque: 'converter para uma unidade só' }],
            prefix
        }))
    }
};
