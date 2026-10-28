const mountService = require('../../../services/mountService')

module.exports = {
    name: 'estabulo_real',
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Catálogo de montarias e mascotes disponíveis para adoção no Reino',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const list = mountService.getAllAvailableMounts()
        let txt = '╔════════ 🐎 *ESTÁBULO REAL DE REINO* ════════╗\n\n'
        txt += 'Montarias conferem bônus de velocidade e companheirismo em missões.\n\n'

        for (const m of list) {
            txt += `🐴 *\${m.name}* (\${m.type})\n`
            txt += `   ├ Preço: \${m.cost.toLocaleString('pt-BR')} moedas\n`
            txt += `   ├ Bônus de Velocidade: +\${Math.round(m.speedBonus * 100)}%\n`
            txt += `   ├ Descrição: \${m.desc}\n`
            txt += `   └ Adotar: .adotar_montaria ${m.id}\n\n`
        }

        txt += '💡 Digite `.minhasmontarias` para ver as montarias do seu estábulo pessoal.'
        return reply(txt.trim())
    }
}
