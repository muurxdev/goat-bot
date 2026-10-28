/**
 * Comando .nivelira — Mede o nível de fúria interior do Dragão.
 */
const F = require("../../utils/formato");
const { marcar } = require("../../utils/textoRpg");

/** Faixas do termômetro, da mais calma para a mais furiosa. */
function faixa(f) {
    if (f > 80) return { nome: "Modo Assalto à vista", frase: "Cuidado! O dragão está prestes a despertar o Modo Assalto." };
    if (f > 60) return { nome: "Fervendo", frase: "As chamas negras já começam a escapar pelos punhos." };
    if (f > 30) return { nome: "Irritado", frase: "Um cliente derrubou a cerveja, mas nada que uma conversa não resolva." };
    return { nome: "Sereno", frase: "Tranquilo como uma tarde ensolarada no Javali." };
}

module.exports = {
    name: "nivelira",
    aliases: ["nivelira-cmd", "cmd-nivelira"],
    category: "profile",
    subcategory: "Status",
    description: "Mede o nível de fúria interior do Dragão",
    examples: [" — mede sua fúria de hoje, de 1% a 100%"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = "." }) => {
        const f = Math.floor(Math.random() * 100) + 1;
        const fx = faixa(f);
        return reply(F.tela({
            emoji: "🐉",
            titulo: "Termômetro da ira",
            intro: `${marcar(sender)}, sua fúria interior está em *${f}%*. ${fx.frase}`,
            secoes: [{ emoji: "🔥", titulo: "Leitura", linhas: [
                F.campo("Fúria", F.barra(f / 100)),
                F.campo("Estado", fx.nome)
            ] }],
            dica: "Acima de 80% é Modo Assalto. É só por diversão: a leitura muda a cada consulta.",
            proximos: [
                { nome: "nivelpaz", oque: "ver o outro lado, sua paz interior" },
                { nome: "nivelpecado", oque: "descobrir seu pecado do dia" }
            ],
            prefix
        }), [sender]);
    }
};
