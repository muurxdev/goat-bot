const logger = require('../../core/logger');

const FORMULAS = {
    cubo: { name: 'Cubo', emoji: '🧊', calc: (args) => {
        const [a] = args.map(Number);
        if (args.length < 1 || isNaN(a) || a <= 0) return null;
        return { volume: a * a * a, formula: `${a}³`, detail: `Lado³` };
    }},
    esf: { name: 'Esfera', emoji: '⚽', calc: (args) => {
        const [r] = args.map(Number);
        if (args.length < 1 || isNaN(r) || r <= 0) return null;
        const vol = (4 / 3) * Math.PI * r * r * r;
        return { volume: vol, formula: `(4/3) × π × ${r}³`, detail: `(4/3) × π × Raio³` };
    }},
    cil: { name: 'Cilindro', emoji: '🥫', calc: (args) => {
        const [r, h] = args.map(Number);
        if (args.length < 2 || isNaN(r) || isNaN(h) || r <= 0 || h <= 0) return null;
        return { volume: Math.PI * r * r * h, formula: `π × ${r}² × ${h}`, detail: `π × Raio² × Altura` };
    }},
    cone: { name: 'Cone', emoji: '🔺', calc: (args) => {
        const [r, h] = args.map(Number);
        if (args.length < 2 || isNaN(r) || isNaN(h) || r <= 0 || h <= 0) return null;
        return { volume: (1 / 3) * Math.PI * r * r * h, formula: `(1/3) × π × ${r}² × ${h}`, detail: `(1/3) × π × Raio² × Altura` };
    }},
    pir: { name: 'Pirâmide', emoji: '🏛️', calc: (args) => {
        const [b, h] = args.map(Number);
        if (args.length < 2 || isNaN(b) || isNaN(h) || b <= 0 || h <= 0) return null;
        return { volume: (b * b * h) / 3, formula: `(${b}² × ${h}) / 3`, detail: `(Base² × Altura) / 3` };
    }}
};

module.exports = {
    name: 'volume',
    aliases: ['calcularvolume', 'calvolume', 'volumefig'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula o volume de figuras geométricas 3D',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.volume <tipo> <dimensões>`\n\n' +
                '📐 *Tipos disponíveis:*\n' +
                '• `cubo <lado>` — Cubo\n' +
                '• `esf <raio>` — Esfera\n' +
                '• `cil <raio> <altura>` — Cilindro\n' +
                '• `cone <raio> <altura>` — Cone\n' +
                '• `pir <lado_base> <altura>` — Pirâmide quadrada\n\n' +
                '📌 *Exemplo:* `.volume cubo 5`'
            );
        }

        const parts = input.split(/\s+/);
        const type = parts[0].toLowerCase();
        const dimensions = parts.slice(1);

        const formula = FORMULAS[type];
        if (!formula) return reply('❌ Tipo inválido. Use: cubo, esf, cil, cone, pir.');

        const result = formula.calc(dimensions);
        if (!result) return reply(`❌ Dimensões inválidas para ${formula.name}.`);

        const doc = [
            `╔══════════════════════════════╗`,
            `║  📦 *CÁLCULO DE VOLUME* 📦   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `${formula.emoji} *Figura:* ${formula.name}`,
            `📐 *Fórmula:* ${formula.detail}`,
            `🔢 *Cálculo:* ${result.formula}`,
            ``,
            `╭━〔 📊 RESULTADO 〕━⬣`,
            `┃ 🎯 *Volume:* **${result.volume.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}** unidades³`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
