/**
 * Comando .pacecorrida — Ritmo de corrida (min/km): .pacecorrida <km> <minutos>
 */
module.exports = {
    name: "pacecorrida",
    aliases: ["ritmocorrida","runningpace"],
    category: "general",
    subcategory: "Utilidades",
    description: "Ritmo de corrida (min/km): .pacecorrida <km> <minutos>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const km=parseFloat((args[0]||'').replace(',','.')); const min=parseFloat((args[1]||'').replace(',','.')); if(isNaN(km)||isNaN(min)||km<=0) return reply('🏃 Uso: `.pacecorrida <km> <minutos>`'); const pace=min/km; const pm=Math.floor(pace); const ps=Math.round((pace-pm)*60); const vel=km/(min/60); return reply(`🏃 *RITMO DE CORRIDA*\n\n📏 ${km}km em ${min}min\n\n⏱️ Pace: *${pm}:${String(ps).padStart(2,'0')} min/km*\n💨 Velocidade: *${vel.toFixed(1)} km/h*`); }
};
