/**
 * Utilitários de Figurinha (Sticker Utils)
 * Injeção de metadados EXIF em arquivos WebP para figurinhas do WhatsApp
 */

const webp = require('node-webpmux')
const logger = require('../core/logger')
const { getBotName } = require('../config/botConfig')

/**
 * Adiciona metadados de pacote e autor ao buffer de figurinha WebP
 * @param {Buffer} webpBuffer - Buffer da figurinha em formato WebP
 * @param {string} packname - Nome do pacote
 * @param {string} author - Autor da figurinha
 * @returns {Promise<Buffer>} Buffer WebP com EXIF injetado
 */
async function addExif(webpBuffer, packname, author) {
    if (!packname) packname = getBotName()
    if (!author) author = getBotName()
    try {
        const img = new webp.Image()
        await img.load(webpBuffer)

        const json = {
            'sticker-pack-id': 'com.goat.bot.xp',
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
            'emojis': ['🐐', '⚽', '👑']
        }

        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ])

        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
        const exif = Buffer.concat([exifAttr, jsonBuffer])
        exif.writeUIntLE(jsonBuffer.length, 14, 4)

        img.exif = exif
        return await img.save(null)
    } catch (err) {
        logger.warn('Aviso: Falha ao injetar metadados EXIF na figurinha:', err.message)
        return webpBuffer
    }
}

module.exports = {
    addExif
}

