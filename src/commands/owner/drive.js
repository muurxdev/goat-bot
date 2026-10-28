/**
 * Comando .drive — status da integração com o Google Drive.
 *
 * Serve para responder rápido "por que o bot mandou como documento em vez de
 * link?": ou não está configurado, ou a conta encheu, ou o disco da VPS apertou.
 */

const drive = require('../../services/drive/googleDriveService')
const diskGuard = require('../../services/drive/diskGuard')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const tb = n => (Number(n) / 1024 ** 4).toFixed(2)
const gb = n => (Number(n) / 1024 ** 3).toFixed(1)

module.exports = {
    name: 'drive',
    aliases: ['gdrive', 'statusdrive'],
    category: 'owner',
    subcategory: 'Infraestrutura',
    description: 'Mostra o espaço no Google Drive, a pasta usada e o disco do servidor',
    usage: '[pasta | limpar]',
    examples: [
        ' — espaço usado no Drive e no disco do servidor',
        'pasta — link da pasta onde guardo os arquivos grandes',
        'limpar — apaga arquivos temporários com mais de 6 horas'
    ],
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply, text, prefix = '.' }) => {
        if (!drive.isConfigured()) {
            return reply(F.tela({
                prefix,
                emoji: '☁️',
                titulo: 'Google Drive desligado',
                intro: 'Sem ele, vídeos acima de ~16 MB só chegam comprimidos ou como documento.',
                secoes: [{
                    emoji: '🔧', titulo: 'Como ligar (no servidor)', linhas: [
                        '1️⃣ Rode `node scripts/google-drive-auth.js` com o ID e o segredo do app do Google',
                        '2️⃣ Rode `node scripts/google-drive-check.js` para testar',
                        '3️⃣ Copie as variáveis GDRIVE que ele mostrar para o arquivo de configuração e me reinicie'
                    ]
                }],
                dica: 'Não use conta de serviço: ela tem cota própria de 15 GB e não herda o espaço do seu plano.'
            }))
        }

        try {
            const pastaId = process.env.GDRIVE_FOLDER_ID
            const linkPasta = drive.obterLinkPasta(pastaId)

            if (/pasta|link|url|abrir/i.test(text || '')) {
                if (linkPasta) {
                    return reply(F.tela({
                        prefix,
                        emoji: '📁',
                        titulo: 'Pasta no Google Drive',
                        intro: `🔗 ${linkPasta}`,
                        dica: 'Downloads grandes e mídias que eu salvo ficam nesta pasta. Não compartilhe o link à toa.',
                        proximos: [{ nome: 'drive', oque: 'ver o espaço usado' }]
                    }))
                }
                return reply(F.tela({
                    prefix,
                    emoji: '📁',
                    titulo: 'Sem pasta definida',
                    intro: 'Não há pasta específica configurada: envio os arquivos para a pasta principal do Drive.',
                    proximos: [{ nome: 'drive', oque: 'ver o espaço usado' }]
                }))
            }

            const q = await drive.getQuota()
            const disco = await diskGuard.espacoLivre(tempDir)

            const linhasDrive = [F.campo('Conta', q.email || 'desconhecida')]
            if (q.limite === null) {
                linhasDrive.push(F.campo('Espaço', 'ilimitado'))
            } else {
                const usoFrac = q.usado / q.limite
                linhasDrive.push(F.campo('Usado', `${tb(q.usado)} TB de ${tb(q.limite)} TB`))
                linhasDrive.push(F.barra(usoFrac))
                linhasDrive.push(F.campo('Livre', `${tb(q.livre)} TB`))
            }
            linhasDrive.push(F.campo('Pasta', linkPasta ? 'definida (veja com .drive pasta)' : 'principal do Drive'))

            const linhasDisco = []
            let apertado = false
            if (disco) {
                const discoFrac = 1 - disco.livre / disco.total
                linhasDisco.push(F.barra(discoFrac))
                linhasDisco.push(F.campo('Livre', `${gb(disco.livre)} GB de ${gb(disco.total)} GB`))
                const maiorArquivo = (disco.livre - diskGuard.RESERVA_BYTES) / diskGuard.FATOR_MERGE
                if (maiorArquivo > 0) {
                    linhasDisco.push(F.campo('Maior download possível agora', `~${gb(maiorArquivo)} GB`))
                } else {
                    apertado = true
                    linhasDisco.push('⚠️ *Disco apertado:* downloads grandes serão recusados.')
                }
            }

            const linhasLimpeza = []
            const limpar = /limpar/i.test(text || '')
            if (limpar) {
                const r = await diskGuard.limparAntigos(tempDir)
                linhasLimpeza.push(F.campo('Arquivos apagados', r.removidos))
                linhasLimpeza.push(F.campo('Espaço liberado', `${gb(r.bytesLiberados)} GB`))
            }

            return reply(F.tela({
                prefix,
                emoji: '☁️',
                titulo: 'Google Drive e disco',
                intro: apertado
                    ? 'O Drive está ligado, mas o disco do servidor está apertado.'
                    : 'O Drive está ligado e funcionando.',
                secoes: [
                    { emoji: '☁️', titulo: 'Google Drive', linhas: linhasDrive },
                    { emoji: '🖥️', titulo: 'Disco do servidor', linhas: linhasDisco },
                    { emoji: '🧹', titulo: 'Limpeza feita', linhas: linhasLimpeza }
                ],
                proximos: [
                    limpar ? null : { nome: 'drive', args: 'limpar', oque: 'apagar temporários com mais de 6h' },
                    { nome: 'drive', args: 'pasta', oque: 'link da pasta no Drive' }
                ].filter(Boolean)
            }))
        } catch (e) {
            logger.error(`[DRIVE CMD] ${e.message}`)
            const revogado = /invalid_grant/i.test(String(e?.message || ''))
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui consultar o Drive',
                intro: revogado
                    ? 'O Google recusou meu acesso: a autorização foi revogada ou expirou.'
                    : 'O Google não respondeu como esperado. Tente de novo em instantes.',
                dica: revogado
                    ? 'Rode de novo node scripts/google-drive-auth.js no servidor e atualize a configuração.'
                    : 'O motivo detalhado ficou no log do dia.',
                proximos: [{ nome: 'drive', oque: 'tentar de novo' }]
            }))
        }
    }
}
