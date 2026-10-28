/**
 * Comando .conselhous — Receba um conselho sábio (ou irônico) para a vida: .conselhous
 */
const F = require("../../utils/formato");
module.exports = {
    name: "conselhous",
    aliases: ["conselhous-cmd","cmd-conselhous"],
    category: "fun",
    subcategory: "Oráculo",
    description: "Receba um conselho sábio (ou irônico) da taverna",
    examples: [" — sorteia um conselho sábio ou irônico"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const c = [
                "Não tome decisões permanentes baseado em emoções temporárias.",
                "Se nada der certo, vá dormir. O Guardião cuida das sobras amanhã!",
                "Beba água e lembre-se de que até Herói precisa do sol para brilhar.",
                "Não guarde rancor, guarde dinheiro para cerveja de Bernia!"
            ];
            return reply(F.tela({
                emoji: "📜",
                titulo: "Conselho da taverna",
                intro: `Entre um copo e outro, o pessoal do balcão soltou esta:\n_"${c[Math.floor(Math.random() * c.length)]}"_`,
                dica: "Conselho de taverna se leva a sério só até a segunda caneca.",
                proximos: [
                    { nome: "conselhous", oque: "outro conselho da taverna" },
                    { nome: "conselho", oque: "um conselho mais prático" }
                ],
                prefix
            }));
        }
};
