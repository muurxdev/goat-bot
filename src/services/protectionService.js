/**
 * Proteção anti-roubo temporária.
 *
 * O escudo é um instante de expiração gravado no usuário (`protecaoRouboAte`),
 * não um booleano com um timer. Isso importa: um `setTimeout` para desligar
 * depois de 24h morre junto com o processo, e reiniciar o bot devolveria a
 * proteção de graça — ou tiraria a de quem pagou.
 *
 * Comparar `Date.now()` com o instante gravado é imune a reinício, mudança de
 * fuso e migração de servidor.
 */

const dataService = require('./dataService')
const logger = require('../core/logger')

const PRECO = Number(process.env.PROTECAO_ROUBO_PRECO || 1000)
const DURACAO_MS = Number(process.env.PROTECAO_ROUBO_HORAS || 24) * 60 * 60 * 1000
const CAMPO = 'protecaoRouboAte'

/** A proteção está ativa agora? */
function estaProtegido(user) {
    return Number(user?.[CAMPO] || 0) > Date.now()
}

/** Milissegundos restantes de escudo (0 se não houver). */
function restanteMs(user) {
    return Math.max(0, Number(user?.[CAMPO] || 0) - Date.now())
}

/** "23h 45min" / "12min" — quanto ainda protege. */
function formatarRestante(ms) {
    if (ms <= 0) return 'expirada'
    const min = Math.ceil(ms / 60000)
    if (min < 60) return `${min}min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m ? `${h}h ${m}min` : `${h}h`
}

/**
 * Compra (ou renova) a proteção.
 *
 * Renovar SOMA ao tempo restante em vez de substituir: quem compra de novo
 * faltando 3h não deve perder essas 3h.
 *
 * @returns {{ok:boolean, erro?:string, expiraEm?:number, restante?:string, saldo?:number}}
 */
function comprar(sender, { preco = PRECO, duracaoMs = DURACAO_MS } = {}) {
    const economy = require('./economyService')
    const user = economy.carregarUsuario(sender)
    const saldo = economy.saldo(user)

    if (saldo < preco) {
        return {
            ok: false,
            erro: `❌ *Saldo insuficiente.*\n\n🛡️ A proteção custa 💰 *${economy.formatar(preco)}*\n` +
                  `💰 Você tem: ${economy.formatar(saldo)}`
        }
    }

    const base = Math.max(Date.now(), Number(user[CAMPO] || 0))
    user[CAMPO] = base + duracaoMs

    // aplicar() persiste o saldo E o campo do escudo na mesma gravação.
    const r = economy.aplicar(user, -preco)

    logger.info(`[PROTECAO] ${sender} comprou escudo anti-roubo por ${preco} — expira em ${new Date(user[CAMPO]).toISOString()}`)
    return {
        ok: true,
        expiraEm: user[CAMPO],
        restante: formatarRestante(restanteMs(user)),
        saldo: r.depois
    }
}

/** Consome o escudo (usado quando um roubo é bloqueado, se `gastarNoUso`). */
function remover(user) {
    user[CAMPO] = 0
    try {
        dataService.saveUser(user)
    } catch (e) {
        logger.error(`[PROTECAO] Falha ao remover escudo de ${user?.jid}: ${e.message}`)
    }
}

module.exports = {
    estaProtegido,
    restanteMs,
    formatarRestante,
    comprar,
    remover,
    PRECO,
    DURACAO_MS,
    CAMPO
}
