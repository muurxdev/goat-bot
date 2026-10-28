/**
 * Comando .calc / .calculadora / .math
 * Central Inteligente de Cálculos Matemáticos, Financeiros e Científicos Reais
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

function safeEvaluate(expr) {
    let clean = expr.trim()
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/,/g, ".")
        .replace(/\bpi\b/gi, Math.PI)
        .replace(/\be\b/gi, Math.E)
        .replace(/sqrt\(([^)]+)\)/gi, "Math.sqrt($1)")
        .replace(/raiz\(([^)]+)\)/gi, "Math.sqrt($1)")
        .replace(/cbrt\(([^)]+)\)/gi, "Math.cbrt($1)")
        .replace(/sin\(([^)]+)\)/gi, "Math.sin(($1) * Math.PI / 180)")
        .replace(/cos\(([^)]+)\)/gi, "Math.cos(($1) * Math.PI / 180)")
        .replace(/tan\(([^)]+)\)/gi, "Math.tan(($1) * Math.PI / 180)")
        .replace(/abs\(([^)]+)\)/gi, "Math.abs($1)")
        .replace(/log\(([^)]+)\)/gi, "Math.log10($1)")
        .replace(/ln\(([^)]+)\)/gi, "Math.log($1)")
        .replace(/\^/g, "**")
        .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    // Só números, operadores e as funções de Math que a própria troca acima
    // gerou. Antes aceitava qualquer letra, então ".calc process.exit()" (ou
    // process.mainModule.require) rodava direto no new Function abaixo.
    const semFuncoes = clean.replace(/Math\.(?:sqrt|cbrt|sin|cos|tan|abs|log10|log|PI)/g, " ");
    if (!/^[-+*/().0-9eE\s]+$/.test(semFuncoes) || /[a-df-zA-DF-Z_$]/.test(semFuncoes)) {
        const erro = new Error("Use só números, operações (+ - * / ^ %) e as funções da lista.");
        erro.paraUsuario = true;
        throw erro;
    }

    const fn = new Function("return " + clean);
    const res = fn();
    if (typeof res !== "number" || isNaN(res) || !isFinite(res)) {
        const erro = new Error("A conta não tem resultado (divisão por zero ou valor infinito).");
        erro.paraUsuario = true;
        throw erro;
    }
    return Number(res.toFixed(6));
}

module.exports = {
    name: "calc",
    aliases: ["calcular", "calculadora", "math", "bhaskara", "juros", "regra3", "porcentagem"],
    category: "general",
    subcategory: "Matemática",
    description: "Calculadora: contas, porcentagem, juros, Bhaskara e regra de três",
    usage: "<conta> | bhaskara <a> <b> <c> | juros <capital> <taxa> <meses>",
    examples: ["(2 + 3) * 4 — conta comum", "pct 15% 850 — 15% de 850", "bhaskara 1 -5 6 — equação do 2º grau", "regra3 10 20 30 — regra de três"],
    cooldownMs: 1500,
    execute: async ({ text, reply, args, commandName }) => {
        const botName = getBotName();
        const input = (text || "").trim();

        if (!input) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║    🧮 *CALCULADORA INTELIGENTE* 🧮   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Como usar:*\n`
            doc += `• \`.calc <expressão>\` — Expressões matemáticas (ex: \`2 + 5 * 10\`)\n`
            doc += `• \`.calc sqrt(144) + 2^3\` — Raízes e potências\n`
            doc += `• \`.calc bhaskara <a> <b> <c>\` — Equação do 2º Grau\n`
            doc += `• \`.calc regra3 <A> <B> <C>\` — Se A está para B, C está para X\n`
            doc += `• \`.calc juros <capital> <taxa%> <meses>\` — Juros Simples\n`
            doc += `• \`.calc juroscompostos <capital> <taxa%> <meses>\` — Juros Compostos\n`
            doc += `• \`.calc pct 15% 850\` — Calcular porcentagem de um valor\n`
            doc += `• \`.calc media 10 8 7 9.5\` — Média aritmética de números\n`
            doc += `• \`.calc bin <número>\` / \`.calc hex <número>\` — Bases numéricas\n\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        const sub = (args[0] || commandName || "").toLowerCase().trim();

        // 1. BHASKARA / EQUAÇÃO DO 2º GRAU
        if (sub === "bhaskara" || sub === "eq2" || commandName === "bhaskara") {
            const params = args.filter(a => /^[-+]?[0-9]*\.?[0-9]+$/.test(a)).map(Number);
            if (params.length < 3) {
                return reply("❌ Informe os 3 coeficientes (a, b, c) da equação.\n\n📌 *Exemplo:* \`.calc bhaskara 1 -5 6\` para \`x² - 5x + 6 = 0\`");
            }

            const [a, b, c] = params;
            if (a === 0) {
                return reply("❌ O coeficiente a não pode ser zero em uma equação do 2º grau.");
            }

            const delta = (b * b) - (4 * a * c);
            let doc = "╔══════════════════════════════╗\n";
            doc += "║    📐 *EQUAÇÃO DO 2º GRAU* 📐    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📝 *Equação:* *" + a + "x² " + (b >= 0 ? "+ " + b : "- " + Math.abs(b)) + "x " + (c >= 0 ? "+ " + c : "- " + Math.abs(c)) + " = 0*\n\n";
            doc += "╭━〔 🔍 PASSO A PASSO 〕━⬣\n";
            doc += "┃ 🔹 *Delta (Δ):* b² - 4ac\n";
            doc += "┃ 🔹 *Δ =* (" + b + ")² - 4*(" + a + ")*(" + c + ") = *" + delta + "*\n";

            if (delta > 0) {
                const x1 = ((-b + Math.sqrt(delta)) / (2 * a));
                const x2 = ((-b - Math.sqrt(delta)) / (2 * a));
                doc += "┃ 🟢 *Δ > 0:* Possui 2 raízes reais distintas\n";
                doc += "┃ 📌 *x₁ =* *" + Number(x1.toFixed(4)) + "*\n";
                doc += "┃ 📌 *x₂ =* *" + Number(x2.toFixed(4)) + "*\n";
            } else if (delta === 0) {
                const x = -b / (2 * a);
                doc += "┃ 🟡 *Δ = 0:* Possui 1 raiz real dupla\n";
                doc += "┃ 📌 *x =* *" + Number(x.toFixed(4)) + "*\n";
            } else {
                doc += "┃ 🔴 *Δ < 0:* Não possui raízes reais (raízes complexas)\n";
            }
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        }

        // 2. REGRA DE TRÊS
        if (sub === "regra3" || sub === "r3" || commandName === "regra3") {
            const isInv = args[1]?.toLowerCase() === "inv" || args[1]?.toLowerCase() === "inversa";
            const numbers = args.filter(a => /^[-+]?[0-9]*\.?[0-9]+$/.test(a)).map(Number);

            if (numbers.length < 3) {
                return reply("❌ Informe os 3 valores da regra de três.\n\n📌 *Exemplo Direto:* \`.calc regra3 10 20 30\` (Se 10 equivale a 20, 30 equivale a X)\n📌 *Exemplo Inverso:* \`.calc regra3 inv 2 6 4\` (2 operários demoram 6 dias, 4 demoram X)");
            }

            const [a, b, c] = numbers;
            const x = isInv ? (a * b) / c : (b * c) / a;

            let doc = "╔══════════════════════════════╗\n";
            doc += "║     📏 *REGRA DE TRÊS* 📏     ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📊 *Tipo:* *" + (isInv ? "Inversamente Proporcional" : "Diretamente Proporcional") + "*\n\n";
            doc += "╭━〔 📐 PROPORÇÃO 〕━⬣\n";
            doc += "┃ " + a + " ➔ " + b + "\n";
            doc += "┃ " + c + " ➔ *X*\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            doc += "🎯 *Resultado (X):* *" + Number(x.toFixed(4)).toLocaleString("pt-BR") + "*\n\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        }

        // 3. JUROS SIMPLES & COMPOSTOS
        if (sub === "juros" || sub === "juro" || sub === "juroscompostos" || commandName === "juros") {
            const isComposto = sub === "juroscompostos" || args.some(a => a.toLowerCase().includes("compost"));
            const numbers = args.filter(a => /^[-+]?[0-9]*\.?[0-9]+%?$/.test(a)).map(a => parseFloat(a.replace("%", "")));

            if (numbers.length < 3) {
                return reply("❌ Informe: <capital> <taxa_mensal%> <tempo_meses>.\n\n📌 *Exemplo:* \`.calc juros 1000 5 12\` (R$ 1000 a 5% ao mês por 12 meses)\n📌 *Juros Compostos:* \`.calc juroscompostos 1000 5 12\`");
            }

            const [capital, taxa, meses] = numbers;
            const i = taxa / 100;
            let montante = 0;
            let jurosTotais = 0;

            if (isComposto) {
                montante = capital * Math.pow(1 + i, meses);
                jurosTotais = montante - capital;
            } else {
                jurosTotais = capital * i * meses;
                montante = capital + jurosTotais;
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║    💰 *CÁLCULO DE JUROS* 💰    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📈 *Modalidade:* *" + (isComposto ? "Juros Compostos" : "Juros Simples") + "*\n\n";
            doc += "╭━〔 💳 DETALHES FINANCEIROS 〕━⬣\n";
            doc += "┃ 💵 *Capital Inicial:* R$ " + capital.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + "\n";
            doc += "┃ 📊 *Taxa de Juros:* " + taxa + "% ao mês\n";
            doc += "┃ ⏱️ *Período:* " + meses + " meses (" + (meses / 12).toFixed(1) + " anos)\n";
            doc += "┃ 📈 *Rendimento / Juros:* +R$ " + jurosTotais.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + "\n";
            doc += "┃ 💎 *Montante Final:* *R$ " + montante.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + "*\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        }

        // 4. PORCENTAGEM (PCT)
        if (sub === "pct" || sub === "porcentagem" || commandName === "porcentagem") {
            const numbers = args.filter(a => /^[-+]?[0-9]*\.?[0-9]+%?$/.test(a)).map(a => parseFloat(a.replace("%", "")));
            if (numbers.length >= 2) {
                const [pct, val] = numbers;
                const res = (pct / 100) * val;
                let doc = "╔══════════════════════════════╗\n";
                doc += "║     📊 *PORCENTAGEM* 📊      ║\n";
                doc += "╚══════════════════════════════╝\n\n";
                doc += "📌 *" + pct + "% de " + val.toLocaleString("pt-BR") + "*\n\n";
                doc += "🎯 *Resultado:* *" + Number(res.toFixed(4)).toLocaleString("pt-BR") + "*\n\n";
                doc += "👑 *" + botName + "*";
                return reply(doc.trim());
            }
        }

        // 5. ESTATÍSTICA: MÉDIA & MEDIANA
        if (sub === "media" || sub === "mediana") {
            const nums = args.slice(1).map(Number).filter(n => !isNaN(n));
            if (nums.length === 0) {
                return reply("❌ Informe ao menos 2 números para o cálculo estatístico.\n\n📌 *Exemplo:* \`.calc media 7 8 9.5 10\`");
            }

            if (sub === "media") {
                const sum = nums.reduce((a, b) => a + b, 0);
                const avg = sum / nums.length;
                return reply("📊 *MÉDIA ARITMÉTICA*\n\n🔢 *Valores:* [" + nums.join(", ") + "]\n📌 *Soma:* " + sum + "\n🎯 *Média:* *" + Number(avg.toFixed(4)).toLocaleString("pt-BR") + "*\n\n👑 *" + botName + "*");
            } else {
                nums.sort((a, b) => a - b);
                const mid = Math.floor(nums.length / 2);
                const median = nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
                return reply("📊 *MEDIANA ESTATÍSTICA*\n\n🔢 *Rol Ordenado:* [" + nums.join(", ") + "]\n🎯 *Mediana:* *" + Number(median.toFixed(4)).toLocaleString("pt-BR") + "*\n\n👑 *" + botName + "*");
            }
        }

        // 6. BASES NUMÉRICAS (BIN, HEX, DEC)
        if (sub === "bin" || sub === "hex" || sub === "dec") {
            const val = args[1];
            if (!val) return reply("❌ Informe o número a converter.");
            const num = sub === "hex" && !val.startsWith("0x") ? parseInt(val, 16) : parseInt(val, 10);
            if (isNaN(num)) return reply("❌ Número inválido.");

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   🔢 *BASES NUMÉRICAS* 🔢    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "• 🔟 *Decimal:* " + num + "\n";
            doc += "• 0️⃣1️⃣ *Binário:* " + num.toString(2) + "\n";
            doc += "• 🔤 *Hexadecimal:* 0x" + num.toString(16).toUpperCase() + "\n";
            doc += "• 🎱 *Octal:* " + num.toString(8) + "\n\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        }

        // 7. EXPRESSÃO MATEMÁTICA GERAL
        try {
            const result = safeEvaluate(input);
            let doc = "╔══════════════════════════════╗\n";
            doc += "║    🧮 *CÁLCULO MATEMÁTICO* 🧮    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📝 *Expressão:* \`" + input + "\`\n\n";
            doc += "🎯 *Resultado:* *" + result.toLocaleString("pt-BR") + "*\n\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        } catch (err) {
            logger.warn("[CALC ERROR] Expressão inválida:", input, err.message);
            const motivo = err.paraUsuario ? err.message : "A expressão está incompleta ou tem algo que eu não reconheço.";
            return reply("❌ *Não consegui calcular*\n\n" + motivo + "\n\n📌 *Exemplo:* \`.calc (2 + 3) * 4\`\n\n💡 _Digite_ \`.calc\` _para ver todas as contas que eu sei fazer._");
        }
    }
};
