/**
 * Comando .numeroextenso — Escreve um número por extenso em português
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools36`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "numeroextenso",
    aliases: ["porextenso","extenso"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Escreve um número por extenso em português",
    usage: "<número>",
    examples: ["1234 — mil duzentos e trinta e quatro"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const n=parseInt(String(args[0]||'').replace(/\D/g,''),10)
    if(!Number.isFinite(n)) return reply(comoUsar(prefix, ''))
    if(n>999999) return reply('❌ Suporta até 999.999.')
    const un=['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove']
    const dz=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa']
    const ct=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos']
    const ate999=v=>{ if(v===0)return''; if(v===100)return'cem'; let p=[]
      const c=Math.floor(v/100), r=v%100
      if(c)p.push(ct[c]); if(r<20&&r)p.push(un[r]); else if(r>=20){const d=Math.floor(r/10),u2=r%10;p.push(dz[d]+(u2?' e '+un[u2]:''))}
      return p.join(' e ') }
    if(n===0) return reply('🔤 *zero*')
    const mil=Math.floor(n/1000), res=n%1000
    let out=''
    if(mil) out+=(mil===1?'mil':ate999(mil)+' mil')
    if(res) out+=(out?(res<100?' e ':' '):'')+ate999(res)
    return reply(`🔤 *POR EXTENSO*\n\n📥 ${n.toLocaleString('pt-BR')}\n📤 *${out}*`)
        } catch (err) {
            logger.error(`[UTIL] .numeroextenso falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}numeroextenso\`.`)
        }
    }
};
