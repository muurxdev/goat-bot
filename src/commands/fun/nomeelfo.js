/**
 * Comando .nomeelfo — Nome élfico
 */
const F = require("../../utils/formato");
module.exports = {
    name: "nomeelfo",
    aliases: ["elfname", "nomeelfico", "gerarelfo"],
    category: "fun",
    subcategory: "Diversão",
    description: "Gera um nome élfico aleatório",
    examples: [" — sorteia um nome"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
    // Os arrays tinham sido trocados: o começo do nome recebia os atalhos do
    // comando e as terminações foram parar em aliases. As listas certas ficam aqui.
    const INICIOS = ["Ela","Gala","Legol","Thranduil","Ari","Cele","Fin","Elro","Aer","Nim"];
    const FINAIS = ["driel","wen","as","brimbor","wë","dir","loth","riel","dan","ith"];
    const nome = (INICIOS[Math.floor(Math.random()*INICIOS.length)] + FINAIS[Math.floor(Math.random()*FINAIS.length)]).replace(/\s+/g, " ").trim();
    return reply(F.tela({
        emoji: "🧝",
        titulo: "Nome élfico",
        intro: "Que tal *" + nome + "*?",
        dica: "Bom para personagem de RPG ou para o apelido no grupo.",
        proximos: [
            { nome: "nomeelfo", oque: "gerar outro nome" },
            { nome: "nomerpg", oque: "um nome de guerreiro" }
        ],
        prefix
    }));
  }
};
