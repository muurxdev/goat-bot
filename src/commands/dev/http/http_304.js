module.exports = {
    name: 'http_304',
    aliases: ["cmd_http_304","atalho_http_304","abrev_http_304"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 304 Not Modified',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 304 NOT MODIFIED* ═══════╗\n\n'
        txt += '📖 *Significado:* O recurso não foi modificado desde a última requisição (usado em cache).\n\n'
        txt += '💡 *Categoria:* ' + (304 < 300 ? 'Sucesso (2xx)' : 304 < 400 ? 'Redirecionamento (3xx)' : 304 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
