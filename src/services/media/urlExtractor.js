/**
 * Media URL & Argument Parser
 * Extrai links limpos, formatos (MP3/MP4) e parâmetros de busca
 */

function extractUrlAndFormat(rawInput = "", defaultFormat = "mp4") {
    if (!rawInput || typeof rawInput !== "string") {
        return { url: "", isMp3: false, isMp4: false, format: defaultFormat, cleanQuery: "" };
    }

    const trimmed = rawInput.trim();
    const isMp3 = /\b(mp3|audio|som|musica)\b/i.test(trimmed) || /^[\+\-]mp3\b/i.test(trimmed);
    const isMp4 = /\b(mp4|video|clipe|filme)\b/i.test(trimmed) || /^[\+\-]mp4\b/i.test(trimmed);
    const format = isMp3 ? "mp3" : (isMp4 ? "mp4" : defaultFormat);

    const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
    let url = "";
    if (urlMatch) {
        url = urlMatch[0].replace(/[.,;:!?)]+$/, "").trim();
    }

    const cleanQuery = trimmed
        .replace(/^[\+\-](mp3|mp4|audio|video)\s*/gi, "")
        .replace(/\b(mp3|mp4|audio|video)\b/gi, "")
        .trim();

    return {
        url,
        isMp3,
        isMp4,
        format,
        cleanQuery: url || cleanQuery
    };
}

module.exports = {
    extractUrlAndFormat
};
