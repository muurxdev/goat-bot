/**
 * Comando .nomeempresa — Nome de empresa/startup
 */
const F = require("../../utils/formato");
module.exports = {
    name: "nomeempresa",
    aliases: ["startupname", "nomestartup", "gerarempresa"],
    category: "fun",
    subcategory: "Diversão",
    description: "Gera um nome de empresa ou startup aleatório",
    examples: [" — sorteia um nome"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
    // Os arrays tinham sido trocados: o começo do nome recebia os atalhos do
    // comando e as terminações foram parar em aliases. As listas certas ficam aqui.
    const INICIOS = ["Tech","Data","Cloud","Net","Byte","Nova","Smart","Info","Digi","Meta"];
    const FINAIS = ["ify","Lab","Hub","ly","Soft","Sys","Wave","Corp","Flow"];
    const nome = (INICIOS[Math.floor(Math.random()*INICIOS.length)] + FINAIS[Math.floor(Math.random()*FINAIS.length)]).replace(/\s+/g, " ").trim();
    return reply(F.tela({
        emoji: "🏢",
        titulo: "Nome de empresa",
        intro: "Que tal *" + nome + "*?",
        dica: "Confira se o nome já não existe antes de registrar.",
        proximos: [
            { nome: "nomeempresa", oque: "gerar outro nome" },
            { nome: "nomebanda", oque: "um nome de banda" }
        ],
        prefix
    }));
  }
};
