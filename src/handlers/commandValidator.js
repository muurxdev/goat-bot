/**
 * Validador do registro de comandos.
 *
 * Percorre os módulos carregados (na ordem de varredura) e reporta problemas de
 * integridade: nomes duplicados, aliases sombreados por nomes, aliases em conflito,
 * campos obrigatórios ausentes e chaves desconhecidas (typos como botAdminRequired).
 *
 * Não decide a política de resolução — apenas relata. O loader aplica a política
 * (first-wins + aliasOwners) e usa este relatório para logar/abortar.
 */

// Chaves reconhecidas no schema de um comando. Qualquer outra vira aviso.
const KNOWN_KEYS = new Set([
    // Ajuda de uso (usoService / .help), desde 2026-09-17
    'usage', 'examples',
    'name', 'execute', 'aliases', 'category', 'subcategory', 'description',
    'cooldownMs', 'groupOnly', 'adminOnly', 'ownerOnly', 'botAdminOnly',
    'minRole', 'hidden', 'devOnly',
    // Resposta sai sem a tradução de jargão (loreService): IA e conteúdo técnico
    'loreExempt'
])

/**
 * @param {Array<{file: string, cmd: object}>} entries - módulos na ordem de varredura
 * @returns {{errors: string[], warnings: string[], duplicateNames: object[],
 *            aliasShadowedByName: object[], aliasConflicts: object[],
 *            unknownKeys: object[], missingFields: object[]}}
 */
function validateRegistry(entries) {
    const nameToFile = new Map()      // name -> primeiro arquivo que o registrou
    const aliasToName = new Map()     // alias -> nome do comando dono

    const duplicateNames = []
    const aliasShadowedByName = []
    const aliasConflicts = []
    const unknownKeys = []
    const missingFields = []

    // Primeiro passe: nomes (para poder detectar alias sombreado por nome)
    for (const { file, cmd } of entries) {
        if (!cmd || typeof cmd !== 'object') { missingFields.push({ file, reason: 'módulo não exporta objeto' }); continue }
        if (!cmd.name) { missingFields.push({ file, reason: 'sem campo name' }); continue }
        if (typeof cmd.execute !== 'function') { missingFields.push({ file, name: cmd.name, reason: 'sem execute()' }); continue }

        const name = cmd.name.toLowerCase()
        if (nameToFile.has(name)) {
            duplicateNames.push({ name, kept: nameToFile.get(name), duplicate: file })
        } else {
            nameToFile.set(name, file)
        }
    }

    // Segundo passe: aliases e chaves desconhecidas
    for (const { file, cmd } of entries) {
        if (!cmd || !cmd.name || typeof cmd.execute !== 'function') continue

        for (const key of Object.keys(cmd)) {
            if (!KNOWN_KEYS.has(key)) unknownKeys.push({ file, name: cmd.name, key })
        }

        if (Array.isArray(cmd.aliases)) {
            for (const rawAlias of cmd.aliases) {
                const alias = String(rawAlias).toLowerCase()
                if (nameToFile.has(alias)) {
                    aliasShadowedByName.push({ alias, command: cmd.name, file })
                    continue
                }
                if (aliasToName.has(alias)) {
                    aliasConflicts.push({ alias, kept: aliasToName.get(alias), dropped: cmd.name })
                } else {
                    aliasToName.set(alias, cmd.name)
                }
            }
        }
    }

    const errors = []
    const warnings = []
    for (const d of duplicateNames) errors.push(`Nome duplicado '${d.name}': ${d.duplicate} colide com ${d.kept}`)
    for (const m of missingFields) errors.push(`Campo obrigatório ausente em ${m.file}: ${m.reason}`)
    for (const s of aliasShadowedByName) warnings.push(`Alias morto '${s.alias}' (de ${s.command}) — já é nome de comando`)
    for (const c of aliasConflicts) warnings.push(`Alias em conflito '${c.alias}': mantido em ${c.kept}, ignorado em ${c.dropped}`)
    for (const u of unknownKeys) warnings.push(`Chave desconhecida '${u.key}' em ${u.name} (${u.file})`)

    return { errors, warnings, duplicateNames, aliasShadowedByName, aliasConflicts, unknownKeys, missingFields }
}

/** Formata o relatório para log (compacto). */
function formatReport(report) {
    const lines = []
    lines.push(`[COMMAND VALIDATOR] ${report.errors.length} erro(s), ${report.warnings.length} aviso(s)`)
    if (report.duplicateNames.length) lines.push(`  • ${report.duplicateNames.length} nome(s) duplicado(s)`)
    if (report.aliasShadowedByName.length) lines.push(`  • ${report.aliasShadowedByName.length} alias(es) morto(s) (sombreados por nome)`)
    if (report.aliasConflicts.length) lines.push(`  • ${report.aliasConflicts.length} alias(es) em conflito`)
    if (report.unknownKeys.length) lines.push(`  • ${report.unknownKeys.length} chave(s) desconhecida(s)`)
    if (report.missingFields.length) lines.push(`  • ${report.missingFields.length} arquivo(s) com campo obrigatório ausente`)
    return lines.join('\n')
}

module.exports = { validateRegistry, formatReport, KNOWN_KEYS }
