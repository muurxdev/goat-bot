/**
 * Comando .urlparse — Decompõe componentes de uma URL: .urlparse <url>
 */
module.exports = {
    name: "urlparse",
    aliases: ["urlparse-cmd","cmd-urlparse","cmd_urlparse","alt_urlparse","atalho_urlparse","abrev_urlparse","call_urlparse","func_urlparse"],
    category: "dev",
    subcategory: "Dev",
    description: "Decompõe componentes de uma URL: .urlparse <url>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const u = args[0];
            if (!u) return reply("Uso: `.urlparse <url>`");
            try {
                const parsed = new URL(u);
                return reply(`🌐 *URL Analisada:*\n▫️ Protocolo: ${parsed.protocol}\n▫️ Host: ${parsed.hostname}\n▫️ Porta: ${parsed.port || "padrão"}\n▫️ Caminho: ${parsed.pathname}\n▫️ Parâmetros: ${parsed.search || "nenhum"}\n▫️ Hash: ${parsed.hash || "nenhum"}`);
            } catch (e) {
                return reply("❌ URL inválida ou malformada.");
            }
        }
};
