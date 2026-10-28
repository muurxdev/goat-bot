/**
 * generate_fase3_commands.js
 * Gerador e compilador dos comandos da Fase 3 de RPG (+1.000 comandos).
 * Clãs e Territórios, Árvores de Talentos, Forja/Alquimia, Raids Comunitárias e Montarias.
 */

const fs = require('fs')
const path = require('path')

const RPG_DIR = path.resolve(__dirname, '../src/commands/rpg')
const clanService = require('../src/services/clanService')
const existingNames = new Set()
const existingAliases = new Set()

function scanExisting(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name)
        if (ent.isDirectory()) scanExisting(full)
        else if (ent.name.endsWith('.js')) {
            try {
                const mod = require(full)
                if (mod.name) existingNames.add(mod.name.toLowerCase())
                if (Array.isArray(mod.aliases)) {
                    for (const a of mod.aliases) existingAliases.add(String(a).toLowerCase())
                }
            } catch (e) {}
        }
    }
}
scanExisting(path.resolve(__dirname, '../src/commands'))

console.log(`Nomes existentes antes da Fase 3: ${existingNames.size}, Aliases: ${existingAliases.size}`)

function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

const folders = {
    clas: path.join(RPG_DIR, 'clas'),
    talentos: path.join(RPG_DIR, 'talentos'),
    forja: path.join(RPG_DIR, 'forja'),
    raids: path.join(RPG_DIR, 'raids'),
    montarias: path.join(RPG_DIR, 'montarias')
}
Object.values(folders).forEach(ensureDir)

let createdCount = 0

function safeWrite(filePath, content, cmdName) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8')
    existingNames.add(cmdName.toLowerCase())
    createdCount++
    return true
}

// -------------------------------------------------------------
// 1. SISTEMA DE CLÃS & TERRITÓRIOS (Core + Territórios)
// -------------------------------------------------------------
safeWrite(path.join(folders.clas, 'criarcla.js'), `
const clanService = require('../../../services/clanService')

module.exports = {
    name: 'criarcla',
    category: 'rpg',
    subcategory: 'Clãs & Guildas',
    description: 'Funda um novo Clã de aventureiros no Reino: .criarcla <nome do clã>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: \`.criarcla <nome do clã>\`\\nExemplo: \`.criarcla Cavaleiros Central\`')
        const name = args.join(' ')
        const res = clanService.createClan(sender, name)
        if (!res.success) return reply(res.message)

        let txt = '🛡️ *PARABÉNS! SEU CLÃ FOI FUNDADO COM HONRA!*\\n\\n'
        txt += \`⚔️ *Nome do Clã:* \\\${res.clanName}\\n\`
        txt += \`💰 *Custo Pago:* \\\${res.cost.toLocaleString('pt-BR')} moedas\\n\`
        txt += \`🏦 *Saldo Restante:* \\\${res.newBalance.toLocaleString('pt-BR')} moedas\\n\\n\`
        txt += '💡 Digite \`.meucla\` para abrir o painel da guilda e \`.territorios\` para disputar terras.'
        return reply(txt.trim())
    }
}
`, 'criarcla')

safeWrite(path.join(folders.clas, 'meucla.js'), `
const clanService = require('../../../services/clanService')

module.exports = {
    name: 'meucla',
    category: 'rpg',
    subcategory: 'Clãs & Guildas',
    description: 'Exibe os dados, membros e cofre do seu clã',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const clan = clanService.getUserClan(sender)
        if (!clan) return reply('Você não pertence a nenhum clã. Crie um com \`.criarcla <nome>\`!')

        const buff = clanService.getClanTerritoryBuff(sender)
        let txt = \`╔═══════ 🛡️ *CLÃ: \\\${clan.nome.toUpperCase()}* ═══════╗\\n\\n\`
        txt += \`👑 *Líder:* \\\${clan.isOwner ? 'Você' : 'Cavaleiro Sagrado'}\\n\`
        txt += \`⭐ *Nível do Clã:* Nível \\\${clan.level}\\n\`
        txt += \`👥 *Membros Alistados:* \\\${clan.membros.length} guerreiros\\n\`
        txt += \`💰 *Cofre do Clã:* \\\${(clan.coins || 0).toLocaleString('pt-BR')} moedas\\n\`
        txt += \`📈 *XP do Clã:* \\\${(clan.xp || 0).toLocaleString('pt-BR')} XP\\n\\n\`
        txt += '╭━〔 🏰 BÔNUS DE TERRITÓRIOS CONQUISTADOS 〕━⬣\\n'
        txt += \`┃ 🌍 Territórios Ocupados: \\\${buff.territoriesCount}\\n\`
        txt += \`┃ ⚡ Bônus de XP: +\\\${Math.round(buff.bonusXp * 100)}% em batalhas\\n\`
        txt += \`┃ 🪙 Bônus de Moedas: +\\\${Math.round(buff.bonusCoins * 100)}% em drops\\n\`
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\\n\\n'
        txt += '💡 Doe moedas para subir o nível do clã: \`.doarcla <valor>\`.'
        return reply(txt.trim())
    }
}
`, 'meucla')

safeWrite(path.join(folders.clas, 'doarcla.js'), `
const clanService = require('../../../services/clanService')

module.exports = {
    name: 'doarcla',
    category: 'rpg',
    subcategory: 'Clãs & Guildas',
    description: 'Doe moedas ao cofre do clã para aumentar o nível e poder militar: .doarcla <valor>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso: \`.doarcla <valor>\`\\nExemplo: \`.doarcla 1000\`')
        const amount = parseInt(args[0], 10)
        const res = clanService.donateToVault(sender, amount)
        if (!res.success) return reply(res.message)

        let txt = '🪙 *DOAÇÃO AO COFRE DO CLÃ CONFIRMADA!*\\n\\n'
        txt += \`🛡️ *Clã:* \\\${res.clanName}\\n\`
        txt += \`💰 *Valor Doado:* \\\${res.donated.toLocaleString('pt-BR')} moedas (+1 XP por moeda)\\n\`
        txt += \`🏛️ *Novo Saldo do Cofre:* \\\${res.newVaultCoins.toLocaleString('pt-BR')} moedas\\n\`
        txt += \`⭐ *Nível Atual do Clã:* Nível \\\${res.clanLevel}\\n\`
        txt += \`👛 *Seu Saldo Restante:* \\\${res.userBalance.toLocaleString('pt-BR')} moedas\`
        return reply(txt.trim())
    }
}
`, 'doarcla')

safeWrite(path.join(folders.clas, 'territorios.js'), `
const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorios',
    category: 'rpg',
    subcategory: 'Guerras Territoriais',
    description: 'Lista os territórios de Reino disputados pelos clãs',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const list = clanService.getTerritories()
        let txt = '╔════════ 🏰 *TERRITÓRIOS DE REINO* ════════╗\\n\\n'
        txt += 'Clãs que dominam territórios recebem bônus passivos de XP e moedas.\\n\\n'

        for (const t of list) {
            const dono = t.clanName ? \`🛡️ *\\\${t.clanName}*\` : '⚪ *Livre / Neutro*'
            txt += \`📍 *\\\${t.name}* (\\\${t.id})\\n\`
            txt += \`   ├ Domínio: \\\${dono}\\n\`
            txt += \`   ├ Bônus: +\\\${Math.round(t.bonusXp * 100)}% XP | +\\\${Math.round(t.bonusCoins * 100)}% Moedas\\n\`
            txt += \`   └ Conquistar: .conquistar \${t.id}\\n\\n\`
        }

        txt += '💡 Guerras de conquista exigem que o clã tenha fundos no cofre (\`.doarcla\`).'
        return reply(txt.trim())
    }
}
`, 'territorios')

safeWrite(path.join(folders.clas, 'conquistar.js'), `
const clanService = require('../../../services/clanService')

module.exports = {
    name: 'conquistar',
    category: 'rpg',
    subcategory: 'Guerras Territoriais',
    description: 'Ordena ataque de conquista a um território de Reino: .conquistar <id>',
    cooldownMs: 4000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: \`.conquistar <id do território>\`\\nConsulte os IDs com \`.territorios\`.')
        const res = clanService.captureTerritory(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '⚔️ *VITÓRIA NA GUERRA DE CONQUISTA!*\\n\\n'
        txt += \`🏰 *Território Ocupado:* \\\${res.territoryName}\\n\`
        txt += \`🛡️ *Novo Senhor Feudal:* Clã \\\${res.clanName}\\n\`
        txt += \`⚡ *Bônus Ativo para o Clã:* +\\\${res.bonusXp}% XP e +\\\${res.bonusCoins}% Moedas\\n\\n\`
        txt += '💡 O brasão do seu clã agora tremula nas muralhas da fortaleza!'
        return reply(txt.trim())
    }
}
`, 'conquistar')

// Comandos de territórios individuais
for (const t of clanService.TERRITORIES) {
    const tCmd = `territorio_${t.id}`
    safeWrite(path.join(folders.clas, `${tCmd}.js`), `
const clanService = require('../../../services/clanService')

module.exports = {
    name: '${tCmd}',
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de ${t.name}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: ${t.name.toUpperCase()}* ═══════╗\\n\\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* ${t.defensePower} soldados\\n'
        txt += '⚡ *Multiplicador de XP:* +${Math.round(t.bonusXp * 100)}%\\n'
        txt += '🪙 *Multiplicador de Moedas:* +${Math.round(t.bonusCoins * 100)}%\\n\\n'
        txt += 'Para conquistar com seu clã: \`.conquistar ${t.id}\`'
        return reply(txt.trim())
    }
}
`, tCmd)
}

// -------------------------------------------------------------
// 2. ÁRVORES DE TALENTOS & HABILIDADES (Core + Habilidades)
// -------------------------------------------------------------
const talentService = require('../src/services/talentService')

safeWrite(path.join(folders.talentos, 'talentos.js'), `
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

        let txt = \`╔════════ ⭐ *ÁRVORE DE TALENTOS: \\\${tree.name.toUpperCase()}* ════════╗\\n\\n\`
        txt += \`📖 \\\${tree.desc}\\n\\n\`
        txt += \`✨ *Pontos de Talento Disponíveis:* \\\${t.talent_points} pts\\n\\n\`
        txt += '╭━〔 ⚔️ HABILIDADES & RAMIFICAÇÕES 〕━⬣\\n'

        for (const [sId, s] of Object.entries(tree.skills)) {
            const current = t.skillsAllocated[sId] || 0
            const filled = '█'.repeat(current) + '░'.repeat(s.max - current)
            txt += \`┃ 🔹 *\\\${s.name}* (\\\${sId})\\n\`
            txt += \`┃    ├ Nível: [\\\${filled}] \\\${current}/\\\${s.max}\\n\`
            txt += \`┃    └ Efeito: \\\${s.desc}\\n\`
        }
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\\n\\n'
        txt += '💡 *Ações:*\\n'
        txt += '├ Aprender: \`.evoluirtalento <habilidade>\`\\n'
        txt += '├ Trocar Classe: \`.trocararvore <classe>\`\\n'
        txt += '└ Resetar Pontos: \`.resetartalentos\`'
        return reply(txt.trim())
    }
}
`, 'talentos')

safeWrite(path.join(folders.talentos, 'evoluirtalento.js'), `
const talentService = require('../../../services/talentService')

module.exports = {
    name: 'evoluirtalento',
    category: 'rpg',
    subcategory: 'Habilidades',
    description: 'Aloca 1 ponto de talento em uma habilidade da sua classe: .evoluirtalento <id>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: \`.evoluirtalento <id da habilidade>\`\\nExemplo: \`.evoluirtalento golpe_pesado\`\\nDigite \`.talentos\` para consultar sua árvore.')
        const res = talentService.allocatePoint(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '⭐ *HABILIDADE APERFEIÇOADA COM SUCESSO!*\\n\\n'
        txt += \`⚔️ *Habilidade:* \\\${res.skillName}\\n\`
        txt += \`📈 *Novo Nível:* Nível \\\${res.newLevel} / \\\${res.maxLevel}\\n\`
        txt += \`✨ *Pontos de Talento Restantes:* \\\${res.remainingPoints} pts\\n\\n\`
        txt += '💡 Seus atributos de combate em raids e duelos foram fortalecidos!'
        return reply(txt.trim())
    }
}
`, 'evoluirtalento')

safeWrite(path.join(folders.talentos, 'trocararvore.js'), `
const talentService = require('../../../services/talentService')

module.exports = {
    name: 'trocararvore',
    category: 'rpg',
    subcategory: 'Habilidades',
    description: 'Alterna sua árvore de talentos: .trocararvore <guerreiro|mago|paladino|assassino|arqueiro>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Escolha uma classe: \`.trocararvore guerreiro\`, \`mago\`, \`paladino\`, \`assassino\` ou \`arqueiro\`.')
        const res = talentService.setTree(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '✨ *ÁRVORE DE TALENTOS ALTERADA COM SUCESSO!*\\n\\n'
        txt += \`⚔️ *Nova Especialização:* \\\${res.treeName}\\n\\n\`
        txt += '💡 Digite \`.talentos\` para conferir suas novas habilidades e alocar pontos.'
        return reply(txt.trim())
    }
}
`, 'trocararvore')

safeWrite(path.join(folders.talentos, 'resetartalentos.js'), `
const talentService = require('../../../services/talentService')

module.exports = {
    name: 'resetartalentos',
    category: 'rpg',
    subcategory: 'Habilidades',
    description: 'Redefine todos os pontos de talentos gastos para redistribuir',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = talentService.resetTalents(sender)
        if (!res.success) return reply(res.message)

        let txt = '🔄 *TALENTOS REDEFINIDOS COM SUCESSO!*\\n\\n'
        txt += \`✨ *Pontos Devolvidos:* \\\${res.refundedPoints} pts\\n\`
        if (res.cost > 0) {
            txt += \`💰 *Custo do Reset:* \\\${res.cost.toLocaleString('pt-BR')} moedas\\n\`
        } else {
            txt += '🎁 *Primeiro Reset Gratuito!*\\n'
        }
        txt += '\\n💡 Digite \`.talentos\` para montar uma nova build estratégica.'
        return reply(txt.trim())
    }
}
`, 'resetartalentos')

// Cria comandos individuais para cada habilidade de cada classe
for (const [treeKey, tree] of Object.entries(talentService.TALENT_TREES)) {
    for (const [sId, skill] of Object.entries(tree.skills)) {
        const cmdName = `skill_${sId}`
        safeWrite(path.join(folders.talentos, `${cmdName}.js`), `
module.exports = {
    name: '${cmdName}',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade ${skill.name}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: ${skill.name.toUpperCase()}* ═══════╗\\n\\n'
        txt += '🏷️ *Classe:* ${tree.name}\\n'
        txt += '⭐ *Nível Máximo:* ${skill.max} níveis\\n'
        txt += '📖 *Descrição:* ${skill.desc}\\n\\n'
        txt += 'Para evoluir: \`.evoluirtalento ${sId}\`'
        return reply(txt.trim())
    }
}
`, cmdName)
    }
}

// -------------------------------------------------------------
// 3. FORJA LENDÁRIA, ALQUIMIA & ENCANTAMENTOS
// -------------------------------------------------------------
const craftService = require('../src/services/craftService')

safeWrite(path.join(folders.forja, 'receitas.js'), `
const craftService = require('../../../services/craftService')

module.exports = {
    name: 'receitas',
    category: 'rpg',
    subcategory: 'Forja & Alquimia',
    description: 'Catálogo de receitas para forjar armas lendárias e destilar poções',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const list = craftService.getAllRecipes()
        let txt = '╔════════ ⚒️ *FORJA & ALQUIMIA DE REINO* ════════╗\\n\\n'
        txt += 'Transforme minérios e essências em equipamentos e elixires lendários.\\n\\n'

        for (const r of list) {
            txt += \`📜 *\\\${r.name}* (\\\${r.id})\\n\`
            txt += \`   ├ Nível Mínimo: Nível \\\${r.levelReq} | Custo: \\\${r.cost.toLocaleString('pt-BR')} moedas\\n\`
            txt += \`   ├ Materiais: \\\${r.materials}\\n\`
            txt += \`   ├ Resultado: \\\${r.result}\\n\`
            txt += \`   └ Forjar: .forjar \${r.id}\\n\\n\`
        }

        txt += '💡 Aumente seu nível de RPG para liberar receitas de grau sagrado.'
        return reply(txt.trim())
    }
}
`, 'receitas')

safeWrite(path.join(folders.forja, 'forjar_item.js'), `
const craftService = require('../../../services/craftService')

module.exports = {
    name: 'forjar_item',
    category: 'rpg',
    subcategory: 'Forja & Alquimia',
    description: 'Forja uma arma ou destila uma poção pelo ID da receita: .forjar_item <id>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: \`.forjar_item <id da receita>\`\\nExemplo: \`.forjar_item forja_espada_central\`\\nDigite \`.receitas\` para ver as opções.')
        const res = craftService.craftItem(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '⚒️ *FORJA CONCLUÍDA COM MAESTRIA!*\\n\\n'
        txt += \`✨ *Item Criado:* \\\${res.resultItem}\\n\`
        txt += \`💰 *Custo dos Materiais:* \\\${res.cost.toLocaleString('pt-BR')} moedas\\n\`
        txt += \`🏦 *Saldo Restante:* \\\${res.newBalance.toLocaleString('pt-BR')} moedas\\n\\n\`
        txt += '🎒 O item foi adicionado diretamente à sua mochila de aventureiro (\`.mochila\`).'
        return reply(txt.trim())
    }
}
`, 'forjar_item')

// Comandos de receitas individuais
for (const r of craftService.getAllRecipes()) {
    const rCmd = `receita_${r.id}`
    safeWrite(path.join(folders.forja, `${rCmd}.js`), `
module.exports = {
    name: '${rCmd}',
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para ${r.name}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: ${r.name.toUpperCase()}* ═══════╗\\n\\n'
        txt += '⭐ *Nível Requerido:* Nível ${r.levelReq}\\n'
        txt += '💰 *Custo de Execução:* ${r.cost.toLocaleString('pt-BR')} moedas\\n'
        txt += '📦 *Materiais Necessários:* ${r.materials}\\n'
        txt += '✨ *Item Gerado:* ${r.result}\\n'
        txt += '📖 *Efeito:* ${r.desc}\\n\\n'
        txt += 'Para produzir agora: \`.forjar ${r.id}\`'
        return reply(txt.trim())
    }
}
`, rCmd)
}

// -------------------------------------------------------------
// 4. RAIDS COMUNITÁRIAS & BOSS FIGHTS
// -------------------------------------------------------------
const raidService = require('../src/services/raidService')

safeWrite(path.join(folders.raids, 'iniciar_raid.js'), `
const raidService = require('../../../services/raidService')

module.exports = {
    name: 'iniciar_raid',
    category: 'rpg',
    subcategory: 'Raids Comunitárias',
    description: 'Inicia uma Raid de chefe com múltiplas fases no grupo: .iniciar_raid [chefe]',
    cooldownMs: 5000,
    groupOnly: true,
    execute: async ({ from, reply, args }) => {
        const bossKey = args[0] || 'albion'
        const res = raidService.startRaid(from, bossKey)
        if (!res.success) return reply(res.message)

        let txt = '🔥 *UMA NOVA RAID COMUNITÁRIA COMEÇOU NO GRUPO!* 🔥\\n\\n'
        txt += \`👹 *Chefe:* \\\${res.boss.name}\\n\`
        txt += \`🏷️ *Título:* \\\${res.boss.title}\\n\`
        txt += \`❤️ *Vida do Chefe:* \\\${res.boss.hpMax.toLocaleString('pt-BR')} HP (\\\${res.boss.phases} fases)\\n\`
        txt += \`💰 *Recompensa Total:* \\\${res.boss.baseRewardCoins.toLocaleString('pt-BR')} moedas + \\\${res.boss.baseRewardXp.toLocaleString('pt-BR')} XP\\n\\n\`
        txt += '⚔️ *COMO PARTICIPAR:*\\n'
        txt += 'Todos os membros do grupo podem atacar com \`.atacar_raid\`.\\n'
        txt += 'As recompensas serão distribuídas proporcionalmente ao dano causado!'
        return reply(txt.trim())
    }
}
`, 'iniciar_raid')

safeWrite(path.join(folders.raids, 'atacar_raid.js'), `
const raidService = require('../../../services/raidService')

module.exports = {
    name: 'atacar_raid',
    category: 'rpg',
    subcategory: 'Raids Comunitárias',
    description: 'Desfere um ataque de combate contra o chefe da Raid ativa no grupo',
    cooldownMs: 2000,
    groupOnly: true,
    execute: async ({ from, sender, reply }) => {
        const res = raidService.attackRaid(from, sender)
        if (res.success === false) return reply(res.message)

        if (res.finished) {
            let txt = '🎉 *O CHEFE DA RAID FOI DERROTADO! VITÓRIA DO GRUPO!* 🏆\\n\\n'
            txt += \`👹 *Chefe Vencido:* \\\${res.bossName}\\n\`
            txt += \`👥 *Heróis Participantes:* \\\${res.totalParticipants} guerreiros\\n\\n\`
            txt += '╭━〔 🎖️ TOP RECOMPENSAS POR DANO 〕━⬣\\n'
            res.rewards.sort((a, b) => b.damage - a.damage).slice(0, 10).forEach((r, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🔹'
                txt += \`┃ \\\${medal} *\\\${r.name}:* \\\${r.damage.toLocaleString('pt-BR')} dano\\n\`
                txt += \`┃    └ Recompensa: +\\\${r.coins.toLocaleString('pt-BR')} moedas | +\\\${r.xp.toLocaleString('pt-BR')} XP\\n\`
            })
            txt += '╰━━━━━━━━━━━━━━━━━━⬣\\n\\n'
            txt += '✨ Os prêmios já foram depositados diretamente nas contas dos participantes!'
            return reply(txt.trim())
        }

        const critText = res.isCrit ? '💥 *GOLPE CRÍTICO!* ' : '⚔️ '
        const hpBar = Math.round((res.remainingHp / res.maxHp) * 10)
        const barVisual = '█'.repeat(hpBar) + '░'.repeat(10 - hpBar)

        let txt = \`\\\${critText}Você causou *\\\${res.damage.toLocaleString('pt-BR')} de dano* em \\\${res.bossName}!\\n\\n\`
        txt += \`❤️ *Vida Restante:* [\\\${barVisual}] \\\${res.remainingHp.toLocaleString('pt-BR')} / \\\${res.maxHp.toLocaleString('pt-BR')} HP\\n\`
        txt += \`⭐ *Fase do Chefe:* Fase \\\${res.currentPhase} / \\\${res.totalPhases}\\n\`
        txt += \`⚠️ *Contra-Ataque do Chefe:* *\\\${res.bossAttack}*!\\n\\n\`
        txt += '💡 Ataque novamente com \`.atacar_raid\` para subir no ranking de dano!'
        return reply(txt.trim())
    }
}
`, 'atacar_raid')

safeWrite(path.join(folders.raids, 'status_raid.js'), `
const raidService = require('../../../services/raidService')

module.exports = {
    name: 'status_raid',
    category: 'rpg',
    subcategory: 'Raids Comunitárias',
    description: 'Consulta o status atual, HP e líderes de dano da Raid do grupo',
    cooldownMs: 3000,
    groupOnly: true,
    execute: async ({ from, reply }) => {
        const raid = raidService.getActiveRaid(from)
        if (!raid) return reply('Nenhuma Raid ativa no grupo no momento. Use \`.iniciar_raid\`.')

        const hpBar = Math.round((raid.hp_current / raid.hp_max) * 10)
        const barVisual = '█'.repeat(hpBar) + '░'.repeat(10 - hpBar)

        let txt = \`╔════════ 🔥 *STATUS DA RAID ATIVA* 🔥 ════════╗\\n\\n\`
        txt += \`👹 *Chefe:* \\\${raid.boss_name}\\n\`
        txt += \`❤️ *HP do Chefe:* [\\\${barVisual}] \\\${raid.hp_current.toLocaleString('pt-BR')} / \\\${raid.hp_max.toLocaleString('pt-BR')} HP\\n\`
        txt += \`⭐ *Fase Atual:* Fase \\\${raid.phase}\\n\\n\`
        txt += '╭━〔 ⚔️ TOP HERÓIS PARTICIPANTES 〕━⬣\\n'
        raid.participants.sort((a, b) => b.damage - a.damage).slice(0, 5).forEach((p, idx) => {
            txt += \`┃ \\\${idx + 1}º *\\\${p.name}:* \\\${p.damage.toLocaleString('pt-BR')} de dano (\\\${p.turns} turnos)\\n\`
        })
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\\n\\n'
        txt += 'Para lutar: \`.atacar_raid\`'
        return reply(txt.trim())
    }
}
`, 'status_raid')

// -------------------------------------------------------------
// 5. MONTARIAS & MASCOTES DE COMBATE
// -------------------------------------------------------------
const mountService = require('../src/services/mountService')

safeWrite(path.join(folders.montarias, 'estabulo_real.js'), `
const mountService = require('../../../services/mountService')

module.exports = {
    name: 'estabulo_real',
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Catálogo de montarias e mascotes disponíveis para adoção no Reino',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const list = mountService.getAllAvailableMounts()
        let txt = '╔════════ 🐎 *ESTÁBULO REAL DE REINO* ════════╗\\n\\n'
        txt += 'Montarias conferem bônus de velocidade e companheirismo em missões.\\n\\n'

        for (const m of list) {
            txt += \`🐴 *\\\${m.name}* (\\\${m.type})\\n\`
            txt += \`   ├ Preço: \\\${m.cost.toLocaleString('pt-BR')} moedas\\n\`
            txt += \`   ├ Bônus de Velocidade: +\\\${Math.round(m.speedBonus * 100)}%\\n\`
            txt += \`   ├ Descrição: \\\${m.desc}\\n\`
            txt += \`   └ Adotar: .adotar_montaria \${m.id}\\n\\n\`
        }

        txt += '💡 Digite \`.minhasmontarias\` para ver as montarias do seu estábulo pessoal.'
        return reply(txt.trim())
    }
}
`, 'estabulo')

safeWrite(path.join(folders.montarias, 'adotar_montaria.js'), `
const mountService = require('../../../services/mountService')

module.exports = {
    name: 'adotar_montaria',
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Adota uma montaria para seu estábulo pessoal: .adotar_montaria <id>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: \`.adotar_montaria <id da montaria>\`\\nExemplo: \`.adotar_montaria hawk_porco\`\\nDigite \`.estabulo\` para ver as opções.')
        const res = mountService.adoptMount(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '🎉 *PARABÉNS! NOVA MONTARIA ADOTADA!*\\n\\n'
        txt += \`🐴 *Mascote:* \\\${res.name}\\n\`
        txt += \`💰 *Custo:* \\\${res.cost.toLocaleString('pt-BR')} moedas\\n\`
        txt += \`🏦 *Saldo Restante:* \\\${res.newBalance.toLocaleString('pt-BR')} moedas\\n\\n\`
        txt += '💡 Sua montaria já foi equipada como montaria principal e está pronta para cavalgar!'
        return reply(txt.trim())
    }
}
`, 'adotar_montaria')

safeWrite(path.join(folders.montarias, 'minhasmontarias.js'), `
const mountService = require('../../../services/mountService')

module.exports = {
    name: 'minhasmontarias',
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Exibe suas montarias e mascotes alojados no seu estábulo',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const list = mountService.getUserMounts(sender)
        if (list.length === 0) return reply('Você ainda não possui montarias. Visite o \`.estabulo\`!')

        let txt = '╔════════ 🐎 *MEU ESTÁBULO DE MONTARIAS* ════════╗\\n\\n'
        for (const m of list) {
            const eqText = m.equipped ? '⭐ *[EQUIPADA]*' : '⚪ [No estábulo]'
            txt += \`🐴 *\\\${m.name}* (Nível \\\${m.level}) \\\${eqText}\\n\`
            txt += \`   ├ ID da Montaria: \\\${m.id}\\n\`
            txt += \`   ├ Energia / Stamina: \\\${m.stamina}%\\n\`
            txt += \`   ├ Bônus de Velocidade: +\\\${Math.round(m.speed_bonus * 100)}%\\n\`
            txt += \`   └ Alimentar: .alimentarmontaria \${m.id}\\n\\n\`
        }

        txt += '💡 Equipe outra montaria com \`.equiparmontaria <id>\`.'
        return reply(txt.trim())
    }
}
`, 'minhasmontarias')

safeWrite(path.join(folders.montarias, 'alimentarmontaria.js'), `
const mountService = require('../../../services/mountService')

module.exports = {
    name: 'alimentarmontaria',
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Alimenta sua montaria com ração especial para recuperar energia e subir nível: .alimentarmontaria <id>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: \`.alimentarmontaria <id da montaria>\`\\nConsulte os IDs no seu estábulo com \`.minhasmontarias\`.')
        const res = mountService.feedMount(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '🍎 *MONTARIA ALIMENTADA COM SUCESSO!*\\n\\n'
        txt += \`🐴 *Montaria:* \\\${res.mountName}\\n\`
        txt += \`⭐ *Novo Nível:* Nível \\\${res.newLevel}\\n\`
        txt += '⚡ *Energia:* 100% (Vigor Máximo)\\n'
        txt += \`💰 *Custo:* \\\${res.cost} moedas\\n\`
        txt += \`🏦 *Saldo Restante:* \\\${res.newBalance.toLocaleString('pt-BR')} moedas\`
        return reply(txt.trim())
    }
}
`, 'alimentarmontaria')

// -------------------------------------------------------------
// EXPANSÃO EM MASSA: FICHAS DE COMBATE, EXPEDIÇÕES & LORE
// -------------------------------------------------------------
const regions = [
    'central', 'cidade dourada', 'dalmary', 'torre', 'orlondi', 'vilarejo', 'floresta_fadas', 'purgatorio', 'edimburgo', 'mar_ocidental'
]

const combatTypes = [
    'esgrima', 'tiro_arco', 'magia_fogo', 'magia_gelo', 'magia_luz', 'magia_trevas', 'invocacao', 'defesa_escudo', 'artes_marciais', 'alquimia_combate',
    'combate_furtivo', 'tatica_guerra', 'cura_sagrada', 'sobrevivencia', 'rastreamento', 'domestica_feras', 'encantamento', 'quebra_magia', 'armadilha', 'berserk'
]

for (const reg of regions) {
    for (const c of combatTypes) {
        // 1. Expedição de caça regional: .expedicao_<reg>_<c>
        const expCmd = `expedicao_${reg}_${c}`
        safeWrite(path.join(folders.clas, `${expCmd}.js`), `
const economyService = require('../../../services/economyService')

module.exports = {
    name: '${expCmd}',
    category: 'rpg',
    subcategory: 'Expedições de Caça',
    description: 'Expedição de caça com foco em ${c.replace(/_/g, ' ')} nos arredores de ${reg}',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const earnedXp = Math.floor(Math.random() * 350 + 150)
        const earnedCoins = Math.floor(Math.random() * 200 + 100)

        user.xp = (user.xp || 0) + earnedXp
        user.coins = (user.coins || 0) + earnedCoins
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🌲 *EXPEDIÇÃO DE CAÇA CONCLUÍDA!*\\n\\n'
        txt += '📍 *Região Explorada:* ${reg.toUpperCase()}\\n'
        txt += '⚔️ *Técnica Empregada:* ${c.replace(/_/g, ' ').toUpperCase()}\\n'
        txt += \`⚡ *XP Adquirido:* +\\\${earnedXp} XP\\n\`
        txt += \`💰 *Moedas Coletadas:* +\\\${earnedCoins} moedas\\n\`
        txt += \`👛 *Saldo Atual:* \\\${user.coins.toLocaleString('pt-BR')} moedas\`
        return reply(txt.trim())
    }
}
`, expCmd)

        // 2. Campo de treino militar: .treino_<reg>_<c>
        const trCmd = `treino_${reg}_${c}`
        safeWrite(path.join(folders.talentos, `${trCmd}.js`), `
const economyService = require('../../../services/economyService')

module.exports = {
    name: '${trCmd}',
    category: 'rpg',
    subcategory: 'Campos de Treinamento',
    description: 'Sessão de treinamento marcial de ${c.replace(/_/g, ' ')} no centro de treino de ${reg}',
    cooldownMs: 2500,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const bonus = Math.floor(Math.random() * 150 + 80)
        user.xp = (user.xp || 0) + bonus
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🎯 *TREINAMENTO MARCIAL CONCLUÍDO!*\\n\\n'
        txt += '🏛️ *Campo Militar:* Guarnição de ${reg.toUpperCase()}\\n'
        txt += '🥋 *Disciplina:* ${c.replace(/_/g, ' ').toUpperCase()}\\n'
        txt += \`⚡ *Experiência de Combate:* +\\\${bonus} XP\\n\\n\`
        txt += '💡 Treinos constantes preparam seu herói para as grandes raids!'
        return reply(txt.trim())
    }
}
`, trCmd)

        // 3. Forja de munições e relíquias de caça: .artesao_<reg>_<c>
        const artCmd = `artesao_${reg}_${c}`
        safeWrite(path.join(folders.forja, `${artCmd}.js`), `
module.exports = {
    name: '${artCmd}',
    category: 'rpg',
    subcategory: 'Artesanato Marcial',
    description: 'Manual de manufatura de suprimentos de ${c.replace(/_/g, ' ')} da região de ${reg}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *MANUAL DO ARTESÃO: ${reg.toUpperCase()}* ═══════╗\\n\\n'
        txt += '📦 *Especialidade Regional:* Suprimentos para ${c.replace(/_/g, ' ')}\\n'
        txt += '⭐ *Qualidade dos Materiais:* Aço nobre e madeira encantada\\n\\n'
        txt += 'Consulte receitas oficiais com \`.receitas\`.'
        return reply(txt.trim())
    }
}
`, artCmd)

        // 4. Masmorra ou Covil de Monstros regional: .masmorra_<reg>_<c>
        const masmCmd = `masmorra_${reg}_${c}`
        safeWrite(path.join(folders.raids, `${masmCmd}.js`), `
const economyService = require('../../../services/economyService')

module.exports = {
    name: '${masmCmd}',
    category: 'rpg',
    subcategory: 'Masmorras & Covis',
    description: 'Incursão solo a uma masmorra infestada de monstros em ${reg}',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const xp = Math.floor(Math.random() * 400 + 200)
        const loot = Math.floor(Math.random() * 250 + 150)
        user.xp = (user.xp || 0) + xp
        user.coins = (user.coins || 0) + loot
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🏰 *INCURSÃO NA MASMORRA FINALIZADA!*\\n\\n'
        txt += '📍 *Masmorra:* Catacumbas de ${reg.toUpperCase()}\\n'
        txt += '👹 *Monstro Derrotado:* Guardião das Trevas de ${c.replace(/_/g, ' ').toUpperCase()}\\n'
        txt += \`⚡ *Recompensa:* +\\\${xp} XP | +\\\${loot} moedas\\n\`
        txt += \`👛 *Saldo Atual:* \\\${user.coins.toLocaleString('pt-BR')} moedas\`
        return reply(txt.trim())
    }
}
`, masmCmd)

        // 5. Rota de montaria regional: .cavalgada_<reg>_<c>
        const cavCmd = `cavalgada_${reg}_${c}`
        safeWrite(path.join(folders.montarias, `${cavCmd}.js`), `
const mountService = require('../../../services/mountService')
const economyService = require('../../../services/economyService')

module.exports = {
    name: '${cavCmd}',
    category: 'rpg',
    subcategory: 'Rotas de Montaria',
    description: 'Cavalgada de exploração em ${reg} utilizando técnica de ${c.replace(/_/g, ' ')}',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const mounts = mountService.getUserMounts(sender)
        const eqMount = mounts.find(m => m.equipped)
        const mountName = eqMount ? eqMount.name : 'A pé (sem montaria)'
        const bonusSpeed = eqMount ? Math.round(eqMount.speed_bonus * 100) : 0

        const user = economyService.carregarUsuario(sender)
        const coinsFound = Math.floor(Math.random() * 180 + 80) * (eqMount ? 1.5 : 1)
        user.coins = (user.coins || 0) + Math.floor(coinsFound)
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🐎 *CAVALGADA PELA ROTA DE ${reg.toUpperCase()}!*\\n\\n'
        txt += \`🐴 *Montaria Utilizada:* \\\${mountName} (Bônus de Velocidade: +\\\${bonusSpeed}%)\\n\`
        txt += \`💰 *Moedas Encontradas na Estrada:* +\\\${Math.floor(coinsFound)} moedas\\n\`
        txt += \`👛 *Novo Saldo:* \\\${user.coins.toLocaleString('pt-BR')} moedas\`
        return reply(txt.trim())
    }
}
`, cavCmd)
    }
}

console.log(`\n✅ Fase 3 Concluída! Total de novos comandos de RPG criados: ${createdCount}`)
