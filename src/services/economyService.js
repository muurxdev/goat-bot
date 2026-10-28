/**
 * Núcleo da economia: saldo, apostas e transferências.
 *
 * O PROBLEMA QUE ISSO RESOLVE
 * ---------------------------
 * Dezenas de comandos de cassino foram escritos como texto puro: sorteavam um
 * resultado, escreviam "você ganhou 3.000.000 moedas" e NÃO tocavam no banco.
 * O usuário apostava 1,5 milhão sem ter um centavo, "ganhava" e o saldo ficava
 * igual. Pior que não funcionar: mente para quem está jogando.
 *
 * A causa é sempre a mesma — cada comando reimplementava (ou esquecia) a
 * validação de saldo e a persistência. Aqui isso vira UM lugar só, e um comando
 * de aposta passa a ser: sortear + chamar `resolverAposta`.
 *
 * `coins` é gravada com estratégia 'direct' no userRepository, então
 * `saveUser` normal já persiste aumento E redução — não precisa de
 * `{ force: true }` (esse é para level/xp/mochila).
 */

const dataService = require('./dataService')
const logger = require('../core/logger')
const F = require('../utils/formato')

// Piso e teto padrão de uma aposta. O teto evita que um número absurdo
// (ou um overflow) vire saldo negativo impossível de auditar.
const APOSTA_MINIMA = Number(process.env.ECONOMY_APOSTA_MINIMA || 10)
const APOSTA_MAXIMA = Number(process.env.ECONOMY_APOSTA_MAXIMA || 10_000_000)

/** Formata para o padrão brasileiro: 1500000 -> "1.500.000". */
function formatar(n) {
    return Number(n || 0).toLocaleString('pt-BR')
}

/** Carrega o usuário já com os defaults do domínio aplicados. */
function carregarUsuario(sender) {
    // initializeUser(sender) consulta o banco pontualmente — ao contrário de
    // getXpData(), que carrega a tabela inteira só para ler uma linha.
    return dataService.initializeUser(sender)
}

function saldo(user) {
    return Number(user?.coins || 0)
}

/**
 * Interpreta o valor digitado pelo usuário.
 *
 * Aceita "500", "1k", "2.5m", "tudo", "metade", "50%". O código antigo fazia
 * `parseInt(args[1]) || 50`, que transformava um erro de digitação numa aposta
 * silenciosa de 50 moedas — o usuário nem percebia.
 *
 * @returns {number|null} null quando não dá para interpretar
 */
function parseValor(texto, saldoAtual = 0) {
    if (texto === null || texto === undefined) return null
    const t = String(texto).trim().toLowerCase().replace(/\s/g, '')
    if (!t) return null

    if (['tudo', 'all', 'allin', 'max', 'máximo', 'maximo'].includes(t)) {
        return Math.floor(saldoAtual)
    }
    if (['metade', 'half'].includes(t)) return Math.floor(saldoAtual / 2)

    const pct = t.match(/^(\d+(?:[.,]\d+)?)%$/)
    if (pct) {
        const p = Number(pct[1].replace(',', '.'))
        if (!Number.isFinite(p) || p <= 0 || p > 100) return null
        return Math.floor(saldoAtual * (p / 100))
    }

    // "1k" = mil, "2.5m" = 2,5 milhões, "1b" = bilhão.
    const suf = t.match(/^(\d+(?:[.,]\d+)?)(k|mil|m|kk|b)$/)
    if (suf) {
        const base = Number(suf[1].replace(',', '.'))
        const mult = { k: 1e3, mil: 1e3, m: 1e6, kk: 1e6, b: 1e9 }[suf[2]]
        if (!Number.isFinite(base)) return null
        return Math.floor(base * mult)
    }

    // Número puro, tolerando separadores: "1.500.000" e "1500000".
    const limpo = t.replace(/[.\s]/g, '').replace(',', '.')
    const n = Number(limpo)
    if (!Number.isFinite(n)) return null
    return Math.floor(n)
}

/**
 * Valida uma aposta contra o saldo e os limites.
 * @returns {{ok:boolean, erro?:string, valor?:number}}
 */
function validarAposta({ user, texto, min = APOSTA_MINIMA, max = APOSTA_MAXIMA }) {
    const atual = saldo(user)
    const valor = parseValor(texto, atual)
    const carteira = F.campo('Sua carteira', `${formatar(atual)} moedas`)

    // As telas não sabem o nome do comando que chamou; por isso os exemplos
    // mostram só o formato do valor, que vale para todos os jogos.
    if (valor === null) {
        return { ok: false, erro: F.tela({
            emoji: '🔢',
            titulo: 'Não entendi o valor',
            intro: `"${String(texto ?? '').slice(0, 30)}" não é um valor que eu consiga usar. Escreva um número ou uma das formas abaixo.`,
            secoes: [{ emoji: '✍️', titulo: 'Formas aceitas', linhas: [
                '• `500` — quinhentas moedas',
                '• `1k` ou `2m` — mil ou dois milhões',
                '• `50%` ou `metade` — parte da carteira',
                '• `tudo` — a carteira inteira'
            ] }, carteira]
        }) }
    }
    if (valor <= 0) {
        return { ok: false, erro: F.tela({
            emoji: '🔢',
            titulo: 'Valor precisa ser maior que zero',
            intro: `Escolha um valor a partir de ${formatar(min)} ${Number(min) === 1 ? 'moeda' : 'moedas'}.`,
            secoes: [carteira]
        }) }
    }
    if (valor < min) {
        return { ok: false, erro: F.tela({
            emoji: '🔢',
            titulo: 'Valor abaixo do mínimo',
            intro: `O mínimo aqui é *${formatar(min)} ${Number(min) === 1 ? 'moeda' : 'moedas'}*, e você pediu ${formatar(valor)}.`,
            secoes: [carteira]
        }) }
    }
    if (valor > max) {
        return { ok: false, erro: F.tela({
            emoji: '🔢',
            titulo: 'Valor acima do máximo',
            intro: `O máximo aqui é *${formatar(max)} moedas*, e você pediu ${formatar(valor)}.`,
            secoes: [carteira]
        }) }
    }
    if (atual <= 0) {
        return { ok: false, erro: F.tela({
            emoji: '🪙',
            titulo: 'Carteira vazia',
            intro: 'Você está sem moedas na carteira agora.',
            dica: 'Se tiver moedas guardadas, saque do banco antes de jogar.',
            proximos: [
                { nome: 'trabalhar', oque: 'ganhar moedas sem risco' },
                { nome: 'premiodiario', oque: 'pegar o prêmio do dia' }
            ]
        }) }
    }
    if (valor > atual) {
        return { ok: false, erro: F.tela({
            emoji: '🪙',
            titulo: 'Moedas insuficientes',
            intro: `Você pediu *${formatar(valor)}*, mas tem *${formatar(atual)}* na carteira.`,
            secoes: [{ emoji: '💳', titulo: 'Sua carteira', linhas: [
                F.campo('Tem', `${formatar(atual)} moedas`),
                F.campo('Faltam', `${formatar(valor - atual)} moedas`)
            ] }],
            dica: 'Use `tudo` ou `metade` no lugar do número para caber no que você tem.'
        }) }
    }
    return { ok: true, valor }
}

/**
 * Aplica uma variação de saldo e persiste.
 * O saldo nunca fica negativo: um débito maior que o saldo zera a conta em vez
 * de criar dívida invisível.
 *
 * @returns {{antes:number, delta:number, depois:number}}
 */
function aplicar(user, delta) {
    const antes = saldo(user)
    const depois = Math.max(0, Math.floor(antes + delta))
    user.coins = depois
    try {
        dataService.saveUser(user)
    } catch (e) {
        // Persistência é o ponto inteiro deste serviço: se falhar, o comando
        // precisa saber em vez de anunciar um ganho que não existe.
        logger.error(`[ECONOMY] Falha ao salvar saldo de ${user?.jid}: ${e.message}`)
        throw e
    }
    return { antes, delta: depois - antes, depois }
}

function creditar(user, valor) {
    return aplicar(user, Math.abs(Math.floor(valor)))
}

function debitar(user, valor) {
    return aplicar(user, -Math.abs(Math.floor(valor)))
}

/**
 * Resolve uma aposta inteira: valida, aplica e devolve tudo pronto para exibir.
 *
 * `multiplicador` é sobre a APOSTA, não sobre o lucro: 2 devolve o dobro do que
 * foi apostado (lucro = 1x). Perder debita a aposta.
 *
 * @param {object} o
 * @param {string} o.sender
 * @param {string} o.texto      valor digitado ("1500000", "tudo", "50%")
 * @param {boolean} o.ganhou
 * @param {number} [o.multiplicador=2]
 * @returns {{ok:boolean, erro?:string, user?:object, valor?:number, delta?:number, saldo?:number}}
 */
function resolverAposta({ sender, texto, ganhou, multiplicador = 2, min, max }) {
    const user = carregarUsuario(sender)
    const v = validarAposta({ user, texto, min, max })
    if (!v.ok) return { ok: false, erro: v.erro, user }

    const aposta = v.valor
    // Ganhar credita o LUCRO (a aposta nunca chegou a sair da conta).
    const delta = ganhou
        ? Math.floor(aposta * (multiplicador - 1))
        : -aposta

    const r = aplicar(user, delta)
    return { ok: true, user, valor: aposta, delta: r.delta, saldo: r.depois, ganhou }
}

/**
 * Transfere moedas entre dois usuários.
 * Debita e credita em sequência; se o crédito falhar, devolve ao remetente para
 * não sumir com o dinheiro no meio do caminho.
 */
function transferir({ deJid, paraJid, texto, min = 1 }) {
    if (deJid === paraJid) {
        return { ok: false, erro: '❌ *Você não pode transferir para si mesmo.*' }
    }
    const de = carregarUsuario(deJid)
    const v = validarAposta({ user: de, texto, min, max: APOSTA_MAXIMA })
    if (!v.ok) return { ok: false, erro: v.erro }

    const para = carregarUsuario(paraJid)
    const rDe = aplicar(de, -v.valor)
    try {
        const rPara = aplicar(para, v.valor)
        return { ok: true, valor: v.valor, saldoRemetente: rDe.depois, saldoDestinatario: rPara.depois }
    } catch (e) {
        // Estorna: sem isso o valor sai de um lado e não entra no outro.
        logger.error(`[ECONOMY] Crédito falhou; estornando ${v.valor} para ${deJid}`)
        aplicar(de, v.valor)
        return { ok: false, erro: '❌ *Falha na transferência.* Nada foi debitado.' }
    }
}

/** "1h 23min" / "45min" / "30s" — quanto falta para liberar de novo. */
function formatarEspera(ms) {
    const s = Math.ceil(ms / 1000)
    if (s < 60) return `${s}s`
    const m = Math.ceil(s / 60)
    if (m < 60) return `${m}min`
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}min`
}

/**
 * Atividade de coleta: minerar, pescar, abrir baú — ganho com espera.
 *
 * O cooldown fica gravado no próprio usuário (`ultima_<chave>`), então
 * reiniciar o bot não devolve a coleta de graça, como aconteceria com um
 * `Map` em memória.
 *
 * @param {object} o
 * @param {string} o.chave      identificador da atividade (ex.: 'minerardiamante')
 * @param {number} o.cooldownMs
 * @param {number} o.min        ganho mínimo
 * @param {number} o.max        ganho máximo
 * @param {number} [o.chanceVazio=0] probabilidade (0-1) de não achar nada
 * @returns {{ok:boolean, espera?:string, vazio?:boolean, ganho?:number, saldo?:number, user:object}}
 */
function coletar({ sender, chave, cooldownMs, min, max, chanceVazio = 0 }) {
    const user = carregarUsuario(sender)
    const campo = `ultima_${chave}`
    const ultima = Number(user[campo] || 0)
    const decorrido = Date.now() - ultima

    if (ultima && decorrido < cooldownMs) {
        return { ok: false, espera: formatarEspera(cooldownMs - decorrido), user }
    }

    // Marca o uso ANTES de sortear: mesmo voltando de mãos vazias, a espera
    // conta. Sem isso o usuário repetiria até dar sorte, e o cooldown viraria
    // enfeite.
    user[campo] = Date.now()

    if (chanceVazio > 0 && Math.random() < chanceVazio) {
        const r = aplicar(user, 0)
        return { ok: true, vazio: true, ganho: 0, saldo: r.depois, user }
    }

    const ganho = Math.floor(min + Math.random() * (max - min + 1))
    const r = aplicar(user, ganho)
    return { ok: true, vazio: false, ganho, saldo: r.depois, user }
}

/**
 * Título dos jogos sem enfeite: os comandos passam "   🦉 *AS TRES CORUJAS* 🦉   ".
 * Tira os asteriscos, o emoji repetido no fim e a caixa alta.
 */
function limparTitulo(bruto) {
    let t = String(bruto || '').replace(/\*/g, '').trim()
    const emoji = (t.match(/^\p{Extended_Pictographic}[\uFE0F\u200D\p{Extended_Pictographic}]*/u) || [''])[0]
    if (emoji) {
        t = t.slice(emoji.length).trim()
        if (t.endsWith(emoji)) t = t.slice(0, -emoji.length).trim()
    }
    if (t && t === t.toUpperCase()) {
        const baixo = t.toLocaleLowerCase('pt-BR')
        t = baixo.charAt(0).toLocaleUpperCase('pt-BR') + baixo.slice(1)
    }
    return { emoji: emoji || '🎲', texto: t || 'Resultado' }
}

/** Cartão de resultado padrão, para os comandos de cassino ficarem iguais. */
function cartaoResultado({ titulo, linhas = [], valor, delta, saldo: saldoFinal, ganhou }) {
    const { emoji, texto } = limparTitulo(titulo)
    const d = Number(delta) || 0
    const intro = ganhou
        ? `🎉 Você ganhou *${formatar(d)} moedas*!`
        : d < 0
            ? `💀 Não foi desta vez: você perdeu *${formatar(Math.abs(d))} moedas*.`
            : '🤝 Empate: sua aposta voltou inteira.'
    return F.tela({
        emoji,
        titulo: texto,
        intro,
        secoes: [
            { emoji: '🎯', titulo: 'Rodada', linhas },
            { emoji: '💳', titulo: 'Sua conta', linhas: [
                F.campo('Aposta', `${formatar(valor)} moedas`),
                F.campo('Resultado', `${d >= 0 ? '+' : '−'}${formatar(Math.abs(d))} moedas`),
                F.campo('Saldo atual', `${formatar(saldoFinal)} moedas`)
            ] }
        ]
    })
}

// Validade da chuva de moedas pendente (mesma regra do messageHandler).
const DROP_VALIDADE_MS = 60 * 60 * 1000

/**
 * Chuva de moedas pendente de um grupo, se ainda valer.
 * Uma doação nova não pode sobrescrever a pendente: as moedas de quem doou
 * antes sumiriam. Se a pendente já expirou e ninguém falou no grupo desde
 * então, devolve as moedas a quem doou e libera o espaço.
 * @param {string} from - JID do grupo
 * @returns {Promise<{amount:number, sponsor:string, createdAt:number, expiraEmMs:number}|null>}
 */
async function dropPendenteAtivo(from) {
    const configs = dataService.getConfigsData()
    const drop = configs[from] && configs[from].pendingDrop
    if (!drop || !(Number(drop.amount) > 0)) return null

    const idade = Date.now() - (drop.createdAt || 0)
    if (idade < DROP_VALIDADE_MS) return { ...drop, expiraEmMs: DROP_VALIDADE_MS - idade }

    const doador = dataService.getUser(drop.sponsor)
    if (doador) {
        doador.coins = (doador.coins || 0) + Number(drop.amount)
        dataService.saveUser(doador)
    } else {
        logger.warn(`[ECONOMY] Chuva expirada em ${from}: doador ${drop.sponsor} não encontrado, ${drop.amount} moedas não devolvidas`)
    }
    configs[from].pendingDrop = null
    await dataService.saveConfigsData(configs)
    return null
}

module.exports = {
    dropPendenteAtivo,
    DROP_VALIDADE_MS,
    carregarUsuario,
    coletar,
    formatarEspera,
    saldo,
    parseValor,
    formatar,
    validarAposta,
    aplicar,
    creditar,
    debitar,
    resolverAposta,
    transferir,
    cartaoResultado,
    APOSTA_MINIMA,
    APOSTA_MAXIMA
}
