const F = require('../../utils/formato')

module.exports = {
    name: 'numeroaleatorio',
    aliases: ['aleatorio', 'random', 'sortearnumero', 'rng'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Sorteia um número inteiro num intervalo que você escolhe',
    usage: '[mínimo] [máximo]',
    examples: [' — de 1 a 100', '6 — de 1 a 6, como um dado', '10 50 — de 10 a 50'],
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        let min = parseInt(args[0], 10)
        let max = parseInt(args[1], 10)
        const padrao = isNaN(min) && isNaN(max)
        if (padrao) { min = 1; max = 100 }
        else if (isNaN(max)) { max = min; min = 1 }
        if (isNaN(min) || isNaN(max)) {
            return reply(`🎲 *Não entendi o intervalo*\n\nUse só números inteiros.\n\n📌 *Exemplo:* ${F.cmd(prefix, 'numeroaleatorio', '1 6')}`)
        }
        if (min > max) [min, max] = [max, min]
        const n = Math.floor(Math.random() * (max - min + 1)) + min
        return reply(F.tela({
            emoji: '🎲',
            titulo: `Deu ${n.toLocaleString('pt-BR')}!`,
            intro: `Sorteei um número inteiro entre *${min.toLocaleString('pt-BR')}* e *${max.toLocaleString('pt-BR')}*.`,
            secoes: [{ emoji: '📋', titulo: 'Sorteio', linhas: [
                F.campo('Resultado', `*${n.toLocaleString('pt-BR')}*`),
                F.campo('Chance', `1 em ${(max - min + 1).toLocaleString('pt-BR')}`)
            ] }],
            dica: padrao ? `Escolha o intervalo: ${F.cmd(prefix, 'numeroaleatorio', '1 6')} vira um dado.` : 'Cada sorteio é independente: pode repetir o número.',
            proximos: [
                { nome: 'escolher', args: 'pizza | sushi', oque: 'sortear entre opções de texto' },
                { nome: 'sorteiogrupo', args: '50', oque: 'sorteio com anúncio para o grupo' }
            ],
            prefix
        }))
    }
}
