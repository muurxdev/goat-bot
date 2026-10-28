/**
 * Comando .mercadovestigios — Consulta o mercado negro de vestígios da Guerra Santa: .mercadovestigios
 */
module.exports = {
    name: "mercadovestigios",
    aliases: ["mercadovestigios-cmd","cmd-mercadovestigios","cmd_mercadovestigios","alt_mercadovestigios","atalho_mercadovestigios","abrev_mercadovestigios","call_mercadovestigios","func_mercadovestigios"],
    category: "economy",
    subcategory: "Mercado",
    description: "Consulta o mercado negro de vestígios da Guerra Santa: .mercadovestigios",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🏺 *MERCADO DE VESTÍGIOS DA GUERRA SANTA*\n\n▫️ Fragmento de Armadura de Arcanjo: 💰 5.000 ouros\n▫️ Cinzas de Demônio Cinzento: 💰 3.200 ouros\n▫️ Asas ressecadas de Fada: 💰 1.800 ouros\n▫️ Escama de Dragão Primordial: 💰 12.000 ouros`);
        }
};
