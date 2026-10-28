/**
 * Comando .balorview — Usa o Olho de Balor para escanear poder mágico: .balorview
 */
module.exports = {
    name: "balorview",
    aliases: ["balorview-cmd","cmd-balorview"],
    category: "rpg",
    subcategory: "Status",
    description: "Usa o Olho de Balor para escanear poder mágico: .balorview",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const mag = Math.floor(Math.random() * 4000) + 1200;
            const forca = Math.floor(Math.random() * 5000) + 1500;
            const esp = Math.floor(Math.random() * 3000) + 800;
            const total = mag + forca + esp;
            return reply(`👁️ *OLHO MÁGICO DE BALOR — ESCANEAMENTO*\n\n▫️ *Magia:* ${mag}\n▫️ *Força:* ${forca}\n▫️ *Espírito:* ${esp}\n\n🔥 *NÍVEL DE PODER TOTAL:* *${total}*`);
        }
};
