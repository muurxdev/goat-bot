/**
 * Testes Unitários: Fase 5 (Mídia, Áudio FFmpeg, IA Personas, Fontes & Trivias)
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const audioFilterService = require('../src/services/audioFilterService');
const aiPersonaService = require('../src/services/aiPersonaService');
const textTransformService = require('../src/services/textTransformService');
const triviaService = require('../src/services/triviaService');

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
    console.log('🧪 Iniciando testes da Fase 5 (Mídia, IA, Fontes e Trivias)...\n');

    await test('audioFilterService possui catálogo com mais de 20 filtros', () => {
        const filters = audioFilterService.listFilters();
        assert(filters.length >= 20, `Esperava >= 20 filtros, obteve ${filters.length}`);
        const bass = audioFilterService.getFilter('bassboost');
        assert(bass && bass.filter.includes('equalizer'), 'Filtro bassboost inválido');
        const slow = audioFilterService.getFilter('slowed');
        assert(slow && slow.filter.includes('atempo'), 'Filtro slowed inválido');
    });

    await test('audioFilterService.explainFilter gera documentação técnica', () => {
        const doc = audioFilterService.explainFilter('nightcore');
        assert(doc.toUpperCase().includes('NIGHTCORE PITCH'), 'Documentação não incluiu o nome correto');
        assert(doc.toUpperCase().includes('ESPECIFICAÇÕES TÉCNICAS'), 'Documentação ausente');
    });

    await test('aiPersonaService lista e recupera personas de Saga e profissionais', () => {
        const goat = aiPersonaService.getPersona('goat');
        assert(goat && goat.name.includes('GOAT'), 'GOAT não encontrado');
        const heroi = aiPersonaService.getPersona('heroi');
        assert(heroi && heroi.name.includes('Herói'), 'Herói não encontrado');
        const advogado = aiPersonaService.getPersona('advogado');
        assert(advogado && advogado.category === 'profissional', 'Persona de advogado inválida');
    });

    await test('textTransformService converte textos para múltiplas fontes unicode e cifras', () => {
        const fraktur = textTransformService.toUnicodeFont('GOAT', 'gothic');
        // Rebrand: o texto de entrada já era GOAT; a saída esperada acompanha (antes era 𝔐𝔢𝔩𝔦𝔬𝔡𝔞𝔰 de "Meliodas").
        assert.strictEqual(fraktur, '𝔊𝔒𝔄𝔗');

        const script = textTransformService.toUnicodeFont('Bot', 'cursive');
        assert.strictEqual(script, 'ℬℴ𝓉');

        const upsideDown = textTransformService.toUpsideDown('abc');
        assert.strictEqual(upsideDown, 'ɔqɐ');

        const binary = textTransformService.toBinary('A');
        assert.strictEqual(binary, '01000001');

        const caesar = textTransformService.toCaesar('ABC', 3);
        assert.strictEqual(caesar, 'DEF');
    });

    await test('triviaService fornece perguntas aleatórias e registra respostas com persistência', () => {
        const q = triviaService.getRandomQuestion('saga');
        assert(q && q.q && q.opts.length === 4, 'Pergunta de Saga inválida');

        const testJid = 'test_user_trivia@s.whatsapp.net';
        const res = triviaService.submitAnswer(testJid, 'saga', true, { coins: 100, xp: 150 });
        assert(res.totalPlayed >= 1, 'Total de partidas não incrementou');
        assert(res.streak >= 1, 'Streak não incrementou');

        const stats = triviaService.getUserStats(testJid);
        assert(stats.total_correct >= 1, 'Total de acertos não gravado no banco');
    });

    await test('triviaService registra resultados de minigames no banco', () => {
        const testJid = 'test_user_game@s.whatsapp.net';
        const res = triviaService.recordGameResult(testJid, 'dado_d20', 'win', 20);
        assert(res.wins >= 1, 'Vitória não registrada');
        assert(res.highScore >= 20, 'High score não registrado');

        const leader = triviaService.getGameLeaderboard('dado_d20', 5);
        assert(leader.length >= 1, 'Leaderboard de minigames vazio');
    });

    console.log(`\n📊 Resultado Fase 5: ✅ ${pass}  ❌ ${fail}`);
    if (fail > 0) process.exit(1);
}

runTests();
