/**
 * Liga todos os módulos (menos `skycode`, que é do dono) em TODOS os ambientes já registrados
 * e no privado. Para consertar instalações que foram provisionadas com o padrão antigo
 * (perfil RPG), que deixava `utilidades`, `dev` e `livros` desligados para quem não é dono:
 * 1.786 dos 4.569 comandos respondiam "está desligado aqui" ao usuário comum, enquanto o dono
 * (que fura essa camada) via tudo funcionando.
 *
 * Os overrides por comando (`.cmd off x`) são decisão explícita de alguém e ficam como estavam.
 *
 * Uso:
 *   node scripts/liberar-comandos.js          # aplica
 *   node scripts/liberar-comandos.js --dry    # só conta
 */

require('dotenv').config()

const moduleState = require('../src/services/moduleStateService')

const dry = process.argv.includes('--dry')

const escopos = new Set([...moduleState.listScopes(), moduleState.PV_SCOPE])
let desligados = 0
for (const escopo of escopos) {
    const off = moduleState.listModules(escopo).filter(m => !m.enabled && m.key !== 'skycode')
    if (off.length) {
        desligados += off.length
        console.log(`  ${escopo}: ${off.length} módulo(s) desligado(s) → ${off.map(m => m.key).join(', ')}`)
    }
}
console.log(`\n${escopos.size} ambiente(s); ${desligados} módulo(s) desligado(s) no total (fora o skycode).`)

if (dry) {
    console.log('(--dry: nada foi gravado)')
    process.exit(0)
}

const r = moduleState.liberarTodosOsAmbientes()
console.log(`Pronto: ${r.ambientes} ambiente(s); módulos ligados ${r.antes} → ${r.depois}.`)
process.exit(0)
