module.exports = {
    name: 'search',
    aliases: ["stackoverflow","so","pesquisa","cmd_search","alt_search","atalho_search","abrev_search","call_search","func_search"],
    category: 'dev',
    description: 'Pesquisa dúvidas e soluções no Stack Overflow',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite algo para pesquisar. Exemplo: .search javascript array filter')
        await reply('🔎 https://stackoverflow.com/search?q=' + encodeURIComponent(text.trim()))
    }
}