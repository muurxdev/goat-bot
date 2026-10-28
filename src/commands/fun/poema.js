const logger = require('../../core/logger')

const POEMAS = [
    {
        titulo: 'O Rio da Vida',
        estrofes: [
            'O rio corre sem parar',
            'levando sonhos e ilusões',
            'cada pedra é uma lição',
            'cada onda, um despertar'
        ]
    },
    {
        titulo: 'Noite Estrelada',
        estrofes: [
            'No céu as estrelas brilham',
            'como olhos de um universo',
            'que nos observa com bursts',
            'de luz que o tempo não dan'
        ]
    },
    {
        titulo: 'Amor Eterno',
        estrofes: [
            'Te amo como o mar ama a areia',
            'como o sol ama o amanhecer',
            'como a alma ama a esperança',
            'e como eu amo te ver'
        ]
    },
    {
        titulo: 'Manhã de Sol',
        estrofes: [
            'O sol nasce devagar',
            'pinta o céu de laranja',
            'os pássaros começam a cantar',
            'e a vida começa a troca'
        ]
    },
    {
        titulo: 'Saudade',
        estrofes: [
            'Saudade é um passado',
            'que mora no presente',
            'é uma dor que encanta',
            'um amor que não tem onde'
        ]
    },
    {
        titulo: 'Montanha',
        estrofes: [
            'No topo da montanha',
            'o mundo é tão pequeno',
            'os problemas se resolvem',
            'quando olhamos pelo alto'
        ]
    },
    {
        titulo: 'Mar e Solidão',
        estrofes: [
            'O mar é um poema infinito',
            'cada onda é um verso',
            'cada事业部 é um capítulo',
            'de uma história sem fim'
        ]
    },
    {
        titulo: 'Esperança',
        estrofes: [
            'Mesmo na escuridão',
            'uma luz pode brilhar',
            'uma esperança pode nascer',
            'e o mundo pode mudar'
        ]
    },
    {
        titulo: 'Floresta Encantada',
        estrofes: [
            'Na floresta os sonhos vivem',
            'árvores contam histórias',
            'o vento traz memórias',
            'de quem passou e partiu'
        ]
    },
    {
        titulo: 'Liberdade',
        estrofes: [
            'Liberdade é um pássaro',
            'que não conhece grades',
            'é um sonho que não teme',
            'os limites da idade'
        ]
    },
    {
        titulo: 'Nuvens',
        estrofes: [
            'Nuvens brancas no céu azul',
            'formam castelos de algodão',
            'onde moram nossos sonhos',
            'de paz e de imaginação'
        ]
    },
    {
        titulo: 'Tempo',
        estrofes: [
            'O tempo não espera',
            'quem está esperando',
            'ele segue seu caminho',
            'enquanto nós sonhamos'
        ]
    }
]

module.exports = {
    name: 'poema',
    aliases: ['poesia', 'verso', 'poemadodia'],
    category: 'fun',
    subcategory: 'Poesia',
    description: 'Receba um poema curto aleatório',
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        const p = POEMAS[Math.floor(Math.random() * POEMAS.length)]
        return reply(
            `📜 *POEMA: ${p.titulo.toUpperCase()}*\n\n` +
            p.estrofes.map(e => `_${e}_`).join('\n\n')
        )
    }
}
