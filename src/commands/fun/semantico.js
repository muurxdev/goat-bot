const logger = require('../../core/logger')
const dataService = require('../../services/dataService')

const PERGUNTAS = [
    { palavra: 'ALEGRE', opcoes: ['A) TRISTE', 'B) FELIZ', 'C) CANSADO', 'D) BRAVO'], resposta: 'B' },
    { palavra: 'ESCURO', opcoes: ['A) CLARO', 'B) BONITO', 'C) NEGRO', 'D) FORTE'], resposta: 'C' },
    { palavra: 'RÁPIDO', opcoes: ['A) LENTO', 'B) VELOZ', 'C) GRANDE', 'D) ALTO'], resposta: 'B' },
    { palavra: 'FRIO', opcoes: ['A) QUENTE', 'B) GELADO', 'C) MORNO', 'D) AMENO'], resposta: 'B' },
    { palavra: 'GRANDE', opcoes: ['A) PEQUENO', 'B) ALTO', 'C) ENORME', 'D) LARGO'], resposta: 'C' },
    { palavra: 'INTELIGENTE', opcoes: ['A) BURRO', 'B) SÁBIO', 'C) BONITO', 'D) FORTE'], resposta: 'B' },
    { palavra: 'BONITO', opcoes: ['A) FEO', 'B) ALTO', 'C) BEL0', 'D) MAGRO'], resposta: 'C' },
    { palavra: 'CANSADO', opcoes: ['A) DESCANSADO', 'B) MAGRO', 'C) FRACO', 'D) EXAUSTO'], resposta: 'D' },
    { palavra: 'CORAJOSO', opcoes: ['A) COVARDE', 'B) FORTE', 'C) BRAVO', 'D) AUDAZ'], resposta: 'D' },
    { palavra: 'ANTIGO', opcoes: ['A) NOVO', 'B) MODERNO', 'C) VELHO', 'D) JOVEM'], resposta: 'C' },
    { palavra: 'FÁCIL', opcoes: ['A) DIFÍCIL', 'B) SIMPLES', 'C) COMPLICADO', 'D) DURO'], resposta: 'B' },
    { palavra: 'SILENCIOSO', opcoes: ['A) BARULHENTO', 'B) CALADO', 'C) MUDO', 'D) BAIXO'], resposta: 'B' },
    { palavra: 'FORTUNA', opcoes: ['A) POBREZA', 'B) RIQUEZA', 'C) DESGRAÇA', 'D) AZAR'], resposta: 'B' },
    { palavra: 'ABELHA', opcoes: ['A) FORMIGA', 'B) VESPA', 'C) JOANINHA', 'D) MARIPESA'], resposta: 'B' },
    { palavra: 'LIVRO', opcoes: ['A) REVISTA', 'B) JORNAL', 'C) QUADRO', 'D) CADERNO'], resposta: 'A' },
    { palavra: 'CHUVA', opcoes: ['A) SOL', 'B) NEVE', 'C) TROVOADA', 'D) ORVALHO'], resposta: 'C' },
    { palavra: 'SENTIMENTO', opcoes: ['A) RAZÃO', 'B) EMOÇÃO', 'C) AÇÃO', 'D) IDEIA'], resposta: 'B' },
    { palavra: 'REI', opcoes: ['A) PRÍNCIPE', 'B) CAVALEIRO', 'C) MONARCA', 'D) SERVO'], resposta: 'C' },
    { palavra: 'TEMPO', opcoes: ['A) ESPAÇO', 'B) RELÓGIO', 'C) CALMA', 'D) PRESSA'], resposta: 'A' },
    { palavra: 'COMIDA', opcoes: ['A) BEBIDA', 'B) REFEIÇÃO', 'C) DOCE', 'D) FRUTA'], resposta: 'B' }
]

module.exports = {
    name: 'semantico',
    aliases: ['sinonimo', 'palavrassociais'],
    category: 'fun',
    subcategory: 'Quiz',
    description: 'Encontre o sinônimo da palavra entre 4 opções',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args, user }) => {
        const p = PERGUNTAS[Math.floor(Math.random() * PERGUNTAS.length)]
        const resp = (args[0] || '').toUpperCase().trim()

        if (!resp) {
            return reply(
                `🧠 *JOGO SEMÂNTICO*\n\n` +
                `📝 *Qual é o sinônimo de:* \`${p.palavra}\`?\n\n` +
                `${p.opcoes.join('\n')}\n\n` +
                `👉 Envie \`.semantico <letra>\` (A, B, C ou D)`
            )
        }

        if (!['A', 'B', 'C', 'D'].includes(resp)) {
            return reply('❌ Responda com A, B, C ou D!')
        }

        if (resp === p.resposta) {
            user.coins = (user.coins || 0) + 100
            dataService.saveUser(user, { force: true })
            return reply(
                `✅ *CORRETO!* 🎉\n\n` +
                `📝 A palavra \`${p.palavra}\` é sinônimo de **${p.opcoes[p.resposta.charCodeAt(0) - 65]}**.\n` +
                `💰 *+100 Coins!*`
            )
        }

        return reply(
            `❌ *INCORRETO!*\n\n` +
            `📝 A resposta certa era: **${p.opcoes[p.resposta.charCodeAt(0) - 65]}**`
        )
    }
}
