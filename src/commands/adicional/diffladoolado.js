/**
 * Comando .diffladoolado / .comparadortexto
 * Compara dois textos lado a lado analisando caracteres, palavras e divergências
 */

module.exports = {
    name: 'diffladoolado',
    aliases: ["comparadortexto","textodiff","conferirtexto","cmd_diffladoolado","alt_diffladoolado","atalho_diffladoolado","abrev_diffladoolado","call_diffladoolado","func_diffladoolado"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Compara dois textos lado a lado analisando tamanho, caracteres e palavras',
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = '.' }) => {
        const full = args.join(' ').trim();
        const partes = full.split('|');

        if (partes.length < 2 || !partes[0].trim() || !partes[1].trim()) {
            return reply(`⚖️ *Comparador de Textos Lado a Lado*\n\nUse: \`${prefix}diffladoolado <texto 1> | <texto 2>\`\n\n💡 *Exemplo:*\n\`${prefix}diffladoolado Versão A | Versão B\``);
        }

        const t1 = partes[0].trim();
        const t2 = partes[1].trim();

        const words1 = t1.split(/\s+/).filter(Boolean).length;
        const words2 = t2.split(/\s+/).filter(Boolean).length;

        const iguais = t1 === t2;

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║     ⚖️ *COMPARATIVO LADO A LADO* ⚖️    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 1️⃣ TEXTO A 〕━⬣\n`;
        doc += `📝 "${t1.slice(0, 150)}"` + (t1.length > 150 ? '...' : '') + `\n`;
        doc += `📏 *Tamanho:* ${t1.length} caracteres | 📑 *Palavras:* ${words1}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `╭━〔 2️⃣ TEXTO B 〕━⬣\n`;
        doc += `📝 "${t2.slice(0, 150)}"` + (t2.length > 150 ? '...' : '') + `\n`;
        doc += `📏 *Tamanho:* ${t2.length} caracteres | 📑 *Palavras:* ${words2}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `🔍 *Diagnóstico:* ${iguais ? '✅ Os dois textos são 100% idênticos!' : '⚠️ Os dois textos são diferentes.'}\n`;
        if (!iguais) {
            doc += `📊 *Diferença:* ${Math.abs(t1.length - t2.length)} caracteres de discrepância.`;
        }

        return reply(doc.trim());
    }
};