const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .trust
 * Gerencia a lista de usuários de confiança (TRUSTED)
 */

const { permissionRepo, ROLES } = require('../../services/permissionService');
const logger = require('../../core/logger');
const F = require('../../utils/formato');

module.exports = {
    name: 'trust',
    aliases: ['confiar', 'untrust', 'trusted'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Coloca ou tira pessoas da minha lista de confiança',
    usage: '<@pessoa [anotação] | off @pessoa | list>',
    examples: [
        '@pessoa Ajuda na moderação — adiciona com uma anotação',
        'off @pessoa — tira da lista de confiança',
        'list — mostra quem está na lista'
    ],
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ sender, args, reply, info, commandName = '', prefix = '.' }) => {
        const sub = args[0]?.toLowerCase();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Admin";

        if (sub === 'list' || sub === 'lista') {
            const list = permissionRepo.getAllTrusted();
            if (list.length === 0) {
                return reply(F.tela({
                    emoji: '🤝',
                    titulo: 'Lista de confiança vazia',
                    intro: 'Ainda não há ninguém de confiança. Aqui apareceria cada pessoa com a anotação e quem a adicionou.',
                    dica: 'Pessoas de confiança ganham um cargo acima do usuário comum nas minhas permissões.',
                    proximos: [{ nome: 'trust', args: '@pessoa anotação', oque: 'adiciona alguém à lista' }],
                    prefix
                }));
            }

            const linhas = [];
            list.forEach((item, i) => {
                linhas.push(`*${i + 1}.* ${nomeDoMembro(item.jid)}`);
                linhas.push(`   ${F.campo('Anotação', item.notes || 'sem anotação')}`);
                linhas.push(`   ${F.campo('Adicionado por', `${nomeDoMembro(String(item.added_by || ''))}`)}`);
            });

            const mentions = list.map(item => item.jid);
            return reply(F.tela({
                emoji: '🤝',
                titulo: `Pessoas de confiança: ${list.length}`,
                intro: 'Estas pessoas têm o cargo de confiança nas minhas permissões.',
                secoes: [{ emoji: '📋', titulo: 'Lista', linhas }],
                proximos: [
                    { nome: 'trust', args: '@pessoa anotação', oque: 'adiciona mais alguém' },
                    { nome: 'trust', args: 'off @pessoa', oque: 'tira alguém da lista' }
                ],
                prefix
            }), mentions);
        }

        // Pelo nome digitado (vale com qualquer prefixo), não pelo texto cru
        // começar com ".untrust". Em ".untrust 5511..." o número é args[0];
        // em ".trust off 5511..." é args[1].
        const viaUntrust = String(commandName).toLowerCase() === 'untrust';
        const viaSub = sub === 'off' || sub === 'remover';
        const isUntrust = viaUntrust || viaSub;
        const targetIndex = viaSub ? 1 : 0;

        let targetJid = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!targetJid && args[targetIndex]) {
            const cleanNum = args[targetIndex].replace(/[@+\s-]/g, '');
            if (cleanNum.length >= 8) {
                targetJid = `${cleanNum}@s.whatsapp.net`;
            }
        }

        if (!targetJid) {
            return reply(F.tela({
                emoji: '🤝',
                titulo: 'Lista de confiança',
                intro: 'Diga quem devo colocar ou tirar da lista: marque a pessoa ou mande o número.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'trust', '@pessoa Ajuda na moderação')} — adiciona`,
                        `• ${F.cmd(prefix, 'trust', 'off @pessoa')} — remove`,
                        `• ${F.cmd(prefix, 'trust', 'list')} — mostra a lista`
                    ]
                }],
                prefix
            }));
        }

        const targetNum = targetJid.split('@')[0].split(':')[0];

        if (isUntrust) {
            permissionRepo.setTrusted(targetJid, false);
            permissionRepo.removeUserRole(targetJid);
            logger.info(`[TRUST] ${sender} removeu ${targetJid} da lista de confiança`);

            return reply(F.tela({
                emoji: '🔻',
                titulo: 'Saiu da lista de confiança',
                intro: `@${targetNum} voltou a ser um usuário comum.`,
                secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Removido por', `${nomeDoMembro(sender)}`)] }],
                proximos: [{ nome: 'trust', args: '@pessoa', oque: 'coloca de volta' }],
                prefix
            }), [targetJid, sender]);
        }

        const notes = args.slice(1).join(' ') || 'Adicionado à lista de confiança';
        permissionRepo.setTrusted(targetJid, true, sender, notes);
        permissionRepo.setUserRole(targetJid, 'TRUSTED', sender);
        logger.info(`[TRUST] ${sender} adicionou ${targetJid} como TRUSTED`);

        await reply(F.tela({
            emoji: '⭐',
            titulo: 'Pessoa de confiança adicionada',
            intro: `@${targetNum} agora tem o cargo de confiança nas minhas permissões.`,
            secoes: [{
                emoji: '📋',
                titulo: 'Detalhes',
                linhas: [
                    F.campo('Anotação', notes),
                    F.campo('Adicionado por', `${nomeDoMembro(sender)}`)
                ]
            }],
            proximos: [
                { nome: 'trust', args: 'off @pessoa', oque: 'tira da lista' },
                { nome: 'trust', args: 'list', oque: 'vê a lista completa' }
            ],
            prefix
        }), [targetJid, sender]);
    }
};
