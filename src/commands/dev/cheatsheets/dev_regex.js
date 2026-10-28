module.exports = {
    name: 'dev_regex',
    aliases: ["cmd_dev_regex","atalho_dev_regex","abrev_dev_regex"],
    category: 'dev',
    subcategory: 'Cheatsheets',
    description: 'Guia de sintaxe e referência rápida de Expressões Regulares',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💻 *DEV CHEATSHEET: EXPRESSÕES REGULARES* ═══════╗\n\n'
        txt += '⚡ *Visão Geral:* Tecnologia amplamente utilizada no mercado de engenharia de software.\n\n'
        txt += '💡 *Boas Práticas:*\n'
        txt += '├ 1. Escreva código limpo, modular e autodescritivo.\n'
        txt += '├ 2. Escreva testes automatizados antes de enviar para produção.\n'
        txt += '└ 3. Utilize linters e formatadores no pipeline de CI/CD.'
        return reply(txt.trim())
    }
}
