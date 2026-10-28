/**
 * Comando .tmb — Taxa Metabólica Basal: .tmb <peso kg> <altura cm> <idade> <m/f>
 */
module.exports = {
    name: "tmb",
    aliases: ["metabolismo","basalmetabolic"],
    category: "general",
    subcategory: "Utilidades",
    description: "Taxa Metabólica Basal: .tmb <peso kg> <altura cm> <idade> <m/f>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const p=parseFloat((args[0]||'').replace(',','.')); const a=parseFloat((args[1]||'').replace(',','.')); const idade=parseInt(args[2],10); const sexo=(args[3]||'m').toLowerCase(); if([p,a,idade].some(isNaN)) return reply('🔥 Uso: `.tmb <peso kg> <altura cm> <idade> <m/f>`'); const tmb=sexo.startsWith('f')?(447.593+9.247*p+3.098*a-4.330*idade):(88.362+13.397*p+4.799*a-5.677*idade); return reply(`🔥 *TAXA METABÓLICA BASAL*\n\n⚖️ ${p}kg · 📏 ${a}cm · 🎂 ${idade} anos · ${sexo.startsWith('f')?'♀️':'♂️'}\n\n📊 TMB: *${Math.round(tmb)} kcal/dia*\n💡 _Calorias que o corpo gasta em repouso._`); }
};
