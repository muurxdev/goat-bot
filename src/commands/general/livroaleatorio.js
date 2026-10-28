/**
 * Comando .livroaleatorio
 * Sorteia um livro/apostila com foco em DESENVOLVIMENTO (o grupo é de devs) e
 * delega ao comando .livro para buscar e baixar o arquivo real.
 */

const logger = require('../../core/logger')
const F = require('../../utils/formato')

// Temas/títulos de programação e computação (domínio público ou amplamente
// disponíveis em acervos legais). O .livro busca em archive.org/OpenLibrary.
// Temas em PORTUGUÊS por padrão — o grupo é BR, então o sorteio busca obras em
// pt-BR. (A opção de outro idioma, como --en, ainda não existe: o texto todo vira filtro.)
const DEV_TOPICS = [
    'lógica de programação', 'algoritmos e estruturas de dados', 'introdução à programação',
    'programação orientada a objetos', 'engenharia de software', 'banco de dados',
    'redes de computadores', 'sistemas operacionais', 'desenvolvimento web',
    'programação python', 'programação java', 'javascript programação',
    'linguagem C programação', 'git controle de versão', 'linux administração',
    'inteligência artificial', 'aprendizado de máquina', 'segurança da informação',
    'arquitetura de software', 'padrões de projeto software', 'código limpo',
    'análise de sistemas', 'computação teoria', 'matemática discreta',
    'estrutura de dados em C', 'programação para iniciantes', 'testes de software',
    'metodologias ágeis scrum', 'cloud computing', 'ciência de dados'
]

module.exports = {
    name: 'livroaleatorio',
    aliases: ['randombook', 'livrorandom', 'sorteiolivro', 'apostilaaleatoria'],
    category: 'livros',
    subcategory: 'Livros & Materiais',
    description: 'Sorteia e baixa um livro/apostila de programação (foco dev)',
    usage: '[tema]',
    examples: [
        ' — sorteia qualquer tema de programação',
        'python — sorteia só entre temas de Python',
        'dados — sorteia entre banco de dados, estruturas e ciência de dados'
    ],
    cooldownMs: 5000,
    execute: async (ctx) => {
        const { reply, args, prefix = '.' } = ctx
        // Permite focar num sub-tema: .livroaleatorio python
        const filtro = (args && args.join(' ').toLowerCase().trim()) || ''
        let pool = DEV_TOPICS
        let filtroIgnorado = false
        if (filtro) {
            const f = pool.filter(t => t.includes(filtro))
            if (f.length) pool = f
            else filtroIgnorado = true
        }
        const escolhido = pool[Math.floor(Math.random() * pool.length)]

        let intro = `Tirei *${escolhido}* e já estou procurando um livro sobre isso para você.`
        if (filtroIgnorado) intro = `Não tenho tema com *${filtro}* na minha lista, então sorteei entre todos: saiu *${escolhido}*. Já estou procurando.`
        else if (filtro) intro = `Entre ${pool.length === 1 ? 'o tema' : `os ${pool.length} temas`} com *${filtro}*, tirei *${escolhido}*. Já estou procurando.`

        await reply(F.tela({
            emoji: '🎲',
            titulo: 'Livro sorteado',
            intro,
            dica: 'O resultado chega na próxima mensagem. Pode levar alguns segundos.',
            prefix
        }))
        logger.info(`[LIVRO ALEATORIO] Sorteado: ${escolhido}`)

        try {
            // Delega ao comando .livro com o título sorteado
            const livro = require('./livro')
            return await livro.execute({ ...ctx, text: escolhido, args: escolhido.split(' '), commandName: 'livro' })
        } catch (e) {
            logger.error('[LIVRO ALEATORIO ERROR]', e)
            return reply(F.tela({
                emoji: '❌',
                titulo: 'Não consegui buscar o livro',
                intro: `O sorteio saiu (*${escolhido}*), mas a busca pelo livro falhou agora.`,
                dica: 'Tentar de novo em instantes costuma resolver.',
                proximos: [
                    { nome: 'livro', args: escolhido, oque: 'buscar esse mesmo tema' },
                    { nome: 'livroaleatorio', oque: 'sortear outro tema' }
                ],
                prefix
            }))
        }
    }
}
