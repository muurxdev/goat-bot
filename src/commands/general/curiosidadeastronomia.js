/**
 * Comando .curiosidadeastronomia — um fato curioso sobre o universo.
 */
const F = require('../../utils/formato')

const FATOS = [
    { fato: "Um dia em Vênus é mais longo do que um ano inteiro em Vênus.", porque: "Vênus gira muito devagar: leva 243 dias terrestres para dar uma volta em si mesmo e 225 para dar a volta no Sol." },
    { fato: "Existem mais árvores na Terra do que estrelas na Via Láctea.", porque: "São cerca de 3 trilhões de árvores contra 100 a 400 bilhões de estrelas na nossa galáxia." },
    { fato: "O Sol concentra cerca de 99,86% de toda a massa do Sistema Solar.", porque: "Júpiter fica com quase todo o resto; a Terra é um grão perto disso." },
    { fato: "Dois pedaços do mesmo metal se grudam para sempre se se tocarem no espaço.", porque: "É a soldagem a frio: sem ar, não existe a camada que separa os metais aqui na Terra." }
]

module.exports = {
    name: "curiosidadeastronomia",
    aliases: ["curiosidadeastronomia-cmd","cmd-curiosidadeastronomia"],
    category: "general",
    subcategory: "Curiosidades",
    description: "Conta um fato surpreendente sobre o universo e os astros",
    examples: [" — sorteia uma curiosidade do espaço"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        const i = Math.floor(Math.random() * FATOS.length)
        const f = FATOS[i]
        return reply(F.tela({
            emoji: '🌌',
            titulo: 'Curiosidade do cosmos',
            intro: f.fato,
            secoes: [{ emoji: '🔭', titulo: 'Por quê', linhas: [f.porque] }],
            dica: `Curiosidade ${i + 1} de ${FATOS.length}. Peça de novo para ver outra.`,
            proximos: [
                { nome: 'curiosidadeastronomia', oque: 'sortear outra curiosidade do espaço' },
                { nome: 'fatoaleatorio', oque: 'um fato de ciência sobre a Terra' }
            ],
            prefix
        }))
    }
};
