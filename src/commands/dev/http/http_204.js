module.exports = {
    name: 'http_204',
    aliases: ["cmd_http_204","atalho_http_204","abrev_http_204"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 204 No Content',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 204 NO CONTENT* ═══════╗\n\n'
        txt += '📖 *Significado:* A requisição foi processada com sucesso, mas não retorna conteúdo.\n\n'
        txt += '💡 *Categoria:* ' + (204 < 300 ? 'Sucesso (2xx)' : 204 < 400 ? 'Redirecionamento (3xx)' : 204 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
