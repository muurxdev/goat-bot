/**
 * Conversa natural — responder SEM comando, sem virar spam.
 *
 * Antes, no privado, qualquer mensagem com mais de 1 caractere ia direto para
 * a IA: o bot respondia conversa entre pessoas, desabafo, número solto, tudo.
 * Aqui a mensagem é CLASSIFICADA antes, e só três situações geram resposta:
 *
 *   1. `bot`      → pergunta sobre o próprio bot (como usar, quais comandos,
 *                   como ativar, quanto custa). Respondida na hora, com texto
 *                   fixo e correto — sem IA, porque IA inventaria comandos.
 *   2. `pergunta` → pergunta de verdade sobre outro assunto → vai para a IA.
 *   3. `ignorar`  → todo o resto. O bot fica calado, que é o padrão.
 *
 * O silêncio é a resposta padrão de propósito: num grupo, um bot que responde
 * o que não foi perguntado é pior do que um bot mudo.
 */

const logger = require('../core/logger')

/** Intenções sobre o próprio bot, da mais específica para a mais genérica. */
const INTENCOES_BOT = [
    {
        id: 'ativar',
        padroes: [
            /\bcomo\b.{0,20}\b(ativ|lig|habilit)\w*\b.{0,20}\bbot\b/i,
            /\bcomo\b.{0,15}\b(ativ|lig)\w*\b.{0,15}\b(comando|modulo|modulo)s?\b/i,
            /\b(ativar|ligar)\b.{0,15}\bbot\b/i
        ]
    },
    {
        id: 'comandos',
        padroes: [
            /\b(quais|quas|que|quantos)\b.{0,20}\bcomandos?\b/i,
            /\b(lista|menu)\b.{0,15}\bcomandos?\b/i,
            /\bcomandos?\b.{0,15}\b(disponiveis|disponiveis|existe|tem)\b/i,
            /\bo que\b.{0,15}\b(voce|voce|vc|tu)\b.{0,10}\b(faz|sabe fazer|pode fazer)\b/i
        ]
    },
    {
        id: 'como-usar',
        padroes: [
            /\bcomo\b.{0,20}\b(us[ao]|utiliz)\w*\b.{0,15}\b(voce|voce|vc|bot|tu)\b/i,
            /\bcomo\b.{0,10}\b(voce|voce|vc)\b.{0,10}\bfunciona\b/i,
            /\bcomo\b.{0,15}\bfunciona\b.{0,15}\bbot\b/i,
            /\bnao sei\b.{0,15}\b(usar|mexer)\b/i,
            /\bme ajuda\b.{0,20}\b(usar|com o bot)\b/i
        ]
    },
    {
        id: 'precos',
        padroes: [
            // 'e' NAO entra como alternativa: sem acento, "quanto e" casaria
            // com "quanto e 2 elevado a 10" e viraria resposta de preco.
            /\bquanto\b.{0,15}\b(custa|vale|fica|sai|cobra)\b/i,
            /\bquanto\b.{0,12}\b(e|eh)\b.{0,12}\b(bot|aluguel|assinatura|plano|mensalidade)\b/i,
            /\b(preco|preco|valor|plano)s?\b.{0,20}\b(bot|aluguel|assinatura)\b/i,
            /\b(aluguel|assinatura)\b.{0,15}\b(preco|preco|valor|quanto)\b/i
        ]
    },
    {
        id: 'quem-e',
        padroes: [
            /\bquem\b.{0,10}\b(e|e)\b.{0,10}\b(voce|voce|vc|tu)\b/i,
            /\b(voce|voce|vc)\b.{0,10}\b(e|e)\b.{0,10}\b(um )?(bot|rob[oo])\b/i
        ]
    }
]

/** Palavras que abrem pergunta — usadas so quando nao e sobre o bot. */
const INTERROGATIVAS = /\b(qual|quais|quando|onde|quem|porque|por que|pq|como|quanto|o que|oq)\b/i

/** Tamanho mínimo para sequer considerar. Evita "oi", "kk", "ok", emoji solto. */
const MIN_CARACTERES = 8

/** Conversa natural nasce ligada; cada grupo pode desligar. */
const PADRAO_LIGADO = true

/**
 * Classifica uma mensagem sem prefixo.
 * @param {string} texto
 * @param {{mencionouBot?: boolean, respondeuBot?: boolean, isGroup?: boolean}} ctx
 * @returns {{tipo:'bot'|'pergunta'|'ignorar', intent?:string}}
 */
function classify(texto, ctx = {}) {
    const limpo = String(texto || '').replace(/@\d+/g, '').trim()
    if (limpo.length < MIN_CARACTERES) return { tipo: 'ignorar' }

    // Normaliza ANTES de casar: `\b` do JavaScript é ASCII, então `\bvocê\b`
    // simplesmente não casa (o "ê" final não conta como caractere de palavra) e
    // todo padrão acentuado falhava em silêncio. Tirando o acento, os padrões
    // ficam sem acento também — e de brinde passam a entender quem digita
    // "voce" e "e", que é como a maioria escreve no WhatsApp.
    const alvo = limpo.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Pergunta sobre o bot vale em qualquer lugar: é exatamente o caso em que
    // alguém perdido merece resposta mesmo sem saber que existe prefixo.
    for (const intencao of INTENCOES_BOT) {
        if (intencao.padroes.some(p => p.test(alvo))) {
            return { tipo: 'bot', intent: intencao.id }
        }
    }

    // Fora isso, só responde se foi CHAMADO (menção/resposta) — em grupo o
    // silêncio é obrigatório, no privado o usuário já está falando com o bot.
    const foiChamado = ctx.mencionouBot || ctx.respondeuBot || !ctx.isGroup
    if (!foiChamado) return { tipo: 'ignorar' }

    // E mesmo chamado, precisa parecer pergunta — senão o bot comenta desabafo.
    const pareceParagunta = alvo.includes('?') || INTERROGATIVAS.test(alvo)
    if (!pareceParagunta) return { tipo: 'ignorar' }

    return { tipo: 'pergunta' }
}

/**
 * Resposta pronta para perguntas sobre o bot.
 * Texto fixo de propósito: a IA inventaria nomes de comando que não existem.
 * @param {string} intent
 * @param {{prefix?:string, botName?:string, isGroup?:boolean}} opts
 */
function responderSobreBot(intent, opts = {}) {
    const p = opts.prefix || '.'
    const nome = opts.botName || 'o bot'

    switch (intent) {
        case 'comandos':
            return `📜 Tenho bastante coisa por aqui!\n\n` +
                `• \`${p}menu\` — lista tudo, por categoria\n` +
                `• \`${p}help <comando>\` — explica um comando específico\n\n` +
                `_Se procura algo em particular, é só me dizer o que quer fazer._`

        case 'como-usar':
            return `😄 É simples: todo comando começa com \`${p}\`.\n\n` +
                `Por exemplo: \`${p}menu\` abre a lista, \`${p}perfil\` mostra seu personagem.\n\n` +
                `💡 _Comece pelo_ \`${p}menu\` _que de lá você navega pelo resto._`

        case 'ativar':
            return `⚙️ Quem liga e desliga os módulos é o dono do bot.\n\n` +
                `Se algum comando não responde neste ambiente, provavelmente o módulo dele está desligado aqui — fale com um administrador do grupo.\n\n` +
                `_Donos: usem_ \`${p}perfilbot\` _ou_ \`${p}modulo\`_._`

        case 'precos':
            return `💰 Os valores ficam em \`${p}aluguel planos\`.\n\n` +
                `Tem também \`${p}aluguel teste\` — 2 horas grátis para experimentar antes de decidir.`

        case 'quem-e':
            return `🏆 Sou *${nome}*, seu assistente oficial do Clube dos Campeões!\n\n` +
                `Comando ferramentas, RPG, downloads, figurinhas, notícias tech, livros e muito mais.\n\n` +
                `_Digite_ \`${p}menu\` _para ver tudo._`

        default:
            return `🏆 Sou *${nome}*! Digite \`${p}menu\` para ver o que eu faço.`
    }
}

/**
 * A conversa natural está ligada neste ambiente?
 *
 * Padrão LIGADO, mas a checagem é por ambiente: um grupo sério pode desligar
 * sem afetar os outros. Precedência: ajuste do grupo → global → padrão.
 *
 * @param {string} scopeJid JID do grupo (ignorado no PV)
 * @param {boolean} isGroup
 */
function isNaturalReplyEnabled(scopeJid = null, isGroup = true) {
    try {
        const dataService = require('./dataService')
        const configs = dataService.getConfigsData()
        if (isGroup && scopeJid && configs[scopeJid]?.conversaNatural !== undefined) {
            return Boolean(configs[scopeJid].conversaNatural)
        }
        if (configs.global?.conversaNatural !== undefined) {
            return Boolean(configs.global.conversaNatural)
        }
        return PADRAO_LIGADO
    } catch (err) {
        logger.warn(`[CONVERSA] Falha ao ler estado (${err.message}); assumindo padrão.`)
        return PADRAO_LIGADO
    }
}

/**
 * Liga/desliga a conversa natural.
 * @param {boolean} ligado
 * @param {string|null} scopeJid JID do grupo, ou null para global
 */
async function setNaturalReply(ligado, scopeJid = null) {
    const dataService = require('./dataService')
    const configs = dataService.getConfigsData()
    const valor = Boolean(ligado)

    if (scopeJid && String(scopeJid).endsWith('@g.us')) {
        if (!configs[scopeJid]) configs[scopeJid] = {}
        configs[scopeJid].conversaNatural = valor
    } else {
        if (!configs.global) configs.global = {}
        configs.global.conversaNatural = valor
    }

    await dataService.saveConfigsData(configs)
    logger.info(`[CONVERSA] Conversa natural ${valor ? 'LIGADA' : 'DESLIGADA'} em ${scopeJid || 'GLOBAL'}`)
    return valor
}

module.exports = {
    isNaturalReplyEnabled,
    setNaturalReply,
    PADRAO_LIGADO,
    classify,
    responderSobreBot,
    MIN_CARACTERES
}
