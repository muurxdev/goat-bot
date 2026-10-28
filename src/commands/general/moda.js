/**
 * Comando .moda — Moda (valor mais frequente): .moda 2 3 3 4 4 4
 */
module.exports = {
    name: "moda",
    aliases: ["modaestatistica","mode"],
    category: "general",
    subcategory: "Utilidades",
    description: "Moda (valor mais frequente): .moda 2 3 3 4 4 4",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const n=args.map(v=>parseFloat((v||'').replace(',','.'))).filter(v=>!isNaN(v)); if(n.length<1) return reply('📊 Uso: `.moda <n1> <n2> ...`'); const freq={}; n.forEach(x=>freq[x]=(freq[x]||0)+1); const max=Math.max(...Object.values(freq)); const modas=Object.keys(freq).filter(k=>freq[k]===max); return reply(`📊 *MODA*\n\n${max===1?'Nenhum valor se repete (amodal).':'Mais frequente ('+max+'x): *'+modas.join(', ')+'*'}`); }
};
