/**
 * Comando .trabalhar / .work
 * Trabalha honestamente para ganhar Coins e XP com cooldown
 */

const dataService = require("../../services/dataService")
const { initializeUser, adicionarXp } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

const TRABALHOS = [
    { cargo: "Desenvolvedor Full Stack", desc: "Criou uma API escalável e corrigiu memory leaks." },
    { cargo: "Camisa 10 / Artilheiro", desc: "Marcou um hat-trick e levou o time à vitória na grande final." },
    { cargo: "Preparador Físico de Elite", desc: "Coordenou o condicionamento dos atletas no Centro de Treinamento." },
    { cargo: "Engenheiro de DevOps", desc: "Manteve o cluster Kubernetes 100% online sem quedas." },
    { cargo: "Goleiro Paredão", desc: "Fez defesas milagrosas e garantiu o placar zerado nos acréscimos." },
    { cargo: "Hacker Ético", desc: "Descobriu e reportou uma vulnerabilidade crítica de dia zero." },
    { cargo: "Minerador de Cripto", desc: "Configurou uma rig de mineração super-eficiente." },
    { cargo: "Analista Tático de Futebol", desc: "Decifrou o esquema adversário e definiu a estratégia campeã." }
]

module.exports = {
    name: "trabalhar",
    aliases: ["work","trampo","trampar","job","cmd_trabalhar","alt_trabalhar","atalho_trabalhar","abrev_trabalhar","call_trabalhar","func_trabalhar"],
    category: "economy",
    subcategory: "Renda",
    description: "Trabalhe honestamente para ganhar moedas e XP. Um turno a cada 45 min",
    examples: [" — faz um turno de trabalho e recebe moedas e XP"],
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const now = Date.now()
        const lastWork = user.lastWork || 0
        const COOLDOWN_WORK = 45 * 60 * 1000 // 45 minutos

        if (now - lastWork < COOLDOWN_WORK) {
            const rem = COOLDOWN_WORK - (now - lastWork)
            const m = Math.floor(rem / 60000)
            const s = Math.floor((rem % 60000) / 1000)
            return reply("😴 *Você está cansado!* Descanse um pouco antes de trabalhar novamente.\n\n🕒 Volte em *" + m + "m " + s + "s*.")
        }

        const job = TRABALHOS[Math.floor(Math.random() * TRABALHOS.length)]
        const level = user.level || 1

        const coinsEarned = Math.floor(Math.random() * 250) + 200 + (level * 10)
        const xpBase = Math.floor(Math.random() * 40) + 40 + (level * 5)

        user.lastWork = now
        user.coins = (user.coins || 0) + coinsEarned
        const { xpGanho: xpEarned, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" })
        user.trabalhosRealizados = (user.trabalhosRealizados || 0) + 1

        await dataService.saveXpData(xpData)
        logger.info("[WORK] " + sender + " trabalhou como " + job.cargo + " (+" + coinsEarned + " coins)")

        let doc = "╔══════════════════════════════╗\n"
        doc += "║    💼 *JORNADA DE TRABALHO* 💼   ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += "👷 *Profissão:* *" + job.cargo + "*\n"
        doc += "📝 *Atividade:* _" + job.desc + "_\n\n"
        doc += "╭━〔 💰 SALÁRIO RECEBIDO 〕━⬣\n"
        doc += "┃ 💵 *Ganhos:* +" + coinsEarned.toLocaleString("pt-BR") + " Coins\n"
        doc += "┃ ⭐ *XP Ganho:* +" + xpEarned.toLocaleString("pt-BR") + " XP\n"
        doc += "┃ 💰 *Saldo Atual:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins\n"
        if (lvlRes.subiu) doc += "┃ 🆙 *Subiu de nível!* Agora nível " + user.level + "\n"
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
        doc += "👑 *" + botName + "*"

        return reply(doc.trim(), [sender])
    }
}
