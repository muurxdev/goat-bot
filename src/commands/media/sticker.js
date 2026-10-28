/**
 * Comando .sticker — mesmo motor do .fig.
 *
 * Antes tinha motor próprio e quebrado: mandava PNG (não WebP) cortando as bordas,
 * sem nome de pacote, e para vídeo só reenviava o vídeo como GIF no privado.
 * Agora delega ao .fig, que usa criarFigurinha (transparência, peso controlado).
 */

const fig = require('./fig')

module.exports = {
    name: 'sticker',
    aliases: ['tofig', 'criarfig', 'stickermaker'],
    category: 'media',
    subcategory: 'Imagens & Edição',
    description: 'Cria figurinhas a partir de imagens ou vídeos curtos (o mesmo que .fig)',
    cooldownMs: 3000,
    examples: [' — mande na legenda de uma foto ou responda a uma imagem ou vídeo curto'],
    execute: async (context) => fig.execute(context)
}
