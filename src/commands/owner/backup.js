/**
 * Comando .backup
 * Cria um snapshot consistente do SQLite a quente com metadados e envia para o Dono
 */

const fs = require('fs')
const path = require('path')
const { createBackup, BACKUP_DIR } = require('../../services/backupService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'backup',
    aliases: ['dump', 'bkp', 'snapshot'],
    category: 'owner',
    subcategory: 'Infraestrutura',
    description: 'Faz uma cópia de segurança dos meus dados e envia o arquivo aqui',
    examples: [' — gera a cópia agora, sem me desligar, e manda o arquivo no chat'],
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, client, reply, prefix = '.' }) => {
        try {
            await reply('📦 *Fazendo a cópia de segurança...*\n\nSigo funcionando enquanto isso. Em instantes mando o arquivo aqui.')
            const metadata = createBackup()

            const backupFilePath = path.join(BACKUP_DIR, metadata.filename)
            const dbBuffer = fs.readFileSync(backupFilePath)

            const caption = F.tela({
                prefix,
                emoji: '💾',
                titulo: 'Cópia de segurança pronta',
                intro: 'Guarde este arquivo em lugar seguro: com ele dá para voltar os dados a este momento.',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes', linhas: [
                        F.campo('Arquivo', '`' + metadata.filename + '`'),
                        F.campo('Tamanho', `${metadata.sizeKb} KB`),
                        F.campo('Usuários', metadata.stats.users),
                        F.campo('Horários marcados', metadata.stats.schedules),
                        F.campo('Feita em', new Date(metadata.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
                    ]
                }],
                dica: 'Guardo só as 7 cópias mais recentes no servidor.',
                proximos: [
                    { nome: 'backuplist', oque: 'ver as cópias guardadas' },
                    { nome: 'backuprestore', args: metadata.filename, oque: 'voltar para esta cópia' }
                ]
            })

            await client.sendMessage(from, {
                document: dbBuffer,
                fileName: metadata.filename,
                mimetype: 'application/x-sqlite3',
                caption
            })
        } catch (err) {
            logger.error('[BACKUP COMMAND ERROR]', err)
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui fazer a cópia',
                intro: 'Algo falhou ao gerar ou enviar o arquivo. Os dados atuais não foram alterados.',
                dica: 'O motivo detalhado ficou no log do dia. Costuma ser falta de espaço em disco.',
                proximos: [
                    { nome: 'backup', oque: 'tentar de novo' },
                    { nome: 'drive', oque: 'ver o espaço livre no servidor' }
                ]
            }))
        }
    }
}
