/**
 * Comando .leilaosaga — Verifica o lote ativo no leilão do submundo: .leilaosaga
 */
module.exports = {
    name: "leilaosaga",
    aliases: ["leilaosaga-cmd","cmd-leilaosaga","cmd_leilaosaga","alt_leilaosaga","atalho_leilaosaga","abrev_leilaosaga","call_leilaosaga","func_leilaosaga"],
    category: "economy",
    subcategory: "Mercado",
    description: "Verifica o lote ativo no leilão do submundo: .leilaosaga",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🏷️ *LEILÃO SECRETO DO SUBMUNDO*\n\n▫️ *Lote Atual:* Frasco de Sangue de Wyvern Ancestral\n▫️ *Lance Atual:* 💰 4.200 Moedas de Ouro\n▫️ *Tempo Restante:* 15 minutos\n▫️ Use \`.darlaunce <valor>\` para cobrir a oferta!`);
        }
};
