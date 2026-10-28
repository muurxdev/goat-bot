module.exports = {
    name: 'backend',
    aliases: ["back","cmd_backend","alt_backend","atalho_backend","abrev_backend","call_backend","func_backend"],
    category: 'dev',
    description: 'Roadmap e conceitos de desenvolvimento Backend',
    execute: async ({ reply }) => {
        const back = `🟢 *ROADMAP BACKEND:*

Node.js / TypeScript → Express ou NestJS
→ Bancos de Dados (SQL & NoSQL)
→ Autenticação (JWT, OAuth2)
→ Docker & Microsserviços
→ Deploy & CI/CD

🌐 *Guia Completo:* https://roadmap.sh/backend`
        await reply(back)
    }
}