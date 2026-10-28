/**
 * Exemplo de "batch" para o gerador de comandos.
 * Rode:  node scripts/gen-commands.js scripts/command-batch.example.js
 *
 * Lembre: `execute` é serializada — dados/tabelas devem ficar INLINE no corpo
 * (sem closures externas). Comandos novos nascem OFF; libere com `.modulo on <mod>`.
 */
module.exports = [
    {
        name: 'exemplo',
        aliases: ['ex', 'demo'],
        category: 'general',        // vira o módulo via resolveModuleKey
        subcategory: 'Utilidades',
        description: 'Comando de exemplo (eco do que você digitar)',
        cooldownMs: 1500,
        execute: async ({ args, text, reply }) => {
            const t = (text || (args || []).join(' ')).trim()
            if (!t) return reply('📌 Uso: `.exemplo <texto>`')
            return reply('🔁 Você disse: ' + t)
        }
    }
]
