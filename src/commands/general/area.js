const logger = require('../../core/logger');

const FORMULAS = {
    ret: { name: 'Retângulo', emoji: '📐', calc: (args) => {
        const [b, h] = args.map(Number);
        if (args.length < 2 || isNaN(b) || isNaN(h) || b <= 0 || h <= 0) return null;
        return { area: b * h, formula: `${b} × ${h}`, detail: `Base × Altura` };
    }},
    circ: { name: 'Círculo', emoji: '⭕', calc: (args) => {
        const [r] = args.map(Number);
        if (args.length < 1 || isNaN(r) || r <= 0) return null;
        return { area: Math.PI * r * r, formula: `π × ${r}²`, detail: `π × Raio²` };
    }},
    tri: { name: 'Triângulo', emoji: '🔺', calc: (args) => {
        const [b, h] = args.map(Number);
        if (args.length < 2 || isNaN(b) || isNaN(h) || b <= 0 || h <= 0) return null;
        return { area: (b * h) / 2, formula: `(${b} × ${h}) / 2`, detail: `(Base × Altura) / 2` };
    }},
    trap: { name: 'Trapézio', emoji: '⬡', calc: (args) => {
        const [B, b, h] = args.map(Number);
        if (args.length < 3 || isNaN(B) || isNaN(b) || isNaN(h) || B <= 0 || b <= 0 || h <= 0) return null;
        return { area: ((B + b) * h) / 2, formula: `(${B} + ${b}) × ${h} / 2`, detail: `(Base Maior + Base Menor) × Altura / 2` };
    }},
    los: { name: 'Losango', emoji: '🔷', calc: (args) => {
        const [D, d] = args.map(Number);
        if (args.length < 2 || isNaN(D) || isNaN(d) || D <= 0 || d <= 0) return null;
        return { area: (D * d) / 2, formula: `(${D} × ${d}) / 2`, detail: `(Diagonal Maior × Diagonal Menor) / 2` };
    }}
};

module.exports = {
    name: 'area',
    aliases: ['calculararea', 'calarea', 'areaform'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula a área de figuras geométricas',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.area <tipo> <dimensões>`\n\n' +
                '📐 *Tipos disponíveis:*\n' +
                '• `ret <base> <altura>` — Retângulo\n' +
                '• `circ <raio>` — Círculo\n' +
                '• `tri <base> <altura>` — Triângulo\n' +
                '• `trap <base_maior> <base_menor> <altura>` — Trapézio\n' +
                '• `los <diag_maior> <diag_menor>` — Losango\n\n' +
                '📌 *Exemplo:* `.area ret 10 5`'
            );
        }

        const parts = input.split(/\s+/);
        const type = parts[0].toLowerCase();
        const dimensions = parts.slice(1);

        const formula = FORMULAS[type];
        if (!formula) return reply('❌ Tipo inválido. Use: ret, circ, tri, trap, los.');

        const result = formula.calc(dimensions);
        if (!result) return reply(`❌ Dimensões inválidas para ${formula.name}.`);

        const doc = [
            `╔══════════════════════════════╗`,
            `║  📐 *CÁLCULO DE ÁREA* 📐    ║`,
            `╚══════════════════════════════╝`,
            ``,
            `${formula.emoji} *Figura:* ${formula.name}`,
            `📐 *Fórmula:* ${formula.detail}`,
            `🔢 *Cálculo:* ${result.formula}`,
            ``,
            `╭━〔 📊 RESULTADO 〕━⬣`,
            `┃ 🎯 *Área:* **${result.area.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}** unidades²`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
