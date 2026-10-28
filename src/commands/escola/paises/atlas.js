module.exports = {
    name: 'atlas_mundial',
    aliases: ["cmd_atlas_mundial","atalho_atlas_mundial","abrev_atlas_mundial"],
    category: 'escola',
    subcategory: 'Geografia',
    description: 'Atlas geográfico com fichas de capitais, moedas e dados de todas as nações',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        let txt = '╔════════ 🌍 *ATLAS GEOGRÁFICO UNIVERSAL* ════════╗\n\n'
        txt += 'Consulte fichas socioeconômicas e geográficas dos países do mundo.\n\n'
        txt += '💡 Exemplos de consulta rápida:\n'
        txt += '├ `.pais_brasil` - Brasil\n'
        txt += '├ `.pais_japao` - Japão\n'
        txt += '├ `.pais_alemanha` - Alemanha\n'
        txt += '├ `.pais_eua` - Estados Unidos\n'
        txt += '└ `.pais_portugal` - Portugal'
        return reply(txt.trim())
    }
}
