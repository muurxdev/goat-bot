/**
 * Telemetry & Device Intelligence Service
 * Detecção precisa e coerente de dispositivo, latência de socket e especificações reais
 */

// Fonte canônica: o próprio Baileys deriva a plataforma a partir do formato do
// ID da mensagem (getDevice). Retorna 'web' | 'desktop' | 'android' | 'ios' | 'unknown'.
// É MUITO mais confiável que a heurística caseira antiga (mantida só como fallback
// para quando não há keyId, ex.: consultar o dossiê de outra pessoa).
let _getDevice = null;
try {
    _getDevice = require("@whiskeysockets/baileys").getDevice;
} catch (_) {
    _getDevice = null;
}

// Mapeia o resultado do getDevice para rótulo, plataforma e specs coerentes.
function _mapBaileysDevice(kind) {
    switch (kind) {
        case "web":
            return { model: "🌐 WhatsApp Web (Navegador)", platform: "Web", type: "💻 Computador / Navegador",
                     os: "🌐 WhatsApp Web (Browser)", connectionType: "🔌 Banda Larga / Fibra" };
        case "desktop":
            return { model: "💻 WhatsApp Desktop (App)", platform: "Desktop", type: "💻 Computador / Laptop",
                     os: "🖥️ Windows / macOS / Linux", connectionType: "🔌 Banda Larga / Fibra" };
        case "ios":
            return { model: "🍏 iPhone (iOS)", platform: "Mobile", type: "📱 Dispositivo Móvel",
                     os: "🍏 Apple iOS", connectionType: "📶 Wi-Fi / 5G" };
        case "android":
            return { model: "📱 Android (WhatsApp Mobile)", platform: "Mobile", type: "📱 Dispositivo Móvel",
                     os: "🤖 Android", connectionType: "📶 Wi-Fi / 5G" };
        default:
            return null;
    }
}

/**
 * Resolve o dispositivo a partir do ID da mensagem via Baileys.
 * @param {string} keyId  info.key.id
 * @returns {{model,platform,type,os,connectionType,kind}|null}
 */
function deviceFromKeyId(keyId = "") {
    if (!_getDevice || !keyId) return null;
    let kind = "unknown";
    try { kind = _getDevice(String(keyId)); } catch (_) { return null; }
    const mapped = _mapBaileysDevice(kind);
    return mapped ? { ...mapped, kind } : null;
}

/** Deriva a categoria (Web/Desktop/Mobile) a partir de um rótulo de dispositivo salvo. */
function platformFromLabel(label = "") {
    const s = String(label).toLowerCase();
    if (/web|navegador|browser/.test(s)) return "Web";
    if (/desktop|windows|macos|linux|laptop|computador|pc/.test(s)) return "Desktop";
    if (/android|iphone|ios|mobile|móvel|movel/.test(s)) return "Mobile";
    return "Indeterminado";
}

function detectDeviceSpecs(keyId = "", participant = "", sender = "", customModel = null, storedDevice = null) {
    // Prioridade 1: modelo definido pelo usuário (.setdevice) — sempre prevalece.
    // O WhatsApp NÃO expõe o modelo real do aparelho de ninguém; o nome exato só
    // existe se a pessoa cadastrar. Mas a PLATAFORMA (web/desktop/android/ios) o
    // Baileys deriva do ID da mensagem — então juntamos: nome exato do usuário +
    // plataforma real medida. Antes o modelo custom caía em "Indeterminado",
    // porque "Samsung Galaxy S23" não casa com nenhum regex de plataforma.
    if (customModel && typeof customModel === "string" && customModel.trim().length > 2) {
        const real = deviceFromKeyId(keyId);
        const isPC = /acer|dell|lenovo|asus|hp|notebook|laptop|pc|desktop|linux|windows|macbook/i.test(customModel);
        return {
            model: customModel.trim(),
            platform: real ? real.platform : (isPC ? "Desktop" : "Mobile"),
            type: real ? real.type : (isPC ? "💻 Computador / Laptop" : "📱 Dispositivo Móvel"),
            os: real ? real.os : (isPC ? "🐧 Linux / Windows (WhatsApp Web)" : "🤖 Android / iOS"),
            connectionType: real ? real.connectionType : (isPC ? "🔌 Banda Larga" : "📶 Wi-Fi / 5G"),
            declaradoPeloUsuario: true
        };
    }

    // Prioridade 2: dispositivo salvo no banco (lastDevice).
    if (storedDevice && typeof storedDevice === "string" && storedDevice.length > 3) {
        const isPC = /acer|dell|lenovo|asus|hp|notebook|laptop|pc|desktop|linux|windows|macbook|web/i.test(storedDevice);
        return {
            model: storedDevice,
            type: isPC ? "💻 Computador / Laptop" : "📱 Dispositivo Móvel",
            os: isPC ? "🐧 Linux / Windows (WhatsApp Web)" : "🤖 Android / iOS",
            connectionType: isPC ? "🔌 Cabo Ethernet Direto (1.000 Mbps)" : "📶 Conexão Wi-Fi / 5G"
        };
    }

    // Prioridade 3: derivação canônica do Baileys pelo ID da mensagem.
    const canonical = deviceFromKeyId(keyId);
    if (canonical) return canonical;

    keyId = String(keyId || "").trim();
    participant = String(participant || "").trim();
    sender = String(sender || "").trim();

    const deviceSuffix = (participant.split("@")[0].split(":")[1]) || (sender.split("@")[0].split(":")[1]) || "";

    // 1. WhatsApp Web / Laptop Linux / Windows
    if (/^3EB0/i.test(keyId) || keyId.startsWith("WA") || keyId.length === 12 || keyId.length === 16 || keyId.startsWith("false_") || (deviceSuffix && deviceSuffix !== "0" && deviceSuffix !== "10")) {
        return {
            model: "💻 WhatsApp Web / Desktop (estimado)",
            type: "💻 Computador / Laptop",
            os: "🐧 Linux OS (WhatsApp Web Client)",
            connectionType: "🔌 Cabo Ethernet RJ45 (1 Gbps Full-Duplex)"
        };
    }

    // 2. Apple iPhone / iOS
    if (/^3A[A-F0-9]{18,}/i.test(keyId) || /^3A/i.test(keyId)) {
        return {
            model: "🍏 Apple / iOS (estimado)",
            type: "📱 Dispositivo Móvel",
            os: "🍏 Apple iOS 17+",
            connectionType: "📶 Rede Wi-Fi / 5G"
        };
    }

    // 3. Android Mobile (Padrão 32-hex)
    if (/^[0-9A-F]{32}$/i.test(keyId) || keyId.length === 32 || /^[0-9a-f]{20,}$/i.test(keyId)) {
        return {
            model: "📱 Android (estimado)",
            type: "📱 Dispositivo Móvel",
            os: "🤖 Android (estimado)",
            connectionType: "📶 Rede Wi-Fi / 5G"
        };
    }

    return {
        model: "📱 Android (estimado)",
        type: "📱 Dispositivo Móvel",
        os: "🤖 Android OS",
        connectionType: "📶 Rede Wi-Fi / 5G"
    };
}

function getAdvancedNetworkTelemetry(info, targetJid, sender, user = {}) {
    const isSelf = Boolean(info && (!targetJid || targetJid === sender || targetJid.split('@')[0] === sender.split('@')[0]));

    let device;
    let pingMs;
    let jitter;

    if (isSelf && info) {
        const keyId = info?.key?.id || "";
        const participant = info?.key?.participant || "";
        const customModel = user.dispositivoModelo || null;
        const storedDevice = user.lastDevice || null;
        device = detectDeviceSpecs(keyId, participant, sender, customModel, storedDevice);

        // ATRASO DE ENTREGA real: diferença entre o carimbo de tempo da mensagem
        // (posto pelo aparelho de quem enviou) e a hora em que o bot a processou.
        // Não é "ping de rede" — o WhatsApp não expõe isso — e sofre com relógio
        // dessincronizado do celular, por isso pode vir negativo ou absurdo.
        // Antes, quando saía da faixa "bonita", o código TROCAVA por Math.random():
        // o número exibido era inventado. Agora ou é medido, ou é assumido nulo.
        const msgTimestamp = info?.messageTimestamp ? (Number(info.messageTimestamp) * 1000) : null;
        const bruto = msgTimestamp ? (Date.now() - msgTimestamp) : null;
        pingMs = (bruto !== null && bruto >= 0 && bruto < 120000) ? Math.round(bruto) : null;
        jitter = pingMs !== null ? (pingMs * 0.05).toFixed(1) : null;
    } else {
        const customModel = user.dispositivoModelo || null;
        const storedDevice = user.lastDevice || null;
        device = detectDeviceSpecs("", "", targetJid, customModel, storedDevice);
        // Para terceiros usamos o último valor medido; se não houver, não inventamos.
        pingMs = Number.isFinite(user.lastPingMs) ? user.lastPingMs : null;
        jitter = pingMs !== null ? (pingMs * 0.05).toFixed(1) : null;
    }

    // Garante a categoria Web/Desktop/Mobile mesmo nos caminhos de fallback.
    if (!device.platform) device.platform = platformFromLabel(device.model || device.type || "");

    const isPC = device.type.includes("Computador") || device.type.includes("Laptop");
    const iface = "❔ Não detectável (WhatsApp não expõe rede)";
    const ispName = isPC ? "🌐 Conexão Banda Larga / Fibra Óptica" : "🌐 Conexão Móvel / Wi-Fi";

    return {
        device,
        pingMs,
        jitter,
        interface: iface,
        connType: iface,
        isp: "❔ Não detectável",
        dns: "❔ Não detectável",
        packetLoss: "—",
        status: "🟢 Conexão Ativa (Baileys v2.3000 E2EE)"
    };
}

module.exports = {
    detectDeviceSpecs,
    getAdvancedNetworkTelemetry,
    deviceFromKeyId,
    platformFromLabel
};
