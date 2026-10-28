/**
 * Comando .fatoaleatorio — um fato científico verdadeiro, sorteado.
 */
const F = require('../../utils/formato')

const FATOS = [
    { fato: "Bananas são levemente radioativas.", porque: "Elas têm potássio, e uma pequena parte do potássio natural é radioativa. Para fazer mal, seria preciso comer milhões de uma vez." },
    { fato: "A Torre Eiffel pode ficar até 15 cm mais alta no verão.", porque: "O ferro dilata com o calor, então a estrutura estica nos dias quentes e encolhe no frio." },
    { fato: "Flamingos comem de cabeça para baixo.", porque: "O bico funciona como um filtro virado: eles mergulham a cabeça invertida para peneirar a comida da água." },
    { fato: "O coração de uma baleia-azul é do tamanho de um carro pequeno.", porque: "Pesa perto de 180 kg e precisa bombear sangue para um corpo de mais de 25 metros." }
]

module.exports = {
    name: "fatoaleatorio",
    aliases: ["fatoaleatorio-cmd","cmd-fatoaleatorio"],
    category: "general",
    subcategory: "Curiosidades",
    description: "Conta um fato científico verdadeiro e surpreendente",
    examples: [" — sorteia um fato de ciência"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        const i = Math.floor(Math.random() * FATOS.length)
        const f = FATOS[i]
        return reply(F.tela({
            emoji: '💡',
            titulo: 'Você sabia?',
            intro: f.fato,
            secoes: [{ emoji: '🔬', titulo: 'Por quê', linhas: [f.porque] }],
            dica: `Fato ${i + 1} de ${FATOS.length}. Peça de novo para ver outro.`,
            proximos: [
                { nome: 'fatoaleatorio', oque: 'sortear outro fato' },
                { nome: 'curiosidadeastronomia', oque: 'uma curiosidade do espaço' }
            ],
            prefix
        }))
    }
};
