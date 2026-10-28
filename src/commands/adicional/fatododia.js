/**
 * Comando .fatododia / .fatocurioso
 * Fatos fascinantes e descobertas do mundo
 */

const FATOS = [
    "🐙 Os polvos têm três corações e o sangue deles é azul por causa da hemocianina à base de cobre.",
    "🪐 Em Saturno e Júpiter chove diamante puro devido à enorme pressão atmosférica que comprime o carbono.",
    "🍌 As bananas são naturalmente radioativas porque contêm isótopos de potássio-40, mas você precisaria comer 10 milhões de uma vez.",
    "🦈 Os tubarões já existiam na Terra antes das próprias árvores surgirem.",
    "🌌 Existem mais árvores na Terra (cerca de 3 trilhões) do que estrelas na Via Láctea (estimadas em 100 a 400 bilhões).",
    "💾 O primeiro disco rígido de 1 GB foi lançado em 1980 pela IBM, pesava quase 250 kg e custava 40 mil dólares.",
    "⚡ Um raio atinge uma temperatura de aproximadamente 30.000 °C — cinco vezes mais quente que a superfície visível do Sol.",
    "🐬 Os golfinhos dão nomes uns aos outros por meio de assobios exclusivos e respondem quando chamados.",
    "💎 O diamante mais resistente não é o comum, mas sim a Lonsdaleíta, que pode ser até 58% mais dura.",
    "⏱️ Se a história da Terra de 4,5 bilhões de anos fosse um dia de 24h, os humanos só teriam surgido nos últimos 4 segundos."
];

module.exports = {
    name: 'fatododia',
    aliases: ["fatocurioso","conhecimentorapido","fatoextra","cmd_fatododia","alt_fatododia","atalho_fatododia","abrev_fatododia","call_fatododia","func_fatododia"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Exibe fatos fascinantes e descobertas surpreendentes sobre a ciência e o mundo',
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        const fato = FATOS[Math.floor(Math.random() * FATOS.length)];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║     💡 *FATO CURIOSO DO DIA* 💡    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 🧠 CONHECIMENTO & CIÊNCIA 〕━⬣\n`;
        doc += `${String(fato).split('\n').map(l => '┃ ' + l).join('\n')}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Digite_ \`${prefix}fatododia\` _para sortear outro fato fascinante!_`;

        return reply(doc.trim());
    }
};