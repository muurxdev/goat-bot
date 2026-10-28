/**
 * Testes Unitários: Comando .revelar / View Once Reveal
 * Revela e reenvia mídias de visualização única (foto, vídeo, áudio)
 */

const assert = require('assert');
const revelarCmd = require('../src/commands/media/revelar');
const mediaService = require('../src/services/mediaService');

describe('🔓 Comando .revelar / View Once Reveal', () => {
    const testGroup = '120363000000000001@g.us';
    const testSender = '5511999990001@s.whatsapp.net';
    const targetUser = '5511888880002@s.whatsapp.net';

    let originalDownload = null;

    before(() => {
        originalDownload = mediaService.downloadWhatsAppMedia;
    });

    after(() => {
        mediaService.downloadWhatsAppMedia = originalDownload;
    });

    it('1. Deve exibir painel de ajuda se não houver mídia citada ou enviada', async () => {
        let sentReply = '';
        const reply = (msg) => { sentReply = msg; };

        await revelarCmd.execute({
            from: testGroup,
            reply,
            client: {},
            info: { key: { remoteJid: testGroup } },
            quotedMsg: null,
            args: [],
            sender: testSender
        });

        assert.ok(sentReply.includes('REVELAR VISUALIZAÇÃO ÚNICA'), 'Deve conter cabeçalho de ajuda');
        assert.ok(sentReply.includes('.revelar'), 'Deve conter instruções de uso');
    });

    it('2. Deve revelar foto de visualização única e reenviar com proteção removida', async () => {
        const dummyBuffer = Buffer.from('FAKE_IMAGE_BUFFER');
        mediaService.downloadWhatsAppMedia = async () => dummyBuffer;

        const sentList = [];
        const mockClient = {
            sendMessage: async (chat, payload) => {
                sentList.push({ chat, payload });
                return { key: { id: 'IMG_SENT_1' } };
            }
        };

        const viewOnceImageInfo = {
            key: { remoteJid: testGroup, id: 'CMD_MSG_1' },
            message: {
                extendedTextMessage: {
                    text: '.revelar',
                    contextInfo: {
                        participant: targetUser,
                        quotedMessage: {
                            viewOnceMessage: {
                                message: {
                                    imageMessage: {
                                        caption: 'Foto secreta!',
                                        viewOnce: true,
                                        mimetype: 'image/jpeg'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const quoted = viewOnceImageInfo.message.extendedTextMessage.contextInfo.quotedMessage;

        await revelarCmd.execute({
            from: testGroup,
            reply: (msg) => {},
            client: mockClient,
            info: viewOnceImageInfo,
            quotedMsg: quoted,
            args: [],
            sender: testSender
        });

        const imgMsg = sentList.find(m => m.payload?.image);
        assert.ok(imgMsg, 'Deveria ter reenviado a imagem');
        assert.strictEqual(imgMsg.chat, testGroup);
        assert.strictEqual(imgMsg.payload.image, dummyBuffer);
        assert.ok(imgMsg.payload.caption.includes('MÍDIA REVELADA (VO)'));
        assert.ok(imgMsg.payload.caption.includes('Foto secreta!'));
        assert.ok(imgMsg.payload.mentions.includes(targetUser));
    });

    it('3. Deve revelar vídeo de visualização única (viewOnceMessageV2)', async () => {
        const dummyBuffer = Buffer.from('FAKE_VIDEO_BUFFER');
        mediaService.downloadWhatsAppMedia = async () => dummyBuffer;

        const sentList = [];
        const mockClient = {
            sendMessage: async (chat, payload) => {
                sentList.push({ chat, payload });
                return { key: { id: 'VID_SENT_1' } };
            }
        };

        const viewOnceVideoInfo = {
            key: { remoteJid: testGroup, id: 'CMD_MSG_2' },
            message: {
                extendedTextMessage: {
                    text: '.vo',
                    contextInfo: {
                        participant: targetUser,
                        quotedMessage: {
                            viewOnceMessageV2: {
                                message: {
                                    videoMessage: {
                                        caption: 'Vídeo temporário!',
                                        viewOnce: true,
                                        mimetype: 'video/mp4'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const quoted = viewOnceVideoInfo.message.extendedTextMessage.contextInfo.quotedMessage;

        await revelarCmd.execute({
            from: testGroup,
            reply: (msg) => {},
            client: mockClient,
            info: viewOnceVideoInfo,
            quotedMsg: quoted,
            args: [],
            sender: testSender
        });

        const vidMsg = sentList.find(m => m.payload?.video);
        assert.ok(vidMsg, 'Deveria ter reenviado o vídeo');
        assert.strictEqual(vidMsg.chat, testGroup);
        assert.strictEqual(vidMsg.payload.video, dummyBuffer);
        assert.strictEqual(vidMsg.payload.mimetype, 'video/mp4');
        assert.ok(vidMsg.payload.caption.includes('MÍDIA REVELADA (VO)'));
        assert.ok(vidMsg.payload.caption.includes('Vídeo temporário!'));
    });

    it('4. Deve revelar áudio de visualização única (viewOnceMessageV2Extension)', async () => {
        const dummyBuffer = Buffer.from('FAKE_AUDIO_BUFFER');
        mediaService.downloadWhatsAppMedia = async () => dummyBuffer;

        const sentList = [];
        const mockClient = {
            sendMessage: async (chat, payload) => {
                sentList.push({ chat, payload });
                return { key: { id: 'AUD_SENT_1' } };
            }
        };

        const viewOnceAudioInfo = {
            key: { remoteJid: testGroup, id: 'CMD_MSG_3' },
            message: {
                extendedTextMessage: {
                    text: '.revelar',
                    contextInfo: {
                        participant: targetUser,
                        quotedMessage: {
                            viewOnceMessageV2Extension: {
                                message: {
                                    audioMessage: {
                                        viewOnce: true,
                                        mimetype: 'audio/ogg; codecs=opus',
                                        ptt: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const quoted = viewOnceAudioInfo.message.extendedTextMessage.contextInfo.quotedMessage;

        await revelarCmd.execute({
            from: testGroup,
            reply: (msg) => {},
            client: mockClient,
            info: viewOnceAudioInfo,
            quotedMsg: quoted,
            args: [],
            sender: testSender
        });

        const audioMsg = sentList.find(m => m.payload?.audio);
        assert.ok(audioMsg, 'Deveria ter enviado o áudio');
        assert.strictEqual(audioMsg.payload.audio, dummyBuffer);
        assert.strictEqual(audioMsg.payload.ptt, true);

        const confirmMsg = sentList.find(m => m.payload?.text && m.payload.text.includes('MÍDIA REVELADA (VO)'));
        assert.ok(confirmMsg, 'Deveria ter enviado a confirmação');
        assert.ok(confirmMsg.payload.text.includes('Áudio / Voz'));
    });

    it('5. Deve suportar redirecionar para o privado com argumento "pv"', async () => {
        const dummyBuffer = Buffer.from('FAKE_PV_BUFFER');
        mediaService.downloadWhatsAppMedia = async () => dummyBuffer;

        const sentList = [];
        let replyText = '';
        const mockClient = {
            sendMessage: async (chat, payload) => {
                sentList.push({ chat, payload });
                return { key: { id: 'PV_SENT_1' } };
            }
        };

        const viewOnceImageInfo = {
            key: { remoteJid: testGroup, id: 'CMD_MSG_4' },
            message: {
                extendedTextMessage: {
                    text: '.revelar pv',
                    contextInfo: {
                        participant: targetUser,
                        quotedMessage: {
                            viewOnceMessage: {
                                message: {
                                    imageMessage: {
                                        viewOnce: true,
                                        mimetype: 'image/jpeg'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const quoted = viewOnceImageInfo.message.extendedTextMessage.contextInfo.quotedMessage;

        await revelarCmd.execute({
            from: testGroup,
            reply: (msg) => { replyText = msg; },
            client: mockClient,
            info: viewOnceImageInfo,
            quotedMsg: quoted,
            args: ['pv'],
            sender: testSender
        });

        const pvImg = sentList.find(m => m.payload?.image);
        assert.ok(pvImg, 'Deveria ter enviado a imagem no privado');
        assert.strictEqual(pvImg.chat, testSender, 'O destino deve ser o PV do solicitante');
        assert.ok(replyText.includes('privado (DM)'), 'Deve avisar no grupo que enviou no PV');
    });
});
