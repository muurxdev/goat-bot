/**
 * Comando .warn / .advertir / .aviso
 * Aplica advertência com contador, descrição de motivo e remoção automática ao atingir o limite
 */

const dataService = require('../../services/dataService');
const groupRemovalService = require('../../services/groupRemovalService');
const figurinhaEventoService = require('../../services/figurinhaEventoService');
const audioEventoService = require('../../services/audioEventoService');
const logger = require('../../core/logger');

/** Texto da advertência — o mesmo na prévia e na aplicação real. */
function textoAdvertencia({ alvoNum, autorNum, total, limite, motivo }) {
    let t = `⚠️ @${alvoNum} recebeu uma advertência: *${total} de ${limite}*.\n\n`;
    t += `*Motivo:* ${motivo}\n`;
    t += `*Aplicada por:* @${autorNum}`;
    return t;
}

module.exports = {
    name: 'warn',
    aliases: ["advertir","aviso","advertencia","adicionaraviso","cmd_warn","alt_warn","atalho_warn","abrev_warn","call_warn","func_warn"],
    category: 'admin',
    description: 'Aplica advertência a um membro com motivo e expulsão ao atingir o limite do grupo',
    usage: '<@pessoa> [motivo]',
    examples: ['@fulano Spam — adverte com motivo', 'limit 5 — muda o limite do grupo', 'strict on — vale também para administradores'],
    groupOnly: true,
    adminOnly: true,
    execute: async ({ info, from, sender, isBotAdmin, client, reply, mentioned, args = [], prefix = '.' }) => {
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const warnLimit = configs[from].warnLimit || 3;
        const isStrict = Boolean(configs[from].strictModeration);

        const sub = (args?.[0] || "").toLowerCase().trim();
        const param = (args?.[1] || "").trim();

        // 1. Configuração de Limite (.warn limit <número>)
        if (sub === 'limit' || sub === 'limite' || sub === 'max') {
            const novoLimite = parseInt(param, 10);
            if (isNaN(novoLimite) || novoLimite < 1 || novoLimite > 20) {
                return reply(`⚠️ O limite precisa ser um número de 1 a 20. Exemplo: \`${prefix}warn limit 3\``);
            }

            configs[from].warnLimit = novoLimite;
            await dataService.saveConfigsData(configs);
            return reply(`✅ Pronto: com *${novoLimite} advertências*, a pessoa é removida do grupo automaticamente.`);
        }

        // 2. Configuração de Moderação Estrita (.warn strict on/off)
        if (sub === 'strict' || sub === 'estrito' || sub === 'geral') {
            const enable = ['on', '1', 'ativar', 'sim'].includes(param.toLowerCase());
            const disable = ['off', '0', 'desativar', 'nao'].includes(param.toLowerCase());

            if (enable || disable) {
                configs[from].strictModeration = enable;
                await dataService.saveConfigsData(configs);
                return reply(enable
                    ? "🛡️ Modo estrito *ligado*: as advertências automáticas agora valem para todos, inclusive admins. Só os meus donos ficam de fora."
                    : "🛡️ Modo estrito *desligado*: admins do grupo não recebem advertências automáticas.");
            }

            return reply(`💡 Use \`${prefix}warn strict on\` para as regras valerem também para admins, ou \`${prefix}warn strict off\` para liberar.`);
        }

        // 3. PREVIEW: Simulação de advertência
        if (sub === "preview" || sub === "teste" || sub === "test" || sub === "ver") {
            const senderNum = sender.split("@")[0].split(":")[0];

            let prev = `👀 *Prévia da advertência*\n\n`;
            prev += textoAdvertencia({ alvoNum: senderNum, autorNum: senderNum, total: 2, limite: warnLimit, motivo: "spam ou desrespeito às regras" });
            prev += `\n\nCom ${warnLimit} advertências, a remoção do grupo é automática.\n`;
            prev += `*Modo estrito:* ${isStrict ? "ligado (vale para admins)" : "desligado (só membros)"}`;

            return reply(prev, [sender]);
        }

        // 4. Aplicação de Advertência
        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
        let warned = mentioned || quotedParticipant;

        // Se não tiver mention ou quote, tenta extrair número do primeiro argumento
        if (!warned && args.length > 0) {
            const candidate = args[0].replace(/[@\s]/g, "").replace(/\D/g, "");
            if (candidate.length >= 8) {
                warned = candidate + "@s.whatsapp.net";
            }
        }

        if (!warned) {
            let guide = `⚠️ *Advertências*\n\n`;
            guide += `*Limite do grupo:* ${warnLimit} advertências\n`;
            guide += `*Modo estrito:* ${isStrict ? "ligado (vale para admins)" : "desligado (só membros)"}\n\n`;
            guide += `• \`${prefix}warn @pessoa [motivo]\` — advertir\n`;
            guide += `• \`${prefix}warn limit <n>\` — mudar o limite (padrão 3)\n`;
            guide += `• \`${prefix}warn strict on/off\` — valer ou não para admins\n`;
            guide += `• \`${prefix}limparavisos @pessoa\` — zerar as advertências de alguém\n`;
            guide += `• \`${prefix}limparavisos all\` — zerar as do grupo todo\n`;
            guide += `• \`${prefix}warnings @pessoa\` — ver as advertências`;

            return reply(guide);
        }

        // Extrai motivo personalizado ou utiliza padrão
        let reason = 'descumprimento das regras do grupo';
        const reasonParts = args.filter(a => !a.startsWith('@') && !a.includes('@s.whatsapp.net') && !/^\d{8,}$/.test(a));
        if (reasonParts.length > 0) {
            reason = reasonParts.join(' ').trim();
        }

        const warns = dataService.getWarnsData();
        warns[warned] = (warns[warned] || 0) + 1;
        const totalWarns = warns[warned];
        await dataService.saveWarnsData(warns);

        const targetNum = warned.split('@')[0].split(':')[0];
        const senderNum = sender.split('@')[0].split(':')[0];

        logger.info(`[WARN] Admin ${sender} advertiu ${warned} (${totalWarns}/${warnLimit}) por: ${reason}`);

        let doc = textoAdvertencia({ alvoNum: targetNum, autorNum: senderNum, total: totalWarns, limite: warnLimit, motivo: reason });

        let figurinha = 'advertencia';
        if (totalWarns >= warnLimit) {
            const resultado = await groupRemovalService.removerMembro(client, from, warned, { origem: 'warn' });
            if (resultado.ok) {
                figurinha = 'banimento';
                warns[warned] = 0;
                await dataService.saveWarnsData(warns);
                doc += `\n\n@${targetNum} chegou a ${warnLimit} advertências e foi removido do grupo.`;
            } else {
                doc += `\n\n@${targetNum} chegou a ${warnLimit} advertências.\n\n${groupRemovalService.mensagemFalha(resultado.motivo, warned)}`;
            }
        } else {
            const restantes = warnLimit - totalWarns;
            doc += `\n\n${restantes === 1 ? 'Mais 1 advertência leva' : `Mais ${restantes} advertências levam`} à remoção automática do grupo. Para consultar: \`${prefix}warnings @${targetNum}\``;
        }

        await client.sendMessage(from, {
            text: doc,
            mentions: [warned, sender]
        });
        await figurinhaEventoService.enviar(client, from, figurinha);
        await audioEventoService.enviar(client, from, figurinha);
    }
};
