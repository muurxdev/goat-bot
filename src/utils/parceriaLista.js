/**
 * Lista de parceiros de um grupo. Cada parceiro aparece com @ (a menção faz o WhatsApp
 * mostrar o nome). A parceria não expira: só sai com `.parceria del`.
 */

const numeroDoJid = (jid) => String(jid || '').split('@')[0].split(':')[0];

function textoListaParceiros(allowed = [], prefixo = '.') {
    if (allowed.length === 0) {
        return { texto: '🤝 Nenhum parceiro cadastrado no momento.', mentions: [] };
    }
    const linhas = allowed.map((j, i) => `${i + 1}. @${numeroDoJid(j)} ✅ Parceria permanente`);
    const texto = `🤝 *PARCEIROS ATIVOS (${allowed.length})*\n\n${linhas.join('\n')}\n\n📌 Vale até um admin remover com \`${prefixo}parceria del @user\`.`;
    return { texto, mentions: allowed };
}

module.exports = { textoListaParceiros, numeroDoJid };
