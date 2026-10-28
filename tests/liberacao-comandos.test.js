process.env.NODE_ENV = 'test'

/**
 * Comando de utilidade (.dossie e outros 1.386), `dev` e `livros` não podem ficar desligados
 * para quem não é dono (2026-10-15). O grupo novo entrava no perfil RPG, que deixa essas seções
 * de fora: 1.786 de 4.569 comandos respondiam "está desligado aqui" ao usuário comum, enquanto o
 * dono — que fura a camada de módulos — via tudo funcionando e achava o bot completo.
 *
 * Banco descartável: `liberarTodosOsAmbientes` age em todos os ambientes, não só no do teste.
 */

const os = require('os')
const path = require('path')
const fs = require('fs')
const assert = require('assert')

const banco = path.join(os.tmpdir(), `liberacao-comandos-${process.pid}-${Date.now()}.sqlite`)
process.env.DB_PATH = banco

const ms = require('../src/services/moduleStateService')
const dispatcher = require('../src/handlers/commandDispatcher')
dispatcher.loadCommands()
const { MODULES, resolveModuleKey } = require('../src/config/modules')
const { getCommands } = dispatcher

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const todos = () => {
    const c = getCommands()
    return [...(c.values ? c.values() : Object.values(c))]
}

console.log('\n🧪 Liberação dos comandos para o usuário comum...\n')

teste('grupo novo nasce com todos os módulos ligados, menos skycode e divulgacao', () => {
    const grupo = `${Date.now()}001@g.us`
    assert.strictEqual(ms.provisionIfNew(grupo), true)
    for (const m of MODULES) {
        assert.strictEqual(ms.isModuleEnabled(m.key, grupo), m.key !== 'skycode' && m.key !== 'divulgacao', `módulo ${m.key}`)
    }
})

teste('no grupo novo só comandos de skycode e divulgacao ficam desligados — .dossie incluído', () => {
    const grupo = `${Date.now()}002@g.us`
    ms.provisionIfNew(grupo)
    const desligados = todos().filter(c => !ms.isCommandEnabled(c, grupo))
    const fora = desligados.filter(c => resolveModuleKey(c) !== 'skycode' && resolveModuleKey(c) !== 'divulgacao')
    assert.deepStrictEqual(fora.map(c => c.name), [], `desligados fora de skycode/divulgacao: ${fora.slice(0, 8).map(c => c.name).join(', ')}`)
    const dossie = dispatcher.findCommand('dossie')
    assert.ok(dossie, '.dossie sumiu do registro')
    assert.strictEqual(ms.isCommandEnabled(dossie, grupo), true)
})

teste('o grupo que já existia com o padrão antigo é liberado, e o override por comando fica', () => {
    const grupo = `${Date.now()}003@g.us`
    ms.disableAll(grupo) // o que o perfil RPG deixava: utilidades/dev/livros OFF
    ms.setModule('rpg', true, grupo)
    ms.setCommand('dossie', false, grupo) // alguém desligou de propósito
    assert.strictEqual(ms.isModuleEnabled('utilidades', grupo), false)

    const r = ms.liberarTodosOsAmbientes()
    assert.ok(r.depois > r.antes, `ligados ${r.antes} → ${r.depois}`)
    assert.strictEqual(ms.isModuleEnabled('utilidades', grupo), true)
    assert.strictEqual(ms.isModuleEnabled('dev', grupo), true)
    assert.strictEqual(ms.isModuleEnabled('livros', grupo), true)
    assert.strictEqual(ms.isModuleEnabled('skycode', grupo), false, 'skycode é do dono')
    assert.strictEqual(ms.isCommandEnabled(dispatcher.findCommand('dossie'), grupo), false, 'o override explícito tem de ficar')
    assert.strictEqual(ms.isModuleEnabled('utilidades', ms.PV_SCOPE), true, 'o privado também')
})

teste('ambiente que já tinha registro não é reprovisionado (decisão do dono vale)', () => {
    const grupo = `${Date.now()}004@g.us`
    ms.disableAll(grupo)
    assert.strictEqual(ms.provisionIfNew(grupo), false)
    assert.strictEqual(ms.isModuleEnabled('utilidades', grupo), false)
})

teste('link tt.site é reconhecido como TikTok', () => {
    const { ehPlataforma, identificarLink } = require('../src/services/media/plataformas')
    for (const u of ['https://www.tt.site/t/ZSgLrhhuB/', 'https://tt.site/t/abc123', 'https://vt.tiktok.com/ZS1/']) {
        assert.strictEqual(ehPlataforma(u, 'tiktok'), true, u)
        assert.strictEqual(identificarLink(u).nome, 'TikTok', u)
    }
    // o host é comparado por inteiro: "xtt.site" não pode virar TikTok
    assert.strictEqual(ehPlataforma('https://xtt.site/t/abc', 'tiktok'), false)
})

// No Windows o arquivo aberto não some: fecha o banco antes.
try { require('../src/database/connection').closeDatabase() } catch (err) { console.log(`  (não fechei o banco: ${err.message})`) }
for (const sufixo of ['', '-wal', '-shm']) {
    try { fs.unlinkSync(banco + sufixo) } catch (err) { if (err.code !== 'ENOENT') console.log(`  (não apaguei ${banco + sufixo}: ${err.message})`) }
}

console.log(`\n📊 Liberação dos comandos: ✅ ${ok}  ❌ ${falhou}\n`)
process.exit(falhou > 0 ? 1 : 0)
