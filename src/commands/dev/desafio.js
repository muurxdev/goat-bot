const { desafios } = require('../../utils/constants')
const F = require('../../utils/formato')

module.exports = {
    name: 'desafio',
    aliases: ["pergunta","cmd_desafio","alt_desafio","atalho_desafio","abrev_desafio","call_desafio","func_desafio"],
    category: 'dev',
    subcategory: 'Dev',
    description: 'Sorteia uma pergunta rápida de programação para você responder',
    examples: [' — sorteia uma pergunta de programação'],
    execute: async ({ reply, prefix = '.' }) => {
        const desafio = desafios[Math.floor(Math.random() * desafios.length)]
        const [tema, ...resto] = String(desafio).split('\n')
        const pergunta = resto.join('\n').trim() || tema

        await reply(F.tela({
            emoji: '🎯',
            titulo: 'Desafio do dev',
            intro: `*${pergunta}*`,
            secoes: [{
                emoji: '📋', titulo: 'Sobre a pergunta',
                linhas: [
                    resto.length ? F.campo('Tema', tema.replace(/:$/, '')) : null,
                    F.campo('Banco', `${desafios.length} perguntas`)
                ]
            }],
            dica: 'Responda aqui no grupo e veja quem acerta primeiro. Não vale pesquisar!',
            proximos: [
                { nome: 'desafio', oque: 'sortear outra pergunta' },
                { nome: 'quizprogramacao', oque: 'quiz de programação' },
                { nome: 'fraseprogramador', oque: 'uma frase clássica de dev' }
            ],
            prefix
        }))
    }
}
