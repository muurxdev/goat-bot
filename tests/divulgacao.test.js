process.env.NODE_ENV = 'test'

/**
 * Módulo Divulgação restaurado e ativo.
 * Valida que o módulo, os 25 comandos, o serviço e o perfil estão íntegros.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const raiz = path.join(__dirname, '..')

console.log('\n🧪 Módulo Divulgação restaurado...\n')

teste('módulo "divulgacao" está presente em MODULES', () => {
    const { MODULES, BY_KEY } = require('../src/config/modules')
    assert.ok(MODULES.some(m => m.key === 'divulgacao'), 'módulo divulgacao não encontrado em MODULES')
    assert.ok(BY_KEY.divulgacao, 'BY_KEY.divulgacao não definido')
})

teste('arquivos de comandos e serviços de divulgação existem', () => {
    const adm = fs.readdirSync(path.join(raiz, 'src/commands/admin')).filter(n => /^divulga\d+\.js$/.test(n))
    assert.strictEqual(adm.length, 25, `esperava 25 comandos divulgaN, encontrou ${adm.length}`)
    assert.ok(fs.existsSync(path.join(raiz, 'src/services/divulgacaoService.js')), 'divulgacaoService não encontrado')
    assert.ok(fs.existsSync(path.join(raiz, 'src/commands/owner/divulgacao.js')), 'comando owner/divulgacao não encontrado')
})

teste('perfil de atuação "divulgacao" está cadastrado', () => {
    const { PROFILES, PROFILE_BY_KEY, resolveProfileKey } = require('../src/config/botProfiles')
    assert.ok(PROFILE_BY_KEY.divulgacao, 'perfil divulgacao não cadastrado')
    assert.strictEqual(resolveProfileKey('divulgacao'), 'divulgacao', '.perfilbot divulgacao deve resolver para divulgacao')
})

console.log(`\n📊 Divulgação: ✅ ${ok}  ❌ ${falhou}\n`)
if (falhou > 0) process.exit(1)
