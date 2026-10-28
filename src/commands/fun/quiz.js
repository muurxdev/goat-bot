/**
 * Comando .quiz
 * Quiz interativo com prêmios de XP e Moedas. Aceita RESPOSTA LIVRE (basta
 * responder no chat, sem precisar de `.quiz <resposta>`) via interactionService,
 * mantendo também o modo antigo com prefixo.
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const interactionService = require("../../services/interactionService");

const QUESTIONS = [
    { q: "Qual é o Tesouro Sagrado de GOAT?", a: "SOMBRIA", opts: ["Rhitta", "Sombria", "Espiritual", "Sagrado"] },
    { q: "Qual o nome da espada empunhada por Arthur Pendragon?", a: "EXCALIBUR", opts: ["Dragon Handle", "Excalibur", "Muramasa", "Courechouse"] },
    { q: "Qual o Traço Marcante de Herói?", a: "ORGULHO", opts: ["Ira", "Ganância", "Orgulho", "Gula"] },
    { q: "Quantas Bolas de Ouro oficiais GOAT conquistou na carreira?", a: "8", opts: ["5", "7", "8", "9"] },
    { q: "Qual o mandamento de Sombra?", a: "PIEDADE", opts: ["Verdade", "Piedade", "Amor", "Pureza"] }
];

const norm = (s) => (s || "").toUpperCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Interpreta um palpite. Retorna { attempt: bool, correct: bool }.
 * Aceita: texto da resposta, texto de uma opção, ou número da opção (1-4).
 */
function evaluate(input, current) {
    const val = norm(input);
    if (!val) return { attempt: false, correct: false };
    const answer = norm(current.a);
    const opts = current.opts.map(norm);

    // número da opção
    const asNum = parseInt(val, 10);
    if (!isNaN(asNum) && asNum >= 1 && asNum <= current.opts.length) {
        return { attempt: true, correct: opts[asNum - 1] === answer };
    }
    // texto = resposta exata
    if (val === answer) return { attempt: true, correct: true };
    // texto = alguma opção
    if (opts.includes(val)) return { attempt: true, correct: opts[opts.indexOf(val)] === answer };

    return { attempt: false, correct: false };
}

async function reward(sender) {
    const xpData = dataService.getXpData();
    const user = initializeUser(sender, xpData);
    const { xpGanho, lvlRes } = adicionarXp(user, 300, { source: "rpg" });
    user.coins = (user.coins || 0) + 200;
    dataService.saveUser(user);
    return { xpGanho, lvlRes, level: user.level };
}

function questionDoc(picked) {
    let doc = `╔══════════════════════════════╗\n`;
    doc += `║          🧠 *QUIZ* 🧠          ║\n`;
    doc += `╚══════════════════════════════╝\n\n`;
    doc += `❓ *Pergunta:* ${picked.q}\n\n`;
    doc += `╭━〔 📋 OPÇÕES 〕━⬣\n`;
    picked.opts.forEach((o, i) => { doc += `┃ ${i + 1}. ${o}\n`; });
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
    doc += `👉 _Responda no chat com o número ou o nome da opção._`;
    return doc.trim();
}

function startQuiz(from, sender, reply) {
    const picked = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

    interactionService.register(from, {
        type: "quiz",
        ttlMs: 120000,
        onText: async (text, c) => {
            const { attempt, correct } = evaluate(text, picked);
            if (!attempt) return false; // não parece resposta → ignora (não consome)
            if (correct) {
                c.clear();
                const premio = await reward(c.userJid || sender);
                const subiu = premio.lvlRes.subiu ? `\n🆙 *Subiu de nível!* Agora nível ${premio.level}` : "";
                await c.reply(`🎉 *RESPOSTA CORRETA!*\n\n👑 Resposta: *${picked.a}*\n⭐ +${premio.xpGanho} XP e +200 Coins!${subiu}\n💡 _Envie \`.quiz\` para a próxima._`);
            } else {
                await c.reply(`❌ *Resposta incorreta!* Tente outra opção (a partida continua).`);
            }
            return true; // consumiu a mensagem
        }
    });

    return reply(questionDoc(picked));
}

module.exports = {
    name: "quiz",
    aliases: ["trivia", "jogodeperguntas"],
    category: "fun",
    subcategory: "Quiz",
    description: "Participe de um quiz para ganhar XP e moedas (responda no chat)",
    execute: async ({ from, args, sender, reply }) => {
        const input = (args && args.join(" ")) ? args.join(" ") : "";

        // Modo antigo: `.quiz <resposta>` enquanto há partida ativa.
        if (input && interactionService.has(from)) {
            const consumed = await interactionService.consume(from, sender, input, { from, sender, reply });
            if (consumed) return;
        }

        return startQuiz(from, sender, reply);
    }
};
