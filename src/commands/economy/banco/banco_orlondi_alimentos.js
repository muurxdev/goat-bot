module.exports = {
    name: 'banco_orlondi_alimentos',
    aliases: ["cmd_banco_orlondi_alimentos","atalho_banco_orlondi_alimentos","abrev_banco_orlondi_alimentos"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em orlondi para o setor de alimentos',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA ORLONDI* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para alimentos\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
