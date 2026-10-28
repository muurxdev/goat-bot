/**
 * Utilitário de Erros do yt-dlp
 * Extrai a causa raiz da saída de erro do yt-dlp/FFmpeg para diagnóstico real
 * (URL inválida, extrator quebrado, 403/429, geo-restrição, login necessário, etc.)
 * sem esconder o stderr e sem expor credenciais (linhas ERROR já não contêm tokens).
 */

const MAX_DETAIL_LENGTH = 300

/**
 * Extrai as últimas linhas relevantes de erro ("ERROR: ...") do stderr
 * @param {string} stderr - Saída padrão de erro do processo
 * @returns {string}
 */
function lastErrorLines(stderr) {
    if (!stderr || typeof stderr !== 'string') return ''
    const lines = stderr.split('\n')
        .map(l => l.trim())
        .filter(l => /^(ERROR|WARNING: |Unsupported|Sign in|Got error|HTTP Error)/i.test(l))
    if (lines.length === 0) return ''
    return lines.slice(-2).join(' | ').slice(0, MAX_DETAIL_LENGTH)
}

/**
 * Constrói a mensagem de erro final acrescentando a causa real do stderr
 * @param {string} base - Mensagem genérica amigável
 * @param {string} stderr - Saída de erro do processo
 * @returns {string}
 */
function toMessage(base, stderr) {
    if (stderr && /Sign in to confirm you['']re not a bot/i.test(stderr)) {
        let msg = `🔒 O YouTube barrou meu acesso a esse vídeo agora.\n`
        msg += `Tente de novo em alguns minutos, peça a música por \`.play <nome>\` `
        msg += `ou envie seus cookies com \`.cookies\`.`
        return msg
    }
    if (stderr && /HTTP Error 403/i.test(stderr)) {
        return `${base}\n🗒️ *Detalhe:* Acesso negado (403). Tente com outro formato ou use \`.cookies\` para autenticar.`
    }
    if (stderr && /HTTP Error 429/i.test(stderr)) {
        return `${base}\n🗒️ *Detalhe:* Rate limit atingido (429). Aguarde alguns minutos e tente novamente.`
    }
    if (stderr && /Requested format is not available/i.test(stderr)) {
        return `${base}\n🗒️ *Detalhe:* O formato solicitado não está disponível para este vídeo. Tente outro formato.`
    }
    // Post SÓ DE FOTOS (carrossel de imagens). O yt-dlp é focado em vídeo e devolve
    // "No video formats found"; o Instagram bloqueia leitura de imagens sem login
    // (embed e espelhos públicos também vêm vazios). Explica em vez de vazar o dump.
    if (stderr && /No video formats found/i.test(stderr)) {
        let msg = `📸 Esse post só tem fotos, e o Instagram não libera fotos sem login.\n`
        msg += `Salve pelo app e me mande aqui, ou use um link de vídeo com \`.insta <link>\`.`
        return msg
    }
    const detail = lastErrorLines(stderr)
    return detail ? `${base}\n🗒️ *Detalhe:* ${detail}` : base
}

/** Corta o texto do pedido para caber numa frase curta. */
function _alvo(alvo) {
    const s = String(alvo || '').replace(/\s+/g, ' ').trim()
    return s.length > 60 ? s.slice(0, 57) + '…' : s
}

/**
 * Frase para o USUÁRIO a partir de um erro de mídia: o que houve + o que fazer.
 *
 * Nunca devolve err.message cru — o detalhe técnico (stderr, HTTP, código de
 * saída) vai para o logger no chamador. Aqui só se escolhe a frase: primeiro
 * pelo `err.code` (MEDIA_ERRORS, RATE_LIMITED...), depois por padrões
 * conhecidos da mensagem.
 *
 * @param {Error|any} err
 * @param {object} [ctx]
 * @param {string} [ctx.alvo]  nome/título/link pedido, para citar na frase
 * @param {string} [ctx.acao]  verbo no infinitivo ("baixar", "buscar")
 * @returns {string}
 */
function falaDeErro(err, { alvo = '', acao = 'baixar' } = {}) {
    const code = String(err?.code || '')
    const msg = String(err?.message || '')
    const a = _alvo(alvo)
    const citado = /^https?:\/\//i.test(a) ? ' esse link' : (a ? ` *${a}*` : ' isso')

    if (code === 'CANCELLED' || /cancelad/i.test(msg)) {
        return '🛑 Download cancelado.'
    }
    if (code === 'RATE_LIMITED' || /já possui downloads/i.test(msg)) {
        return '⏳ Você já tem um download na fila. Espere ele terminar e peça o próximo.'
    }
    if (code === 'NO_RESULTS' || /nenhum resultado/i.test(msg)) {
        return `🔍 Não achei nada para${citado}. Tente escrever de outro jeito ou mande o link.`
    }
    if (code === 'FILE_TOO_LARGE' || /muito grande/i.test(msg)) {
        const tam = msg.match(/\(([\d.,]+\s?[KMG]?B)\)/)
        const qual = tam ? `tem ${tam[1]} e ` : ''
        return `⚠️ Esse arquivo ${qual}passa do limite de 2 GB do WhatsApp, então não consigo enviar por aqui.`
    }
    if (code === 'DURATION_TOO_LONG' || /excede o limite máximo de/i.test(msg)) {
        return '⚠️ Esse conteúdo é longo demais para eu baixar. Tente uma versão mais curta.'
    }
    if (/Sign in to confirm|Anti-Bot|barrou meu acesso/i.test(msg)) {
        return '🔒 O YouTube barrou meu acesso agora.\nTente de novo em alguns minutos ou peça a música por `.play <nome>`.'
    }
    if (/No video formats found|só de FOTOS|só tem fotos/i.test(msg)) {
        return '📸 Esse post só tem fotos, e o Instagram não libera fotos sem login.\nSalve pelo app e me mande aqui, ou use um link de vídeo.'
    }
    if (/HTTP Error 429|\(429\)|rate limit/i.test(msg)) {
        return '⏳ A plataforma pediu uma pausa nos downloads. Tente de novo em alguns minutos.'
    }
    if (code === 'TIMEOUT' || /tempo limite|timeout|estagnado|excedeu o tempo/i.test(msg)) {
        return `⏱️ Demorou demais para baixar${citado} e desisti. Tente de novo daqui a pouco.`
    }
    if (code === 'FORMAT_UNAVAILABLE' || /Requested format is not available|formato solicitado/i.test(msg)) {
        return '❌ Esse conteúdo não tem o formato que você pediu. Tente sem escolher qualidade.'
    }
    if (code === 'INVALID_URL' || code === 'UNSUPPORTED_PLATFORM' || code === 'SECURITY_VIOLATION') {
        return '❌ Não reconheci esse link. Confira se ele está completo e é público.'
    }
    if (code === 'EXECUTABLE_NOT_FOUND') {
        return '🔧 Minha ferramenta de download está fora do ar agora. Tente mais tarde.'
    }
    if (code === 'UPLOAD_FAILED') {
        return `❌ Baixei${citado}, mas o WhatsApp não aceitou o envio. Tente de novo em instantes.`
    }
    if (code === 'MEDIA_NOT_FOUND' || /HTTP (Error )?40[34]|privad|indispon|not available|removed|público/i.test(msg)) {
        return `🔒 Não consegui abrir${citado}: pode ser privado, ter sido removido ou estar indisponível.\nConfira o link ou tente outro.`
    }
    return `❌ Não consegui ${acao}${citado}. Tente com o link direto ou outro nome.`
}

/**
 * Verifica se a saída indica binário ausente (ENOENT no spawn)
 * @param {object} err - Erro do evento 'error' do child_process
 * @returns {boolean}
 */
function isMissingBinary(err) {
    return err && (err.code === 'ENOENT' || /spawn .* ENOENT/i.test(err.message || ''))
}

module.exports = { lastErrorLines, toMessage, falaDeErro, isMissingBinary, MAX_DETAIL_LENGTH }
