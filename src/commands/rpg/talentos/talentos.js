const talentService = require('../../../services/talentService')

module.exports = {
    name: 'talentos',
    category: 'rpg',
    subcategory: 'Habilidades',
    description: 'Abre a árvore de talentos e habilidades da sua classe de RPG',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const t = talentService.getTalents(sender)
        const tree = talentService.TALENT_TREES[t.tree_type]

        let txt = `╔════════ ⭐ *ÁRVORE DE TALENTOS: \${tree.name.toUpperCase()}* ════════╗\n\n`
        txt += `📖 \${tree.desc}\n\n`
        txt += `✨ *Pontos de Talento Disponíveis:* \${t.talent_points} pts\n\n`
        txt += '╭━〔 ⚔️ HABILIDADES & RAMIFICAÇÕES 〕━⬣\n'

        for (const [sId, s] of Object.entries(tree.skills)) {
            const current = t.skillsAllocated[sId] || 0
            const filled = '█'.repeat(current) + '░'.repeat(s.max - current)
            txt += `┃ 🔹 *\${s.name}* (\${sId})\n`
            txt += `┃    ├ Nível: [\${filled}] \${current}/\${s.max}\n`
            txt += `┃    └ Efeito: \${s.desc}\n`
        }
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        txt += '💡 *Ações:*\n'
        txt += '├ Aprender: `.evoluirtalento <habilidade>`\n'
        txt += '├ Trocar Classe: `.trocararvore <classe>`\n'
        txt += '└ Resetar Pontos: `.resetartalentos`'
        return reply(txt.trim())
    }
}
