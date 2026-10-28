module.exports = {
    name: 'http_401',
    aliases: ["cmd_http_401","atalho_http_401","abrev_http_401"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 401 Unauthorized',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 401 UNAUTHORIZED* ═══════╗\n\n'
        txt += '📖 *Significado:* O cliente deve se autenticar para obter a resposta solicitada.\n\n'
        txt += '💡 *Categoria:* ' + (401 < 300 ? 'Sucesso (2xx)' : 401 < 400 ? 'Redirecionamento (3xx)' : 401 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
