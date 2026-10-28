const economyService = require('../../../services/economyService')

module.exports = {
    name: 'slot_frutas',
    aliases: ["cmd_slot_frutas","atalho_slot_frutas","abrev_slot_frutas"],
    category: 'economy',
    subcategory: 'Caça-Níqueis',
    description: 'Caça-níquel temático Caça-Níqueis Frutas Mágicas: .slot_frutas <aposta>',
    cooldownMs: 2500,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.slot_frutas <aposta>`\nExemplo: `.slot_frutas 50`')
        const user = economyService.carregarUsuario(sender)
        const valid = economyService.validarAposta({ user, texto: args[0] })
        if (!valid.ok) return reply(valid.erro)

        const syms = ["🍒","🍋","🍇","🍉","⭐"]
        const r1 = syms[Math.floor(Math.random() * syms.length)]
        const r2 = syms[Math.floor(Math.random() * syms.length)]
        const r3 = syms[Math.floor(Math.random() * syms.length)]

        let multiplier = 0
        if (r1 === r2 && r2 === r3) {
            multiplier = 10 // Triplo (Jackpot)
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            multiplier = 2 // Dupla
        }

        const won = multiplier > 0
        const delta = won ? (valid.valor * (multiplier - 1)) : -valid.valor
        const res = await economyService.resolverAposta({ user, valor: valid.valor, delta })

        let txt = '╔═══════ 🎰 *CAÇA-NÍQUEIS FRUTAS MÁGICAS* ═══════╗\n\n'
        txt += `       [ ${r1} | ${r2} | ${r3} ]\n\n`
        if (multiplier === 10) {
            txt += `🎉 *JACKPOT SUPREMO (3 IGUAIS)!* Pagamento 10x: +${(valid.valor * 10).toLocaleString('pt-BR')} moedas!\n`
        } else if (multiplier === 2) {
            txt += `✨ *PAR DUPLO!* Pagamento 2x: +${(valid.valor * 2).toLocaleString('pt-BR')} moedas!\n`
        } else {
            txt += `💀 Não combinou! Você perdeu ${valid.valor.toLocaleString('pt-BR')} moedas.\n`
        }
        txt += `🏦 *Saldo Atual:* ${res.saldo.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
