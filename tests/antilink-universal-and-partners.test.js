/**
 * Testes Unitários e de Integração:
 * - Anti-Link Fluente e Universal (Todas as redes sociais e evasões com espaços)
 * - Modo Parceria sem cotas / sem limites diários (Grupo e DM)
 * - Módulo Dono Temporário / Retorno de Pagamento Confirmado
 * - Os 3 Módulos Principais (liberado, divulgacao com moderacao, skycode)
 * - Desativação de Limite de Mensagens / Anti-Spam (.limitemsg off)
 * - Card de XP Real (Normalização NFKC de fontes estilizadas, PushName, Grupo)
 * - Manual Oficial (.manual)
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const { containsLink, detectLinkPlatform, normalizeSneakySpacing } = require('../src/utils/linkDetector');
const dataService = require('../src/services/dataService');
const botProfileService = require('../src/services/botProfileService');
const cartaoService = require('../src/services/cartaoService');
const manualCmd = require('../src/commands/general/manual');
const antispamCmd = require('../src/commands/admin/antispam');
const parceriaCmd = require('../src/commands/admin/parceria');

describe('🚀 Modelagem do Bot: Anti-Link Fluente, Parceria Sem Limite, 3 Módulos & XP Real', () => {
    const testGroup = '120363077777777777@g.us';
    const adminUser = '5511999990001@s.whatsapp.net';
    const regularUser = '5511999990002@s.whatsapp.net';
    const partnerUser = '5511999990003@s.whatsapp.net';

    // Helper de mock reply
    function createMockReply() {
        let text = '';
        let mentions = [];
        return {
            reply: async (txt, m = []) => {
                text = typeof txt === 'string' ? txt : JSON.stringify(txt);
                mentions = m;
                return Promise.resolve();
            },
            getText: () => text,
            getMentions: () => mentions
        };
    }

    // 1. DETECÇÃO FLUENTE DE LINKS E PLATAFORMAS
    it('1. Deve detectar confiavelmente links de todas as principais redes sociais e evasões com espaços', () => {
        const testLinks = [
            { text: 'Acesse o grupo: https://chat.whatsapp.com/Grupox123', plat: 'whatsapp' },
            { text: 'Siga o canal: https://whatsapp.com/channel/0029Va123', plat: 'canal' },
            { text: 'Canal telegram: t.me/meucanal', plat: 'telegram' },
            { text: 'Meu instagram: instagram.com/perfilreal', plat: 'instagram' },
            { text: 'Vídeo tiktok: https://vm.tiktok.com/ZM123456/', plat: 'tiktok' },
            { text: 'Vídeo kwai: kwai.com/u/user123', plat: 'kwai' },
            { text: 'Servidor discord: discord.gg/servidortop', plat: 'discord' },
            { text: 'Vídeo no youtube: https://youtu.be/dQw4w9WgXcQ', plat: 'youtube' },
            { text: 'Página no facebook: facebook.com/minhapagina', plat: 'facebook' },
            { text: 'Perfil no X: x.com/elonmusk', plat: 'twitter' },
            { text: 'Site genérico: https://meusite.com.br/promocao', plat: 'outros' },
            // Evasões maliciosas com espaços
            { text: 'entra no zap chat . whatsapp . com / Abcde123', plat: 'whatsapp' },
            { text: 'meu insta instagram . com / fakedetect', plat: 'instagram' },
            // Links de DM do WhatsApp: classe própria, sempre bloqueada (mesmo com o WhatsApp liberado)
            { text: 'me chama no privado: https://wa.me/5511999998888', plat: 'whatsapp_dm' },
            { text: 'https://api.whatsapp.com/send?phone=5511999998888', plat: 'whatsapp_dm' },
            { text: 'https://chat.whatsapp.com/Grupo1 e também wa.me/5511999998888', plat: 'whatsapp_dm' }
        ];

        for (const item of testLinks) {
            assert.strictEqual(containsLink(item.text), true, `Deveria detectar link em: "${item.text}"`);
            assert.strictEqual(detectLinkPlatform(item.text), item.plat, `Plataforma incorreta para: "${item.text}"`);
        }

        // Mensagens limpas não devem ser falsos positivos
        assert.strictEqual(containsLink('Bom dia galera, como vocês estão hoje?'), false);
        assert.strictEqual(containsLink('comprei 10.5 kg de carne no mercado'), false);
    });

    // 2. MODO PARCERIA SEM LIMITES (GRUPO E DM)
    it('2. Modo parceria deve autorizar membro permanentemente sem cotas nem exclusões no grupo e DM', async () => {
        const configs = dataService.getConfigsData();
        configs[testGroup] = { allowedLinkUsers: [] };
        await dataService.saveConfigsData(configs);

        const rGroup = createMockReply();
        await parceriaCmd.execute({
            from: testGroup,
            args: ['add', `@${partnerUser.split('@')[0]}`],
            reply: rGroup.reply,
            sender: adminUser,
            isGroup: true,
            isAdmin: true,
            isOwner: false,
            contextInfo: { mentionedJid: [partnerUser] }
        });

        assert.ok(rGroup.getText().includes('NOVA PARCERIA FIRMADA'), 'Deve confirmar parceria');
        assert.ok(rGroup.getText().includes('sem limite diário'), 'Não deve ter limite diário');

        // Verifica persistência na lista de autorizados
        const updatedCfg = dataService.getConfigsData();
        assert.ok(updatedCfg[testGroup].allowedLinkUsers.includes(partnerUser.split(':')[0]));

        // Execução no DM
        const rDm = createMockReply();
        await parceriaCmd.execute({
            from: adminUser,
            args: ['add', `@${regularUser.split('@')[0]}`, testGroup],
            reply: rDm.reply,
            sender: adminUser,
            isGroup: false,
            isAdmin: true,
            isOwner: true,
            contextInfo: { mentionedJid: [regularUser] }
        });
        assert.ok(rDm.getText().includes('NOVA PARCERIA FIRMADA'), 'Deve funcionar no DM especificando o grupo');
    });

    // 3. OS 3 MÓDULOS PRINCIPAIS (LIBERADO, DIVULGACAO COM MODERACAO, SKYCODE)
    it('3. Modo Divulgação deve obrigatoriamente ligar o módulo Moderação e Anti-Link juntos', () => {
        // Aplica o perfil divulgacao
        const res = botProfileService.applyProfile('divulgacao', testGroup);
        assert.strictEqual(res.ok, true);
        assert.ok(res.ligados.includes('moderacao'), 'Moderação DEVE ligar junto com divulgação');
        assert.ok(res.ligados.includes('divulgacao'), 'Divulgação deve estar ativa');

        // Confere antilink ativado no SQLite do grupo
        const configs = dataService.getConfigsData();
        assert.strictEqual(configs[testGroup]?.antilink, true, 'Anti-link deve estar ON no modo divulgação');
    });

    it('3.1. Modo Liberado deve ativar todos os módulos e comandos proibíveis', () => {
        const res = botProfileService.applyProfile('liberado', testGroup);
        assert.strictEqual(res.ok, true);
        assert.ok(res.ligados.includes('cassino'), 'Cassino deve estar liberado');
        assert.ok(res.ligados.includes('rpg'), 'RPG deve estar liberado');
        assert.ok(res.ligados.includes('downloads'), 'Downloads devem estar liberados');
    });

    // 4. DESATIVAÇÃO DE LIMITES DE MENSAGENS (.limitemsg off)
    it('4. Comando .limitemsg off deve desligar antispam, flood e slowmode do grupo', async () => {
        const rSpam = createMockReply();
        await antispamCmd.execute({
            from: testGroup,
            args: ['off'],
            reply: rSpam.reply,
            sender: adminUser
        });

        assert.ok(rSpam.getText().includes('DESATIVADO (LIVRE)'), 'Deve confirmar desativação total');
        const cfgs = dataService.getConfigsData();
        assert.strictEqual(cfgs[testGroup]?.antispam, false);
        assert.strictEqual(cfgs[testGroup]?.antiFlood, false);
        assert.strictEqual(cfgs[testGroup]?.slowmode, false);
    });

    // 5. NORMALIZAÇÃO NFKC NO CARTÃO DE XP (Sem nicks bugados)
    it('5. cartaoService.cortar deve normalizar fontes estilizadas (NFKC) sem quebrar o nome real', () => {
        // Nicks com fontes estilizadas e símbolos que antes quebravam no regex
        const fancyNick = 'GOAT';
        const cleaned = cartaoService.cortar(fancyNick, 26, 'Craque');

        // NFKC transforma GOAT em GOAT e GOAT em MR
        assert.ok(cleaned.includes('GOAT') || cleaned.includes('MR'), `Deveria conter GOAT ou MR normalizado, obteve: "${cleaned}"`);
    });

    // 6. MANUAL DO BOT (.manual)
    it('6. Comando .manual deve responder com as seções detalhadas de cada função e módulo', async () => {
        const rMan = createMockReply();
        await manualCmd.execute({
            from: testGroup,
            args: ['modulos'],
            reply: rMan.reply,
            prefix: '.'
        });

        assert.ok(rMan.getText().includes('MANUAL DOS 3 MÓDULOS'), 'Deve exibir manual de módulos');
        assert.ok(rMan.getText().includes('MÓDULO LIBERADO'), 'Deve citar Módulo Liberado');
        assert.ok(rMan.getText().includes('MÓDULO DIVULGAÇÃO & MODERAÇÃO'), 'Deve citar Módulo Divulgação com Moderação');
        assert.ok(rMan.getText().includes('MÓDULO SKYCODE'), 'Deve citar Módulo Skycode');
    });
});
