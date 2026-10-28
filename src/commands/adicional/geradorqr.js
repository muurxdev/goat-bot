/**
 * Comando .geradorqr / .qrcode
 * Gera QR Code instantâneo em alta definição a partir de qualquer texto ou link
 */
const F = require('../../utils/formato');

module.exports = {
    name: 'geradorqr',
    aliases: ["criarqr","makeqr","gerarqrcode","cmd_geradorqr","alt_geradorqr","atalho_geradorqr","abrev_geradorqr","call_geradorqr","func_geradorqr"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Gera um QR Code nítido para links, chaves Pix ou textos',
    usage: '<link, texto ou chave Pix>',
    examples: ['https://exemplo.com — QR de um link', 'email@exemplo.com — QR de uma chave Pix'],
    cooldownMs: 3000,
    execute: async ({ reply, client, from, args, prefix = '.' }) => {
        const text = args.join(' ').trim();
        if (!text) {
            return reply(F.tela({
                emoji: '📱', titulo: 'Gerador de QR Code', prefix,
                intro: 'Mande um link, um texto ou uma chave Pix e eu devolvo a imagem do QR Code pronta para escanear ou imprimir.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'geradorqr', '<link, texto ou chave Pix>')] }],
                dica: 'Teste o QR Code com a câmera do celular antes de imprimir ou divulgar.',
                proximos: [
                    { nome: 'geradorqr', args: 'https://chat.whatsapp.com/seu-convite', oque: 'QR do convite do grupo' },
                    { nome: 'geradorqr', args: 'email@exemplo.com', oque: 'QR de uma chave Pix' }
                ]
            }));
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}&margin=10`;

        try {
            const res = await fetch(qrUrl);
            if (!res.ok) throw new Error('Falha na API de QR Code');
            const buffer = Buffer.from(await res.arrayBuffer());

            let caption = `╔══════════════════════════════╗\n`;
            caption += `║      📱 *QR CODE GERADO* 📱      ║\n`;
            caption += `╚══════════════════════════════╝\n\n`;
            caption += `📝 *Conteúdo:* \`${text.slice(0, 100)}\`\n`;
            caption += `📐 *Resolução:* 512x512 px\n`;
            caption += `✨ Aponte a câmera do celular para escanear!`;

            await client.sendMessage(from, { image: buffer, caption: caption.trim() });
        } catch (err) {
            require('../../core/logger').warn(`[GERADORQR] Falha ao gerar QR: ${err.message}`);
            return reply('❌ Não consegui gerar o QR Code agora. Tente de novo em instantes.');
        }
    }
};