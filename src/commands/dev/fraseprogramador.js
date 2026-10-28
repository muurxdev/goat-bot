/**
 * Comando .fraseprogramador — Uma frase clássica do mundo dev
 */
const F = require('../../utils/formato')

const Q = [
    ['Funciona na minha máquina.', 'Todo dev, um dia'],
    ['Só mais um bug e eu durmo.', 'Ninguém nunca'],
    ['Não é bug, é uma feature não documentada.', 'Sabedoria popular'],
    ['Semana que vem eu refatoro.', 'Dívida técnica eterna'],
    ['Quem escreveu isso? (git blame) ...fui eu.', 'Autoconhecimento']
]

module.exports = {
    name: "fraseprogramador",
    aliases: ["devquote","frasedev","cmd_fraseprogramador","alt_fraseprogramador","atalho_fraseprogramador","abrev_fraseprogramador","call_fraseprogramador","func_fraseprogramador"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Sorteia uma frase clássica do mundo da programação",
    examples: [' — sorteia uma frase'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
        const i = Math.floor(Math.random() * Q.length)
        const [frase, autor] = Q[i]
        return reply(F.tela({
            emoji: '👨‍💻',
            titulo: 'Frase de programador',
            intro: `_"${frase}"_\n— ${autor}`,
            secoes: [{ emoji: '📋', titulo: 'Coleção', linhas: [F.campo('Frase', `${i + 1} de ${Q.length}`)] }],
            dica: 'Mande de novo para sortear outra e marque aquele colega que vive dizendo isso.',
            proximos: [
                { nome: 'fraseprogramador', oque: 'outra frase' },
                { nome: 'desafio', oque: 'uma pergunta de programação' }
            ],
            prefix
        }))
    }
};
