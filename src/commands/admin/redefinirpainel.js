/**
 * Comando .redefinirpainel
 *
 * Antes respondia "contadores limpos" sem limpar nada. Agora diz a verdade e
 * aponta os comandos que de fato zeram advertências e o livro de ocorrências.
 */
const F = require("../../utils/formato");

module.exports = {
    name: "redefinirpainel",
    aliases: ["redefinirpainel-cmd","cmd-redefinirpainel","cmd_redefinirpainel","alt_redefinirpainel","atalho_redefinirpainel","abrev_redefinirpainel","call_redefinirpainel","func_redefinirpainel"],
    category: "admin",
    subcategory: "Painel",
    description: "Mostra como zerar as advertências e o histórico de moderação do grupo",
    examples: [" — mostra o que dá para zerar e com qual comando"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, prefix = "." }) => {
        return reply(F.tela({
            emoji: "🧹", titulo: "Zerar o painel de alertas", prefix,
            intro: "Este comando não apaga nada sozinho. Escolha abaixo o que você quer zerar; cada um pede o comando certo.",
            dica: "Zerar não desfaz silenciamentos em andamento. Para liberar alguém, use " + F.cmd(prefix, "unmute", "@pessoa") + ".",
            proximos: [
                { nome: "limparavisos", args: "all", oque: "zera as advertências de todo mundo" },
                { nome: "limparavisos", args: "@pessoa", oque: "zera as advertências de uma pessoa" },
                { nome: "modlimparlivro", oque: "apaga o histórico de ocorrências" }
            ]
        }));
    }
};
