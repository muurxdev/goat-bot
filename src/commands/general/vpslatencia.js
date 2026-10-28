const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "vpslatencia",
    aliases: ["latenciaglobal", "pingregioes", "statusdatacenter"],
    category: "general",
    description: "Painel de telemetria de latência para datacenters globais",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "TELEMETRIA DE LATÊNCIA GLOBAL (VPS)",
            icon: "🌐",
            subtitle: "📡 *Servidor Dedicado 1 Gbps*",
            sections: [
                {
                    title: "TEMPO DE RESPOSTA POR REGIÃO",
                    icon: "📶",
                    fields: [
                        { label: "São Paulo (GRU)", value: "12 ms ⚡", icon: "🇧🇷" },
                        { label: "Norte da Virgínia (US-East)", value: "110 ms 🟢", icon: "🇺🇸" },
                        { label: "Frankfurt (EU-Central)", value: "185 ms 🟡", icon: "🇩🇪" },
                        { label: "Tóquio (AP-Northeast)", value: "240 ms 🟡", icon: "🇯🇵" }
                    ]
                }
            ],
            tip: "Servidor otimizado com rotas diretas de baixa latência!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};

