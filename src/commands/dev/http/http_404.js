module.exports = {
    name: 'http_404',
    aliases: ["cmd_http_404","atalho_http_404","abrev_http_404"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 404 Not Found',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 404 NOT FOUND* ═══════╗\n\n'
        txt += '📖 *Significado:* O servidor não encontrou o recurso solicitado.\n\n'
        txt += '💡 *Categoria:* ' + (404 < 300 ? 'Sucesso (2xx)' : 404 < 400 ? 'Redirecionamento (3xx)' : 404 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
