/**
 * Testes Abrangentes: Hierarquia Estrita de Módulos (Pais e Filhos) e Isolamento entre Árvores
 * GOATBOT // GOAT Prime
 */

const assert = require('assert');
const moduleState = require('../src/services/moduleStateService');
const botProfile = require('../src/services/botProfileService');
const { HIERARCHY_TREES, PROFILES, secaoDoModulo } = require('../src/config/botProfiles');
const configRepo = require('../src/database/repositories/configRepository');

describe('🌳 Hierarquia de Módulos (Pais e Filhos) & Isolamento entre Árvores', () => {
    const testGroup = '120363088888888888@g.us';
    const testPv = moduleState.PV_SCOPE;

    beforeEach(() => {
        moduleState.disableAll(testGroup);
        moduleState.disableAll(testPv);
    });

    it('1. Deve possuir exatamente 3 árvores principais (skycode, divulgacao, liberado)', () => {
        const trees = Object.keys(HIERARCHY_TREES);
        assert.deepStrictEqual(trees.sort(), ['divulgacao', 'liberado', 'skycode'].sort());
        assert.strictEqual(PROFILES.length, 3, 'Devem existir exatamente 3 perfis principais');
    });

    it('2. Ativar o PAI "skycode" deve ativar todos os filhos em cascata e ISOLAR divulgação', () => {
        // Ativa o pai skycode
        const res = moduleState.setModule('skycode', true, testGroup);
        assert.strictEqual(res.ok, true);
        assert.strictEqual(res.isParent, true);
        assert.strictEqual(res.parent, 'skycode');

        // Filhos de skycode devem estar ON
        for (const child of HIERARCHY_TREES.skycode.children) {
            assert.strictEqual(
                moduleState.isModuleEnabled(child, testGroup),
                true,
                `Filho ${child} da árvore skycode deve estar ON`
            );
        }

        // Módulos da árvore divulgacao NUNCA podem ligar junto (isolamento estrito)
        for (const divChild of HIERARCHY_TREES.divulgacao.children) {
            assert.strictEqual(
                moduleState.isModuleEnabled(divChild, testGroup),
                false,
                `Módulo ${divChild} da árvore divulgação deve permanecer OFF no modo skycode`
            );
        }

        // Módulos de entretenimento também devem estar OFF
        assert.strictEqual(moduleState.isModuleEnabled('cassino', testGroup), false);
        assert.strictEqual(moduleState.isModuleEnabled('rpg', testGroup), false);
    });

    it('3. Ativar o PAI "divulgacao" deve ativar moderação e mensagens-grupo em cascata e ISOLAR skycode', () => {
        // Ativa o pai divulgacao
        const res = moduleState.setModule('divulgacao', true, testGroup);
        assert.strictEqual(res.ok, true);
        assert.strictEqual(res.isParent, true);
        assert.strictEqual(res.parent, 'divulgacao');

        // Filhos de divulgação devem estar ON (divulgacao, moderacao, mensagens-grupo)
        for (const child of HIERARCHY_TREES.divulgacao.children) {
            assert.strictEqual(
                moduleState.isModuleEnabled(child, testGroup),
                true,
                `Filho ${child} da árvore divulgacao deve estar ON`
            );
        }

        // Anti-link universal deve ter sido ativado automaticamente no grupo
        const cfg = configRepo.getConfig(testGroup);
        assert.strictEqual(cfg.antilink, true, 'Anti-link deve estar ON');
        assert.strictEqual(cfg.antilinkConfig?.action, 'ban', 'Ação do anti-link deve ser ban');

        // Módulos da árvore skycode NUNCA podem ligar junto (tipo divulgação não liga modulo skycode)
        for (const skyChild of HIERARCHY_TREES.skycode.children) {
            assert.strictEqual(
                moduleState.isModuleEnabled(skyChild, testGroup),
                false,
                `Módulo ${skyChild} da árvore skycode deve permanecer OFF no modo divulgacao`
            );
        }

        // Módulos de cassino/rpg também isolados
        assert.strictEqual(moduleState.isModuleEnabled('cassino', testGroup), false);
        assert.strictEqual(moduleState.isModuleEnabled('rpg', testGroup), false);
    });

    it('4. Ativar o PAI "liberado" deve ativar todos os módulos proibíveis sem travas', () => {
        const res = moduleState.setModule('liberado', true, testGroup);
        assert.strictEqual(res.ok, true);

        assert.strictEqual(moduleState.isModuleEnabled('cassino', testGroup), true, 'Cassino deve estar ON');
        assert.strictEqual(moduleState.isModuleEnabled('rpg', testGroup), true, 'RPG deve estar ON');
        assert.strictEqual(moduleState.isModuleEnabled('jogos', testGroup), true, 'Jogos deve estar ON');
        assert.strictEqual(moduleState.isModuleEnabled('downloads', testGroup), true, 'Downloads deve estar ON');
        assert.strictEqual(moduleState.isModuleEnabled('figurinhas', testGroup), true, 'Figurinhas deve estar ON');
        assert.strictEqual(moduleState.isModuleEnabled('ia', testGroup), true, 'IA deve estar ON');
        assert.strictEqual(moduleState.isModuleEnabled('owner', testGroup), false, 'Owner nunca entra em perfil');
    });

    it('5. Desativar o PAI deve desativar todos os seus filhos em cascata', () => {
        // Primeiro ativa skycode
        moduleState.setModule('skycode', true, testGroup);
        assert.strictEqual(moduleState.isModuleEnabled('dev', testGroup), true);

        // Desativa skycode
        moduleState.setModule('skycode', false, testGroup);
        for (const child of HIERARCHY_TREES.skycode.children) {
            assert.strictEqual(
                moduleState.isModuleEnabled(child, testGroup),
                false,
                `Filho ${child} de skycode deve ter sido desligado em cascata`
            );
        }
    });

    it('6. secaoDoModulo deve indicar corretamente a hierarquia pai de cada módulo', () => {
        const secDev = secaoDoModulo('dev');
        assert.strictEqual(secDev.pai, 'skycode');
        assert.strictEqual(secDev.perfil, 'skycode');
        assert.ok(secDev.secao.includes('Skycode'));

        const secMod = secaoDoModulo('moderacao');
        assert.strictEqual(secMod.pai, 'divulgacao');
        assert.strictEqual(secMod.perfil, 'divulgacao');
        assert.ok(secMod.secao.includes('Divulgação'));

        const secCassino = secaoDoModulo('cassino');
        assert.strictEqual(secCassino.pai, 'liberado');
        assert.strictEqual(secCassino.perfil, 'liberado');
        assert.ok(secCassino.secao.includes('Liberado'));
    });

    it('7. enableExclusiveHierarchy deve ativar exclusivamente a árvore selecionada', () => {
        // Ativação solo de divulgacao
        const resDiv = moduleState.enableExclusiveHierarchy('divulgacao', testGroup);
        assert.strictEqual(resDiv.ok, true);
        assert.strictEqual(moduleState.isModuleEnabled('divulgacao', testGroup), true);
        assert.strictEqual(moduleState.isModuleEnabled('moderacao', testGroup), true);
        assert.strictEqual(moduleState.isModuleEnabled('mensagens-grupo', testGroup), true);
        assert.strictEqual(moduleState.isModuleEnabled('skycode', testGroup), false);
        assert.strictEqual(moduleState.isModuleEnabled('dev', testGroup), false);

        // Ativação solo de skycode
        const resSky = moduleState.enableExclusiveHierarchy('skycode', testGroup);
        assert.strictEqual(resSky.ok, true);
        assert.strictEqual(moduleState.isModuleEnabled('skycode', testGroup), true);
        assert.strictEqual(moduleState.isModuleEnabled('dev', testGroup), true);
        assert.strictEqual(moduleState.isModuleEnabled('livros', testGroup), true);
        assert.strictEqual(moduleState.isModuleEnabled('divulgacao', testGroup), false);
        assert.strictEqual(moduleState.isModuleEnabled('moderacao', testGroup), false);
    });

    it('8. Comando .modulo deve responder exibindo a hierarquia e cascata', async () => {
        const moduloCmd = require('../src/commands/owner/modulo');
        let replyTxt = '';
        const mockReply = (text) => { replyTxt = typeof text === 'string' ? text : JSON.stringify(text); };

        // Teste: ativar hierarquia divulgacao via comando
        await moduloCmd.execute({
            args: ['on', 'divulgacao'],
            reply: mockReply,
            prefix: '.',
            from: testGroup,
            isGroup: true,
            isOwner: true
        });

        assert.ok(replyTxt.toUpperCase().includes('ATIVADA EM CASCATA'), 'Deve reportar ativação em cascata');
        assert.ok(replyTxt.toUpperCase().includes('ISOLAMENTO ENTRE HIERARQUIAS'), 'Deve destacar isolamento entre árvores');
    });
});
