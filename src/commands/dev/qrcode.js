/**
 * Comando .qrcode / .qr / .gerarqr
 * Gerador de imagem de QR Code HD a partir de texto, PIX ou link informado
 */

const { gerarQrCodeUrl } = require('../../services/apiService');
const { renderCard } = require('../../utils/uiEngine');

module.exports = {
    name: 'qrcode',
    aliases: ["qr","gerarqr","cmd_qrcode","alt_qrcode","atalho_qrcode","abrev_qrcode","call_qrcode","func_qrcode"],
    category: 'dev',
    description: 'Gera uma imagem de QR Code legível a partir de um texto, PIX ou link informado',
    cooldownMs: 2000,
    execute: async ({ text, reply, client, from, info, sender }) => {
        if (!text || !text.trim()) {
            return reply('❌ Informe o texto ou URL para gerar o QR Code.\n\n📌 *Exemplo:* `.qrcode https://google.com` ou `.qrcode ChavePix123`');
        }

        const qrUrl = gerarQrCodeUrl(text.trim(), 600);

        const caption = renderCard({
            title: 'QR CODE GERADO',
            icon: '📱',
            sections: [
                {
                    title: 'DADOS CODIFICADOS',
                    icon: '📝',
                    fields: [
                        `\`${text.slice(0, 150)}${text.length > 150 ? '...' : ''}\``
                    ]
                }
            ],
            tip: 'Aponte a câmera do seu smartphone para escanear a imagem!',
            mentions: [sender]
        });

        try {
            await client.sendMessage(from, {
                image: { url: qrUrl },
                caption: caption
            }, { quoted: info });
        } catch (err) {
            await reply(`❌ Falha ao renderizar imagem do QR Code. Link direto: ${qrUrl}`);
        }
    }
};
