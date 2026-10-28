/**
 * Comando .mandamentorepouso — Testa o Mandamento do Repouso (Gloxinia): .mandamentorepouso
 */
module.exports = {
    name: "mandamentorepouso",
    aliases: ["mandamentorepouso-cmd","cmd-mandamentorepouso"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento do Repouso (Gloxinia): .mandamentorepouso",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`💤 *MANDAMENTO DO REPOUSO (Gloxinia)*\n\n▫️ Aquele que lutar quando o momento é de descanso ou quebrar a trégua de sono terá sua magia sugada e cairá em letargia permanente.`);
        }
};
