module.exports = {
    name: 'http_500',
    aliases: ["cmd_http_500","atalho_http_500","abrev_http_500"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 500 Internal Server Error',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 500 INTERNAL SERVER ERROR* ═══════╗\n\n'
        txt += '📖 *Significado:* O servidor encontrou uma situação inesperada que o impediu de atender à solicitação.\n\n'
        txt += '💡 *Categoria:* ' + (500 < 300 ? 'Sucesso (2xx)' : 500 < 400 ? 'Redirecionamento (3xx)' : 500 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
