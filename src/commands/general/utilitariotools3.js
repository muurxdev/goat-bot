/**
 * Comando .validarip — Valida um endereço IPv4 ou IPv6 e mostra a classe
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools3`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "validarip",
    aliases: ["checarip","ipvalido"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Valida um endereço IPv4 ou IPv6 e mostra a classe",
    usage: "<endereço>",
    examples: ["192.168.0.1 — IP de rede local","8.8.8.8 — IP público"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const ip = (args[0] || '').trim()
    if (!ip) return reply(comoUsar(prefix, ''))
    const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const m = ip.match(v4)
    if (m) {
      const partes = m.slice(1).map(Number)
      if (partes.some(p => p > 255)) return reply(`❌ *${ip}* não é IPv4 válido — cada bloco vai de 0 a 255.`)
      const p0 = partes[0]
      const classe = p0 < 128 ? 'A' : p0 < 192 ? 'B' : p0 < 224 ? 'C' : p0 < 240 ? 'D (multicast)' : 'E (reservado)'
      const privado = p0 === 10 || (p0 === 172 && partes[1] >= 16 && partes[1] <= 31) || (p0 === 192 && partes[1] === 168) || p0 === 127
      return reply(`🌐 *IPv4 VÁLIDO*\n\n📍 *Endereço:* \`${ip}\`\n🏷️ *Classe:* ${classe}\n🔒 *Tipo:* ${privado ? 'privado / local' : 'público'}`)
    }
    if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':')) return reply(`🌐 *IPv6 VÁLIDO*\n\n📍 \`${ip}\``)
    return reply(`❌ *${ip}* não é um endereço IP válido.`)
        } catch (err) {
            logger.error(`[UTIL] .validarip falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}validarip\`.`)
        }
    }
};
