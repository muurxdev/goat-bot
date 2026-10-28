/**
 * Comando .nomebanda — Nome de banda
 */
const F = require("../../utils/formato");
module.exports = {
    name: "nomebanda",
    aliases: ["bandname", "gerarbanda", "nomedebanda"],
    category: "fun",
    subcategory: "Diversão",
    description: "Gera um nome de banda aleatório",
    examples: [" — sorteia um nome"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
    // Os arrays tinham sido trocados: o começo do nome recebia os atalhos do
    // comando e as terminações foram parar em aliases. As listas certas ficam aqui.
    const INICIOS = ["Os ","The ","Banda ","Projeto ","Legião ","Império "];
    const FINAIS = ["Vermelhos","Sonâmbulos","Elétricos","do Caos","Perdidos","Imortais"];
    const nome = (INICIOS[Math.floor(Math.random()*INICIOS.length)] + FINAIS[Math.floor(Math.random()*FINAIS.length)]).replace(/\s+/g, " ").trim();
    return reply(F.tela({
        emoji: "🎸",
        titulo: "Nome de banda",
        intro: "Que tal *" + nome + "*?",
        dica: "Pronto para estampar na camiseta e no primeiro show.",
        proximos: [
            { nome: "nomebanda", oque: "gerar outro nome" },
            { nome: "nomeempresa", oque: "um nome de empresa" }
        ],
        prefix
    }));
  }
};
