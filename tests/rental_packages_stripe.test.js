// Banco de teste separado: sem isto o teste gravava no data/database.sqlite real
// (agendamentos de fechamento, usuários falsos).
process.env.NODE_ENV = 'test'
const assert = require('assert')
const rentalPackages = require('../src/services/payments/rentalPackagesService')

console.log('--- Testes de Gerenciamento de Pacotes de Aluguel & Stripe ---')

// 1. Leitura inicial
const pacotes = rentalPackages.getPacotes()
assert(Array.isArray(pacotes) && pacotes.length >= 11, 'Deve conter pelo menos 11 pacotes padrão')
console.log('  ✅ PASS: getPacotes retorna lista padrão com sucesso')

// 2. Busca de pacote
const g1 = rentalPackages.getPacote('g1')
assert(g1 && g1.id === 'g1' && g1.escopo === 'Grupo', 'Deve encontrar pacote g1')
console.log('  ✅ PASS: getPacote busca por id corretamente')

// 3. Alteração de preço
const novoPreco = '19.90'
rentalPackages.setPreco('g1', novoPreco).then(async res => {
    assert.strictEqual(res.pacote.centavos, 1990, 'Deve converter R$ 19,90 para 1990 centavos')
    const g1Atualizado = rentalPackages.getPacote('g1')
    assert.strictEqual(g1Atualizado.centavos, 1990, 'Deve persistir no banco')
    console.log('  ✅ PASS: setPreco atualiza e persiste novo preço')

    // 4. Criação de novo plano
    const novoPlano = await rentalPackages.addPlano({
        id: 'g99',
        escopo: 'Grupo',
        nome: 'Plano Teste 99',
        dias: 99,
        valor: '99.90'
    })
    assert(novoPlano && novoPlano.pacote.id === 'g99', 'Deve criar pacote g99')
    assert.strictEqual(novoPlano.pacote.centavos, 9990, 'Valor em centavos deve ser 9990')
    console.log('  ✅ PASS: addPlano cria novo pacote com sucesso')

    // 5. Exclusão de plano
    rentalPackages.delPlano('g99')
    assert.strictEqual(rentalPackages.getPacote('g99'), null, 'g99 deve ter sido excluído')
    console.log('  ✅ PASS: delPlano remove pacote do catálogo')

    // 6. Restauração de padrões
    rentalPackages.resetPacotes()
    const g1Restaurado = rentalPackages.getPacote('g1')
    assert.strictEqual(g1Restaurado.centavos, 1500, 'g1 deve voltar para 1500 centavos')
    console.log('  ✅ PASS: resetPacotes restaura valores padrão de fábrica')

    console.log('\n========================================')
    console.log('📊 RESULTADO PACOTES & STRIPE: TODOS PASSARAM ✅')
    console.log('========================================\n')
    process.exit(0)
}).catch(err => {
    console.error('❌ Falha:', err)
    process.exit(1)
})

