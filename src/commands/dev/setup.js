module.exports = {
    name: 'setup',
    aliases: ["cmd_setup","atalho_setup","abrev_setup"],
    category: 'dev',
    description: 'Setup e ferramentas recomendadas para desenvolvedores',
    execute: async ({ reply }) => {
        const setup = `💻 *SETUP RECOMENDADO PARA DEVS:*

🖥 *Editor:* VS Code
🌐 *Navegador:* Chrome DevTools
📦 *Ambiente:* Node.js LTS + Git
⚡ *Terminal:* Zsh / Linux / Termux

🔌 *Extensões essenciais do VS Code:*
• Prettier (Formatador de código)
• Error Lens (Exibe erros inline no editor)
• ES7 Snippets (Snippets rápidos de React/JS)
• GitLens (Controle e histórico do Git)`
        await reply(setup)
    }
}