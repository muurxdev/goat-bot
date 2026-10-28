/**
 * Comando .clima / .tempo / .previsao
 * Previsão Meteorológica e Condições Climáticas em Tempo Real
 */

const logger = require('../../core/logger')
const { getClima } = require('../../services/apiService');
const { renderCard } = require('../../utils/uiEngine');

module.exports = {
    name: "clima",
    aliases: ["weather","tempo","previsao","temperatura","cmd_clima","alt_clima","atalho_clima","abrev_clima","call_clima","func_clima"],
    category: "dev",
    description: "Consulta as condições climáticas e previsão do tempo de qualquer cidade",
    cooldownMs: 2000,
    execute: async ({ args, text, reply, sender }) => {
        const city = (text && text.trim()) || (args && args.join(" ").trim());

        if (!city) {
            return reply("🌦️ *Uso:* Digite `.clima <nome da cidade>`\n👉 Exemplo: `.clima São Paulo` ou `.clima Tokyo`");
        }

        let weatherData = await getClima(city);

        // Fallback wttr.in
        if (!weatherData) {
            try {
                const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
                const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
                if (res.ok) {
                    const data = await res.json();
                    const current = data.current_condition?.[0];
                    const area = data.nearest_area?.[0];
                    if (current) {
                        weatherData = {
                            local: `${area?.areaName?.[0]?.value || city}, ${area?.region?.[0]?.value || ''}`,
                            pais: area?.country?.[0]?.value || '',
                            temperatura: current.temp_C,
                            sensacao: current.FeelsLikeC,
                            umidade: current.humidity,
                            vento: current.windspeedKmph,
                            condicao: current.lang_pt?.[0]?.value || current.weatherDesc?.[0]?.value || "Céu Limpo",
                            icone: "🌤️"
                        };
                    }
                }
            } catch (errIgnorado) { logger.warn(`[CLIMA] Falha ignorada em src/commands/dev/clima.js:46: ${errIgnorado.message}`) }
        }

        if (!weatherData) {
            return reply(`❌ *Não foi possível obter o clima para "${city}". Verifique o nome da cidade.*`);
        }

        const doc = renderCard({
            title: "PREVISÃO METEOROLÓGICA",
            icon: weatherData.icone || "🌤️",
            subtitle: `📍 *Local:* ${weatherData.local} (${weatherData.pais})`,
            sections: [
                {
                    title: "CONDIÇÕES ATUAIS",
                    icon: "🌡️",
                    fields: [
                        { label: "Temperatura", value: `${weatherData.temperatura}°C (Sensação: ${weatherData.sensacao}°C)`, icon: "🌡️" },
                        { label: "Condição do Tempo", value: weatherData.condicao, icon: "☁️" },
                        { label: "Umidade do Ar", value: `${weatherData.umidade}%`, icon: "💧" },
                        { label: "Velocidade do Vento", value: `${weatherData.vento} km/h`, icon: "💨" }
                    ]
                }
            ],
            tip: "Dados meteorológicos obtidos em tempo real via Open-Meteo & Satélite.",
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};
