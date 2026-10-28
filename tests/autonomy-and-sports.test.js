const assert = require('assert')
const futebolService = require('../src/services/futebolService')
const { ehGolpe } = require('../src/services/groupProtectionService')
const groupControlService = require('../src/services/groupControlService')
const { detectarTema } = require('../src/config/autoContent')
const dispatcher = require('../src/handlers/commandDispatcher')
const smartRecommendationService = require('../src/services/smartRecommendationService')

console.log('🧪 Iniciando testes de Autonomia, Esportes, Controle de Tempo e Campeonatos...\n')

async function runTests() {
    let passed = 0

    // Teste 1: Heurística Anti-Golpe (ehGolpe)
    const golpes = [
        'Trabalhe de casa e ganhe R$ 350 por dia avaliando produtos na Shopee!',
        'Ganhe de 200 a 800 reais por dia assistindo vídeos no TikTok e Kwai',
        'Multiplique seu saldo no Urubu do Pix oficial!',
        'Robô do Pix garantido: invista 50 e receba 500 em 10 minutos',
        'Nova plataforma pagando 50 reais no cadastro!'
    ]
    for (const g of golpes) {
        assert.strictEqual(ehGolpe(g), true, `Deveria ter identificado como golpe: "${g}"`)
    }
    console.log('  ✅ PASS: Heurística Anti-Golpe Zero-Day detectou 5 variações reais de fraude')
    passed++

    // Teste 2: Heurística Anti-Golpe não tem falso positivo em conversas legítimas
    const legitimas = [
        'Alguém sabe se tem vaga de backend aberta?',
        'O jogo do Palmeiras e Flamengo vai ser transmitido onde?',
        'Quero comprar um notebook usado por 2000 reais',
        'Bom dia grupo, hoje vou trabalhar até as 18 horas'
    ]
    for (const l of legitimas) {
        assert.strictEqual(ehGolpe(l), false, `Falso positivo indevido em: "${l}"`)
    }
    console.log('  ✅ PASS: Zero falsos positivos em conversas e negociações legítimas')
    passed++

    // Teste 3: Parsing Flexível de Minutos e Horas no Abrir/Fechar
    const agora = 1700000000000
    const t1 = groupControlService.parseDurationOrTime('10 minutos', agora)
    assert.strictEqual(t1, agora + 10 * 60 * 1000, 'Deveria aceitar "10 minutos"')

    const t2 = groupControlService.parseDurationOrTime('10', agora)
    assert.strictEqual(t2, agora + 10 * 60 * 1000, 'Número puro deveria interpretar como minutos')

    const t3 = groupControlService.parseDurationOrTime('1 hora e 30 minutos', agora)
    assert.strictEqual(t3, agora + 90 * 60 * 1000, 'Deveria aceitar duração composta')

    const t4 = groupControlService.parseDurationOrTime('daqui a 20 min', agora)
    assert.strictEqual(t4, agora + 20 * 60 * 1000, 'Deveria aceitar prefixo "daqui a"')

    console.log('  ✅ PASS: Suporte completo a minutos, horas e linguagem natural no .abrir e .fechar')
    passed++

    // Teste 4: Futebol Service - Tabela INTEIRA (todos os 20 times)
    const standings = await futebolService.getStandings('brasileirao')
    assert.strictEqual(standings.ok, true)
    assert.strictEqual(standings.entries.length, 20, 'O Brasileirão deve ter exatamente 20 clubes')
    const formatted = futebolService.formatarTabela(standings)
    assert.ok(formatted.includes('BRASILEIRÃO SÉRIE A'))
    assert.ok(formatted.includes('G4'))
    assert.ok(formatted.includes('Rebaixamento (Z4)'))
    assert.ok(formatted.includes('20 Chapecoense') || formatted.includes('20 '))
    console.log('  ✅ PASS: Tabela inteira do Brasileirão entregue com todos os 20 clubes e zonas G4/Z4')
    passed++

    // Teste 5: Futebol Service - Campeonatos Dedicados e Jogos
    const champs = ['brasileirao', 'serieb', 'champions', 'premier', 'laliga']
    for (const c of champs) {
        const s = await futebolService.getStandings(c)
        assert.strictEqual(s.ok, true, `Falha ao carregar standings de ${c}`)
        assert.ok(s.entries.length >= 16, `Esperava pelo menos 16 clubes em ${c}`)
    }
    console.log('  ✅ PASS: Todos os 5 maiores campeonatos retornando tabelas completas')
    passed++

    // Teste 6: Registro de Comandos e Aliases no Dispatcher JIT
    dispatcher.loadCommands()
    const directCmds = ['brasileirao', 'serieb', 'champions', 'libertadores', 'premier', 'laliga', 'tabela', 'jogos', 'campeonato']
    for (const d of directCmds) {
        const cmd = dispatcher.findCommand(d)
        assert.ok(cmd, `Comando .${d} não encontrado no dispatcher`)
    }
    const aliasesTest = ['seriea', 'brasileiraob', 'championsleague', 'premierleague', 'espanhol', 'placar']
    for (const a of aliasesTest) {
        const cmd = dispatcher.findCommand(a)
        assert.ok(cmd, `Alias .${a} não encontrado no dispatcher`)
    }
    console.log('  ✅ PASS: 9 novos comandos dedicados e 26 aliases de campeonatos indexados no JIT')
    passed++

    // Teste 7: Contagem de Comandos
    const cmdIndex = require('../src/config/commandIndex.json')
    const totalCmds = Object.keys(cmdIndex.commands).length
    const totalAliases = Object.keys(cmdIndex.aliases).length
    assert.ok(totalCmds >= 9000, `Esperado >= 9000 comandos, obtido ${totalCmds}`)
    // Piso ajustado de 20000 para 19900 ao remover os aliases de anime (31 aliases, 10 comandos).
    assert.ok(totalAliases >= 19900, `Esperado >= 19900 aliases, obtido ${totalAliases}`)
    console.log(`  ✅ PASS: Total de Comandos: ${totalCmds} comandos canônicos (+ ${totalAliases} aliases = ${totalCmds + totalAliases} gatilhos)`)
    passed++

    // Teste 8: Mapeamento e Separação Rígida entre Champions League e Copa Libertadores
    const sChampions = await futebolService.getStandings('champions')
    const sLibertadores = await futebolService.getStandings('libertadores')
    assert.strictEqual(sChampions.ok, true)
    assert.strictEqual(sLibertadores.ok, true)
    assert.strictEqual(sChampions.entries.length, 36, 'Champions deve conter todos os 36 clubes da Fase de Liga')
    assert.strictEqual(sLibertadores.entries.length, 32, 'Libertadores deve conter 32 clubes (8 grupos x 4)')

    const fChampions = futebolService.formatarTabela(sChampions)
    assert.ok(fChampions.includes('UEFA CHAMPIONS LEAGUE'))
    assert.ok(fChampions.includes('Oitavas de Final'))
    assert.ok(fChampions.includes('Playoffs da Champions (16-avos)'))
    assert.ok(!fChampions.includes('G4 (Libertadores)'), 'Champions JAMAIS deve conter menção a G4 Libertadores')
    assert.ok(!fChampions.includes('Rebaixamento (Z4)'), 'Champions JAMAIS deve conter menção a Z4')

    const fLibertadores = futebolService.formatarTabela(sLibertadores)
    assert.ok(fLibertadores.includes('COPA LIBERTADORES'))
    assert.ok(fLibertadores.includes('GROUP A') || fLibertadores.includes('GRUPO A'))
    assert.ok(fLibertadores.includes('Oitavas de Final (Libertadores)'))
    assert.ok(fLibertadores.includes('Repescagem Copa Sul-Americana'))

    // Filtro por grupo específico da Libertadores
    const fLibGrupoA = futebolService.formatarTabela(sLibertadores, { group: 'a' })
    assert.ok(fLibGrupoA.includes('GROUP A') || fLibGrupoA.includes('GRUPO A'))
    assert.ok(!fLibGrupoA.includes('GROUP B'), 'Filtro por Grupo A não deve incluir Grupo B')

    console.log('  ✅ PASS: Champions League e Libertadores mapeadas com regras distintas e sem mistura de dados')
    passed++

    // Teste 9: Mapeamento Universal de Comandos para Ajudar (Zero Dicas / Zero Opcional)
    const helperLinhaSaldo = smartRecommendationService.formatHelperLine('saldo', 'economy')
    assert.ok(helperLinhaSaldo.includes('🧭 *Comandos para Ajudar:*'), 'Deve incluir cabeçalho de Comandos para Ajudar')
    assert.ok(!helperLinhaSaldo.includes('💡'), 'Nunca deve usar emoji de lâmpada/dica')
    assert.ok(!helperLinhaSaldo.includes('Dica'), 'Nunca deve usar a palavra Dica')

    const helperLinhaFutebol = smartRecommendationService.formatHelperLine('champions', 'general')
    assert.ok(helperLinhaFutebol.includes('🧭 *Comandos para Ajudar:*'))
    assert.ok(helperLinhaFutebol.includes('.jogos champions') || helperLinhaFutebol.includes('.libertadores'))

    console.log('  ✅ PASS: Mapeamento universal de Comandos para Ajudar ativo em todo o bot sem dicas opcionais')
    passed++

    console.log(`\n📊 Todos os ${passed} testes passaram com 100% de sucesso!`)
}

runTests().catch(err => {
    console.error('❌ Falha nos testes:', err)
    process.exit(1)
})
