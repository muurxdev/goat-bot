module.exports = {
    name: 'npm',
    aliases: ["package","cmd_npm","alt_npm","atalho_npm","abrev_npm","call_npm","func_npm"],
    category: 'dev',
    description: 'Retorna o link do pacote NPM informado',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite o nome do pacote NPM. Exemplo: .npm express')
        await reply(`📦 https://www.npmjs.com/package/${encodeURIComponent(text.trim())}`)
    }
}

