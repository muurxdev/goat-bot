/**
 * Comando .backuplist
 * Lista todos os snapshots de backup disponíveis localmente
 */

const { listBackups } = require('../../services/backupService')

module.exports = {
    name: 'backuplist',
    aliases: ['snapshots', 'bkplist', 'listbackups'],
    category: 'owner',
    description: 'Lista todos os snapshots de backup salvos no servidor',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const backups = listBackups()

        if (backups.length === 0) {
            return reply('📂 *Nenhum snapshot de backup encontrado.* Use `.backup` para criar um.')
        }

        let msg = `💾 *SNAPSHOTS DE BACKUP DISPONÍVEIS (${backups.length})*\n\n`
        backups.forEach((b, idx) => {
            const users = b.metadata?.stats?.users !== undefined ? `(${b.metadata.stats.users} usuários)` : ''
            msg += `${idx + 1}. \`${b.filename}\`\n   📦 ${b.sizeKb} KB ${users} | 📅 ${new Date(b.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n`
        })

        msg += `💡 *Para restaurar um backup:* \`.backuprestore <nome_do_arquivo>\``

        await reply(msg.trim())
    }
}

