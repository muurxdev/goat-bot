module.exports = {
    name: 'stack',
    aliases: ["techstack","cmd_stack","alt_stack","atalho_stack","abrev_stack","call_stack","func_stack"],
    category: 'dev',
    description: 'Sugestão de stack moderna para desenvolvimento web',
    execute: async ({ reply }) => {
        const stackInfo = `💻 *STACK MODERNA RECOMENDADA:*

🎨 *Frontend:* React + Next.js + TailwindCSS
⚙️ *Backend:* Node.js / TypeScript + Express / Fastify
🗄 *Banco de Dados:* PostgreSQL / MongoDB + Prisma ORM
🚀 *Deploy:* Vercel + Render / Railway`
        await reply(stackInfo)
    }
}