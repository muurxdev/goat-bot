module.exports = {
    name: 'deploy',
    aliases: ["hospedar","cmd_deploy","alt_deploy","atalho_deploy","abrev_deploy","call_deploy","func_deploy"],
    category: 'dev',
    description: 'Plataformas recomendadas para deploy de aplicações',
    execute: async ({ reply }) => {
        const deployInfo = `🚀 *PLATAFORMAS DE DEPLOY RECOMENDADAS:*

⚡ *Vercel* → Frontend & Next.js
🌐 *Netlify* → Sites estáticos e SPAs
🟢 *Render* → APIs Node.js & Docker
🐳 *Railway* → Aplicações completas & Bancos de dados
☁️ *Heroku* → Hospedagem gerenciada`
        await reply(deployInfo)
    }
}