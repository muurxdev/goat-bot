module.exports = {
    name: 'http_301',
    aliases: ["cmd_http_301","atalho_http_301","abrev_http_301"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 301 Moved Permanently',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 301 MOVED PERMANENTLY* ═══════╗\n\n'
        txt += '📖 *Significado:* O recurso solicitado foi movido permanentemente para uma nova URI.\n\n'
        txt += '💡 *Categoria:* ' + (301 < 300 ? 'Sucesso (2xx)' : 301 < 400 ? 'Redirecionamento (3xx)' : 301 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
