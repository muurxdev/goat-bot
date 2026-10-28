module.exports = {
    name: 'http_429',
    aliases: ["cmd_http_429","atalho_http_429","abrev_http_429"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 429 Too Many Requests',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 429 TOO MANY REQUESTS* ═══════╗\n\n'
        txt += '📖 *Significado:* O usuário enviou muitas requisições em um dado período de tempo (Rate Limit).\n\n'
        txt += '💡 *Categoria:* ' + (429 < 300 ? 'Sucesso (2xx)' : 429 < 400 ? 'Redirecionamento (3xx)' : 429 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
