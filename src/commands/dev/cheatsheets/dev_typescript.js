module.exports = {
    name: 'dev_typescript',
    aliases: ["cmd_dev_typescript","atalho_dev_typescript","abrev_dev_typescript"],
    category: 'dev',
    subcategory: 'Cheatsheets',
    description: 'Guia de sintaxe e referência rápida de TypeScript',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💻 *DEV CHEATSHEET: TYPESCRIPT* ═══════╗\n\n'
        txt += '⚡ *Visão Geral:* Tecnologia amplamente utilizada no mercado de engenharia de software.\n\n'
        txt += '💡 *Boas Práticas:*\n'
        txt += '├ 1. Escreva código limpo, modular e autodescritivo.\n'
        txt += '├ 2. Escreva testes automatizados antes de enviar para produção.\n'
        txt += '└ 3. Utilize linters e formatadores no pipeline de CI/CD.'
        return reply(txt.trim())
    }
}
