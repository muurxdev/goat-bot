/**
 * Comando .shutdown
 * Encerra o processo do bot de forma graciosa e segura
 */

const { closeDatabase } = require('../../database/connection')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'shutdown',
    aliases: [ 'stop', 'pararbot'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Me desliga com segurança, salvando tudo antes de sair',
    examples: [' — desligo agora; só volto quando o servidor me iniciar de novo'],
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        await reply(
            '🛑 *Desligando agora*\n\n' +
            'Vou fechar a conexão com o WhatsApp, salvar os dados e sair com segurança.\n\n' +
            '💡 _Só volto quando o servidor me iniciar de novo. Para só pausar os comandos, use_ `.botclose indefinite`.'
        )

        logger.info('[SHUTDOWN] Comando .shutdown executado pelo Dono. Encerrando processo...')

        setTimeout(async () => {
            try {
                const { closeBot } = require('../../core/connection')
                await closeBot()
            } catch (e) {
                logger.warn(`[SHUTDOWN] Falha ao fechar a conexão do WhatsApp: ${e.message}`)
            }

            try {
                closeDatabase()
            } catch (e) {
                logger.warn(`[SHUTDOWN] Falha ao fechar o banco de dados: ${e.message}`)
            }

            logger.info(`👋 ${getBotName()} desligado com sucesso.`)
            process.exit(0)
        }, 1500)
    }
}
