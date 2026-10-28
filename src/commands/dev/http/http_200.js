module.exports = {
    name: 'http_200',
    aliases: ["cmd_http_200","atalho_http_200","abrev_http_200"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 200 OK',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 200 OK* ═══════╗\n\n'
        txt += '📖 *Significado:* A requisição foi bem-sucedida.\n\n'
        txt += '💡 *Categoria:* ' + (200 < 300 ? 'Sucesso (2xx)' : 200 < 400 ? 'Redirecionamento (3xx)' : 200 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
