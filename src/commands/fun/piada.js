const F = require('../../utils/formato')
const logger = require('../../core/logger')

const PIADAS = [
    { pergunta: 'Por que o livro de matemática estava triste?', resposta: 'Porque tinha muitos problemas!' },
    { pergunta: 'O que o zero disse para o oito?', resposta: 'Legal cinto!' },
    { pergunta: 'Por que a calculadora se sentiu sozinha?', resposta: 'Porque seus amigos eram todos contas!' },
    { pergunta: 'O que aconteceu quando o lápis perdeu a ponta?', resposta: 'Ele ficou sem rumo!' },
    { pergunta: 'Qual é o animal mais antigo do mundo?', resposta: 'A zebra —因为 é preto e branco!' },
    { pergunta: 'Por que o café foi ao bar?', resposta: 'Porque ele queria ser espresso!' },
    { pergunta: 'O que o sayonara disse para o adeus?', resposta: 'Nada, era japonês!' },
    { pergunta: 'Por que a banana foi ao médico?', resposta: 'Porque ela estava descascando!' },
    { pergunta: 'Qual a comida preferida do relógio?', resposta: 'Segundos!' },
    { pergunta: 'Por que o mascate não comprava espelhos?', resposta: 'Porque ele já era muito convencido!' },
    { pergunta: 'O que um invoice disse para o outro?', resposta: 'Você não é meu tipo!' },
    { pergunta: 'Por que o⫽ antigo não usava celular?', resposta: 'Porque ele era muito antigo e não sabia lidar!' },
    { pergunta: 'Qual a fruta mais inteligente?', resposta: 'A maçã — porque caiu na cabeça de Newton!' },
    { pergunta: 'O que o canivete disse para a faca?', resposta: 'Você não é minha lamina!' },
    { pergunta: 'Por que a chuva foi presa?', resposta: 'Porque ela caiu em cima de alguém!' },
    { pergunta: 'Qual a estação mais legal?', resposta: 'A estação espacial!' },
    { pergunta: 'O que o frio pediu para o calor?', resposta: 'Um abraço!' },
    { pergunta: 'Por que o professor usou óculos?', resposta: 'Porque ele tinha muitos pupilos!' }
]

module.exports = {
    name: 'piada',
    aliases: ['piadadodia', 'joke'],
    category: 'fun',
    subcategory: 'Diversão',
    description: 'Receba uma piada aleatória para rir um pouco',
    examples: [' — sorteia uma piada de pergunta e resposta'],
    cooldownMs: 3000,
    execute: async ({ reply, prefix = '.' }) => {
        const p = PIADAS[Math.floor(Math.random() * PIADAS.length)]
        return reply(F.tela({
            emoji: '😂',
            titulo: 'Piada',
            intro: `❓ *${p.pergunta}*\n\n💭 _${p.resposta}_`,
            dica: 'Conta para o grupo antes de mostrar a resposta.',
            proximos: [
                { nome: 'piada', oque: 'outra piada' },
                { nome: 'piadaseca', oque: 'uma piada seca' },
                { nome: 'cantada', oque: 'uma cantada' }
            ],
            prefix
        }))
    }
}
