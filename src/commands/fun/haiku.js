const F = require('../../utils/formato')
const logger = require('../../core/logger')

const HAIKUS = [
    {
        verso1: 'Folhas no outono',
        verso2: 'dançam suavemente ao vento',
        verso3: 'o silêncio fala'
    },
    {
        verso1: 'Ondas do mar azul',
        verso2: 'tocam os pés na areia',
        verso3: 'tempo parou aqui'
    },
    {
        verso1: 'Lua cheia brilha',
        verso2: 'estrelas pintam o céu',
        verso3: 'noite de paz e amor'
    },
    {
        verso1: 'Pássaro cantou',
        verso2: 'a manhã acordou cedo',
        verso3: 'vida renasceu'
    },
    {
        verso1: 'Flores no jardim',
        verso2: 'colorem o mundo inteiro',
        verso3: 'beleza sem fim'
    },
    {
        verso1: 'Chuva caiu forte',
        verso2: 'a terra bebeu feliz',
        verso3: 'novo amanhecer'
    },
    {
        verso1: 'Montanhas cobertas',
        verso2: 'de neve e de solidão',
        verso3: 'silêncio profundo'
    },
    {
        verso1: 'Crianças riam',
        verso2: 'o parque virou mágico',
        verso3: 'sonhos de papel'
    },
    {
        verso1: 'Fogo na lareira',
        verso2: 'abraços quentes de noite',
        verso3: 'lar é onde estou'
    },
    {
        verso1: 'Rio correndo',
        verso2: 'leva meus pensamentos',
        verso3: 'longe do mundo'
    },
    {
        verso1: 'Estrela cadente',
        verso2: 'um pedido foi atendido',
        verso3: 'universo ouviu'
    },
    {
        verso1: 'O vento sussurra',
        verso2: 'segredos entre as árvores',
        verso3: 'natureza fala'
    }
]

module.exports = {
    name: 'haiku',
    aliases: ['haikupoetico', 'poesiabs'],
    category: 'fun',
    subcategory: 'Poesia',
    description: 'Gere um haiku aleatório com 5-7-5 sílabas',
    examples: [' — sorteia um haiku'],
    cooldownMs: 5000,
    execute: async ({ reply, prefix = '.' }) => {
        const h = HAIKUS[Math.floor(Math.random() * HAIKUS.length)]
        return reply(F.tela({
            emoji: '🎋',
            titulo: 'Haiku',
            intro: `_${h.verso1}_\n_${h.verso2}_\n_${h.verso3}_`,
            secoes: [{ emoji: '📜', titulo: 'O que é', linhas: [
                'Poema japonês de três versos, com 5, 7 e 5 sílabas.'
            ] }],
            dica: 'Tente escrever o seu no chat seguindo o 5 – 7 – 5.',
            proximos: [
                { nome: 'haiku', oque: 'outro haiku' },
                { nome: 'reflexao', oque: 'uma reflexão do dia' }
            ],
            prefix
        }))
    }
}
