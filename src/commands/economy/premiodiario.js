/**
 * Comando .premiodiario
 * Roleta diária: de 400 a 1.199 moedas e de 150 a 449 XP a cada 24 horas.
 */

const dataService = require("../../services/dataService");
const { moedas, marcar, linhasSubiuNivel } = require("../../utils/textoRpg");
const { adicionarXp } = require("../../services/xpService");
const F = require("../../utils/formato");

const ESPERA_MS = 24 * 60 * 60 * 1000;

module.exports = {
    name: "premiodiario",
    aliases: ["roleta-diaria","girarroleta","spinwheel","cmd_premiodiario","alt_premiodiario","atalho_premiodiario","abrev_premiodiario","call_premiodiario","func_premiodiario"],
    category: "economy",
    subcategory: "Renda",
    description: "Gire a roleta do dia e ganhe moedas e XP",
    examples: [" — gira a roleta: de 400 a 1.199 moedas e de 150 a 449 XP"],
    cooldownMs: 5000,
    execute: async ({ sender, reply, prefix = "." }) => {
        const user = dataService.initializeUser(sender);

        const agora = Date.now();
        const ultimo = user.lastDaily || 0;
        if (agora - ultimo < ESPERA_MS) {
            const falta = ESPERA_MS - (agora - ultimo);
            return reply(F.tela({
                emoji: "⏳",
                titulo: "Roleta já girada hoje",
                intro: `Você já girou a roleta de hoje. Volte em *${F.tempo(falta)}*.`,
                secoes: [{ emoji: "📋", titulo: "Seu próximo", linhas: [
                    F.campo("Libera em", F.dataHora(ultimo + ESPERA_MS)),
                    F.campo("Carteira", moedas(user.coins || 0))
                ] }],
                dica: "Enquanto espera, dá para ganhar moedas trabalhando.",
                proximos: [
                    { nome: "trabalhar", oque: "ganhar moedas agora" },
                    { nome: "recompensaativa", oque: "pegar o bônus de atividade" }
                ],
                prefix
            }));
        }

        const valor = Math.floor(Math.random() * 800) + 400;
        const xpBase = Math.floor(Math.random() * 300) + 150;
        const carteiraAntes = user.coins || 0;
        user.coins = carteiraAntes + valor;
        const { xpGanho: xp, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" });
        user.lastDaily = agora;
        dataService.saveUser(user);

        return reply(F.tela({
            emoji: "🎡",
            titulo: "Roleta da sorte",
            intro: `${marcar(sender)}, a roleta parou e você ganhou *${moedas(valor)}* e *${xp.toLocaleString("pt-BR")} XP*.`,
            secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                F.campo("Moedas", `+${moedas(valor)}`),
                F.campo("XP", `+${xp.toLocaleString("pt-BR")} XP`),
                F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                F.campo("Próximo em", F.tempo(ESPERA_MS))
            ] },
            { emoji: "🆙", titulo: "Subiu de nível", linhas: linhasSubiuNivel(user, lvlRes) }],
            dica: "A roleta dá de 400 a 1.199 moedas e de 150 a 449 XP. Volte amanhã para girar de novo.",
            proximos: [
                { nome: "recompensaativa", oque: "pegar o bônus de atividade" },
                { nome: "banco", args: "depositar tudo", oque: "guardar no banco" }
            ],
            prefix
        }), [sender]);
    }
};
