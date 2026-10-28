const F = require('../../utils/formato')
const logger = require('../../core/logger')

const FRASES = [
    { texto: 'A vida é aquilo que acontece enquanto você está ocupado fazendo outros planos.', autor: 'John Lennon' },
    { texto: 'O futuro pertence àqueles que acreditam na beleza de seus sonhos.', autor: 'Eleanor Roosevelt' },
    { texto: 'Não é o mais forte que sobrevive, mas o que melhor se adapta.', autor: 'Charles Darwin' },
    { texto: 'Seja a mudança que você quer ver no mundo.', autor: 'Mahatma Gandhi' },
    { texto: 'A única maneira de fazer um excelente trabalho é amar o que você faz.', autor: 'Steve Jobs' },
    { texto: 'A persistência é o caminho do êxito.', autor: 'Charles Chaplin' },
    { texto: 'Tudo o que imagine pode se tornar realidade.', autor: 'Walt Disney' },
    { texto: 'A simplicidade é a sofisticação suprema.', autor: 'Leonardo da Vinci' },
    { texto: 'Não tenha medo de desistir do bom para perseguir o grande.', autor: 'John D. Rockefeller' },
    { texto: 'O conhecimento fala, mas a sabedoria ouve.', autor: 'Jimi Hendrix' },
    { texto: 'Viver é o mais raro do mundo. A maioria das pessoas apenas existe.', autor: 'Oscar Wilde' },
    { texto: 'Acredite que pode e já estará no meio do caminho.', autor: 'Theodore Roosevelt' },
    { texto: 'A melhor vingança é uma vida bem vivida.', autor: 'Marcus Aurelius' },
    { texto: 'Nós somos o que repetidamente fazemos. Excelência, portanto, não é um ato, mas um hábito.', autor: 'Aristóteles' },
    { texto: 'O único fracasso é não tentar.', autor: 'Confúcio' },
    { texto: 'Se você quer algo que nunca teve, precisa fazer algo que nunca fez.', autor: 'Thomas Jefferson' },
    { texto: 'O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.', autor: 'Winston Churchill' },
    { texto: 'A imaginação é mais importante que o conhecimento.', autor: 'Albert Einstein' },
    { texto: 'Não conte os dias, faça os dias contarem.', autor: 'Muhammad Ali' },
    { texto: 'O extraordinário está no comum, basta olhar com outros olhos.', autor: 'Clarice Lispector' },
    { texto: 'A jornada de mil quilômetros começa com um passo.', autor: 'Lao Tzu' },
    { texto: 'Quem não arrisca, não petisca.', autor: 'Provérbio Popular' }
]

module.exports = {
    name: 'frase',
    aliases: ['fraseinvert', 'frasemotivacional', 'motivacao'],
    category: 'fun',
    subcategory: 'Diversão',
    description: 'Receba uma frase motivacional ou filosófica aleatória',
    examples: [' — sorteia uma frase de alguém famoso'],
    cooldownMs: 3000,
    execute: async ({ reply, prefix = '.' }) => {
        const f = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: '💬',
            titulo: 'Frase do dia',
            intro: `_"${f.texto}"_\n— *${f.autor}*`,
            dica: `Tenho ${FRASES.length} frases guardadas: cada chamada sorteia uma.`,
            proximos: [
                { nome: 'frase', oque: 'outra frase' },
                { nome: 'reflexao', oque: 'uma reflexão curta' }
            ],
            prefix
        }))
    }
}
