/**
 * BotXP — Automated Test Suite: UI Engine, SQLite Repositories & API Service
 */

// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require('assert');
const { renderCard, renderProgressBar, formatNumber, formatCoins, formatCompact } = require('../src/utils/uiEngine');
const { recordTransaction, getUserTransactions } = require('../src/database/repositories/transactionRepository');
const { recordCommandUsage, getTopCommands, getTotalExecutions } = require('../src/database/repositories/analyticsRepository');
const { getAllTitles, getTitleById, unlockUserTitle, getUserTitles } = require('../src/database/repositories/titleRepository');
const { gerarQrCodeUrl } = require('../src/services/apiService');
const { getDatabase } = require('../src/database/connection');
const { runMigrations } = require('../src/database/migrator');

console.log('🧪 Iniciando testes do UI Engine, SQLite Repositories & API Service...\n');

// 1. Executa Migrações
const db = getDatabase();
runMigrations(db);

// 2. Testes de UI Engine
console.log('--- 1. UI Engine & Card Formatter ---');
const bar = renderProgressBar(50, 100, 10, 'green');
assert(bar.includes('50%'), 'Barra de progresso deve conter 50%');
console.log('  ✅ PASS: renderProgressBar gera barras gráficas proporcionais');

const coinsStr = formatCoins(1500000);
assert.strictEqual(coinsStr, '1.500.000 moedas', 'Formatação de moedas deve ter separadores brasileiros e a palavra moedas');
assert.strictEqual(formatCoins(1), '1 moeda', 'Uma moeda no singular');
console.log('  ✅ PASS: formatCoins formata valores monetários com separadores pt-BR');

const card = renderCard({
    title: 'TESTE DE CARD',
    icon: '⚔️',
    sections: [
        {
            title: 'DADOS DO GUERREIRO',
            icon: '👤',
            fields: [
                { label: 'Nome', value: 'GOAT', icon: '👑' },
                { label: 'Poder de Combate', value: '15.000 CP', icon: '⚡' }
            ]
        }
    ],
    tip: 'Dica de teste'
});
// Títulos em CAIXA ALTA viram frase no renderCard (siglas e nomes próprios ficam).
assert(card.includes('Teste de card'), 'Card deve conter o título');
assert(card.includes('GOAT'), 'Card deve conter o nome formatado');
console.log('  ✅ PASS: renderCard produz layouts Unicode completos');

// 3. Testes de Transaction Repository
console.log('\n--- 2. Transaction Repository (SQLite) ---');
const testUser = '5511999990001@s.whatsapp.net';
recordTransaction({
    userJid: testUser,
    type: 'PIX TESTE',
    amount: 500,
    balanceAfter: 1500,
    description: 'Teste de auditoria'
});

const txs = getUserTransactions(testUser, 5);
assert(txs.length > 0, 'Deve retornar ao menos 1 transação');
assert(txs[0].type === 'PIX TESTE', 'Tipo da transação deve ser PIX TESTE');
assert(txs[0].amount === 500, 'Valor deve ser 500');
console.log('  ✅ PASS: recordTransaction e getUserTransactions registram e consultam histórico');

// 4. Testes de Analytics Repository
console.log('\n--- 3. Command Analytics Repository (SQLite) ---');
recordCommandUsage('play', 'media');
recordCommandUsage('play', 'media');
recordCommandUsage('saldo', 'economy');

const top = getTopCommands(5);
assert(top.length > 0, 'Top comandos deve conter registros');
const totalExecs = getTotalExecutions();
assert(totalExecs > 0, 'Total de execuções deve ser maior que 0');
console.log('  ✅ PASS: recordCommandUsage e getTopCommands registram telemetria ao vivo');

// 5. Testes de Title Repository
console.log('\n--- 4. Title Repository (RPG & Achievements) ---');
const titles = getAllTitles();
assert(titles.length >= 6, 'Catálogo deve conter ao menos 6 títulos padrão');

unlockUserTitle(testUser, 'iniciante');
const myTitles = getUserTitles(testUser);
assert(myTitles.length > 0, 'Usuário deve possuir o título iniciante desbloqueado');
assert(myTitles.some(t => t.id === 'iniciante'), 'Título deve ser o iniciante');
console.log('  ✅ PASS: getAllTitles, unlockUserTitle e getUserTitles gerenciam títulos RPG');

// 6. Testes de API Service
console.log('\n--- 5. API Service (QR Code Generator) ---');
const qr = gerarQrCodeUrl('https://goat-bot.com');
assert(qr.includes('api.qrserver.com'), 'URL de QR Code deve ser gerada');
console.log('  ✅ PASS: gerarQrCodeUrl gera URLs válidas para renderização');

console.log('\n========================================');
console.log('📊 RESULTADO DOS NOVOS TESTES:');
console.log('   ✅ Todas as asserções passaram com sucesso!');
console.log('========================================\n');
