/**
 * Avisos agendados (.agendarmensagem + services/scheduledMessageService).
 *
 * Regressão: era um setTimeout em memória e qualquer reinício do bot apagava o
 * aviso depois de o comando dizer "agendada com sucesso".
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const dataService = require('../src/services/dataService')

let configs = {}
dataService.getConfigsData = () => configs
dataService.saveConfigsData = async c => { configs = c }

const servico = require('../src/services/scheduledMessageService')
const cmd = require('../src/commands/admin/agendarmensagem')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const GRUPO = '120363000000000001@g.us'

function clienteFalso() {
    const enviadas = []
    return { enviadas, sendMessage: async (jid, c) => { enviadas.push({ jid, texto: c.text }) } }
}

;(async () => {
    console.log('🧪 Testes de avisos agendados...\n')

    await test('o comando grava o aviso (sobrevive a reinício)', async () => {
        configs = {}
        let resposta = ''
        await cmd.execute({ from: GRUPO, sender: 'x@lid', args: ['10m', 'Evento', 'da', 'guilda'], reply: async t => { resposta = t } })
        assert.strictEqual(configs[GRUPO].mensagensAgendadas.length, 1)
        assert.strictEqual(configs[GRUPO].mensagensAgendadas[0].texto, 'Evento da guilda')
        assert.ok(/Pronto/.test(resposta), resposta)
    })

    await test('envia só o que venceu e tira da lista', async () => {
        const agora = Date.now()
        configs = { [GRUPO]: { mensagensAgendadas: [
            { id: 'a', texto: 'vencido', quando: agora - 1000 },
            { id: 'b', texto: 'futuro', quando: agora + 60000 }
        ] } }
        const c = clienteFalso()
        const n = await servico.processarVencidos(c, agora)
        assert.strictEqual(n, 1)
        assert.strictEqual(c.enviadas.length, 1)
        assert.ok(c.enviadas[0].texto.includes('vencido'))
        assert.deepStrictEqual(configs[GRUPO].mensagensAgendadas.map(i => i.id), ['b'])
        assert.strictEqual(await servico.processarVencidos(c, agora), 0, 'não pode reenviar')
    })

    await test('aviso vencido há muito tempo é descartado sem enviar', async () => {
        const agora = Date.now()
        configs = { [GRUPO]: { mensagensAgendadas: [{ id: 'velho', texto: 'x', quando: agora - servico.ATRASO_MAXIMO_MS - 1 }] } }
        const c = clienteFalso()
        assert.strictEqual(await servico.processarVencidos(c, agora), 0)
        assert.strictEqual(configs[GRUPO].mensagensAgendadas.length, 0)
    })

    await test('lista e cancela pela posição', async () => {
        const agora = Date.now()
        configs = { [GRUPO]: { mensagensAgendadas: [
            { id: 'depois', texto: 'segundo', quando: agora + 120000 },
            { id: 'antes', texto: 'primeiro', quando: agora + 60000 }
        ] } }
        assert.deepStrictEqual(servico.listar(GRUPO).map(i => i.id), ['antes', 'depois'])
        const removido = await servico.cancelar(GRUPO, 1)
        assert.strictEqual(removido.id, 'antes')
        assert.strictEqual(await servico.cancelar(GRUPO, 9), null)
    })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Agendamento: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
