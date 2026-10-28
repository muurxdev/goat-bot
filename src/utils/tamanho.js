/**
 * Tamanho de arquivo como o usuário vê — fonte única.
 *
 * Por que decimal (1 MB = 1.000.000 bytes): é a conta do WhatsApp, do Android,
 * do iOS e do macOS. O bot dividia por 1024×1024 e escrevia "MB", então um vídeo
 * de 110 MB aparecia como "104.9 MB" na lista e o arquivo recebido mostrava 110.
 * Mesma causa do "card diz 61 MB e chega 65 MB" do .livro.
 *
 * Limites internos (ex.: 100 * 1024 * 1024) podem continuar binários; só o
 * TEXTO que sai para o usuário passa por aqui.
 */

const KB = 1000
const MB = KB * 1000
const GB = MB * 1000

function numero(valor, casas) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

/**
 * 1536 → "1,5 KB" · 109_960_000 → "110,0 MB" · 2_500_000_000 → "2,50 GB"
 * @param {number} bytes
 * @returns {string} vazio se o valor não for um número válido
 */
function formatarTamanho(bytes) {
    const n = Number(bytes)
    if (!Number.isFinite(n) || n < 0) return ''
    if (n < KB) return `${Math.round(n)} B`
    if (n < MB) return `${numero(n / KB, 1)} KB`
    if (n < GB) return `${numero(n / MB, 1)} MB`
    return `${numero(n / GB, 2)} GB`
}

/** Megabytes decimais com 1 casa, sem unidade: 109_960_000 → "110,0" */
function emMb(bytes) {
    const n = Number(bytes)
    return Number.isFinite(n) ? numero(n / MB, 1) : ''
}

module.exports = { formatarTamanho, emMb, KB, MB, GB }
