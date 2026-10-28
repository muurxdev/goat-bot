module.exports = {
    name: 'github',
    aliases: ["git","cmd_github","alt_github","atalho_github","abrev_github","call_github","func_github"],
    category: 'dev',
    description: 'Retorna o link do perfil do GitHub informado',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite o nome de usuário do GitHub. Exemplo: .github torvalds')
        await reply(`🌐 https://github.com/${encodeURIComponent(text.trim())}`)
    }
}

