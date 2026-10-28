/**
 * Testes Unitários: Fase 6 (Conquistas, Badges, Busca Universal e Catálogo 10.000)
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const badgeService = require('../src/services/badgeService');
const searchService = require('../src/services/commandSearchService');

let pass = 0, fail = 0;
async function test(name, fn) {
    try {
        await fn();
        console.log(`  ✅ PASS: ${name}`);
        pass++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}\n     ${e.message}`);
        fail++;
    }
}

async function runTests() {
    console.log('🧪 Testando Fase 6 (Conquistas, Badges, Busca Universal e Total 10K)...\n');

    await test('badgeService gerencia catálogo de conquistas e títulos', () => {
        const badges = badgeService.listBadges();
        assert(badges.length >= 10, 'Esperava >= 10 badges principais');
        const b = badgeService.getBadge('primeiro_milhao');
        assert(b && b.tier === 'Raro', 'Badge primeiro_milhao inválida');
    });

    await test('badgeService desbloqueia conquistas e salva no usuário', () => {
        const testJid = `test_user_badge_${Date.now()}@s.whatsapp.net`;
        const res = badgeService.unlockBadge(testJid, 'lenda_dos_dez_mil');
        assert(res.success, 'Falha ao desbloquear badge: ' + (res.reason || ''));
        const userBadges = badgeService.getUserBadges(testJid);
        assert(userBadges.includes('lenda_dos_dez_mil'), 'Badge não gravada no usuário');

        const showcase = badgeService.renderShowcase(testJid);
        assert(showcase.toUpperCase().includes('VITRINE DE CONQUISTAS'), 'Showcase não gerado corretamente');
    });

    await test('commandSearchService totaliza exatamente 10.000 comandos canônicos', () => {
        const stats = searchService.getCatalogStats();
        assert.strictEqual(stats.totalCommands, 10000, `Esperava 10.000 comandos, obteve ${stats.totalCommands}`);
        assert(stats.totalAliases >= 8000, `Esperava >= 8000 aliases, obteve ${stats.totalAliases}`);
        assert(stats.totalTriggers >= 18000, `Esperava >= 18000 triggers invocáveis`);
    });

    await test('commandSearchService realiza busca instantânea de comandos por termo', () => {
        const results = searchService.searchCommands('bolsa', 5);
        assert(results.length > 0, 'Nenhum resultado para busca "bolsa"');
        assert(results.some(r => r.name.includes('bolsa') || r.category === 'economy'), 'Resultado irrelevante');

        const searchIA = searchService.searchCommands('goat', 3);
        assert(searchIA.length > 0, 'Nenhum resultado para "goat"');
    });

    await test('commandSearchService fornece sugestões inteligentes por intenção', () => {
        const sugMusica = searchService.suggestCommands('quero ouvir musica');
        assert.strictEqual(sugMusica.topic, 'musica');
        assert(sugMusica.commands.includes('play'), 'Sugestão não incluiu play');

        const sugDinheiro = searchService.suggestCommands('como ganhar dinheiro');
        assert.strictEqual(sugDinheiro.topic, 'dinheiro');
    });

    console.log(`\n📊 Resultado Fase 6: ✅ ${pass}  ❌ ${fail}`);
    if (fail > 0) process.exit(1);
}

runTests();
