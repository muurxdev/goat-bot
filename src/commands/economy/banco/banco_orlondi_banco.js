module.exports = {
    name: 'banco_orlondi_banco',
    aliases: ["cmd_banco_orlondi_banco","atalho_banco_orlondi_banco","abrev_banco_orlondi_banco"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em orlondi para o setor de banco',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA ORLONDI* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para banco\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
