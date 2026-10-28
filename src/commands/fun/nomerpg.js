/**
 * Comando .nomerpg — Nome de RPG
 */
const F = require("../../utils/formato");
module.exports = {
    name: "nomerpg",
    aliases: ["gerarnomerpg", "nomeguerreiro", "nomepersonagem"],
    category: "fun",
    subcategory: "Diversão",
    description: "Gera um nome aleatório para personagem de RPG",
    examples: [" — sorteia um nome"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
    // Os arrays tinham sido trocados: o começo do nome recebia os atalhos do
    // comando e as terminações foram parar em aliases. As listas certas ficam aqui.
    const INICIOS = ["Thor","Kael","Dra","Mor","Zar","Vay","Gron","Lyr","Fen","Ald"];
    const FINAIS = ["gorn","wyn","dor","thas","iel","rok","mir","vok","lyn","ric"];
    const nome = (INICIOS[Math.floor(Math.random()*INICIOS.length)] + FINAIS[Math.floor(Math.random()*FINAIS.length)]).replace(/\s+/g, " ").trim();
    return reply(F.tela({
        emoji: "⚔️",
        titulo: "Nome de RPG",
        intro: "Que tal *" + nome + "*?",
        dica: "Serve para o seu herói nas aventuras do Reino.",
        proximos: [
            { nome: "nomerpg", oque: "gerar outro nome" },
            { nome: "nomeelfo", oque: "um nome élfico" }
        ],
        prefix
    }));
  }
};
