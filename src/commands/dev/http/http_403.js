module.exports = {
    name: 'http_403',
    aliases: ["cmd_http_403","atalho_http_403","abrev_http_403"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 403 Forbidden',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 403 FORBIDDEN* ═══════╗\n\n'
        txt += '📖 *Significado:* O cliente não tem direitos de acesso ao conteúdo.\n\n'
        txt += '💡 *Categoria:* ' + (403 < 300 ? 'Sucesso (2xx)' : 403 < 400 ? 'Redirecionamento (3xx)' : 403 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
