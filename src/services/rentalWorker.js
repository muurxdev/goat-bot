/**
 * Rental Worker Service
 *
 * Monitor ativo de expiração de aluguéis de grupos e conversas privadas.
 * Executa varreduras periódicas a cada 60s, emitindo avisos de 24h e 1h antes
 * do término e realizando a saída/bloqueio automático quando o prazo esgota.
 */

const rentalRepo = require('../database/repositories/rentalRepository');
const logger = require('../core/logger');
const env = require('../config/env');

let workerInterval = null;
let globalClient = null;

const CHECK_INTERVAL_MS = 60 * 1000; // 60 segundos
const TIMEZONE = env.botTimezone || 'America/Sao_Paulo';

function formatLocalTime(timestamp) {
    try {
        return new Date(timestamp).toLocaleString('pt-BR', { timeZone: TIMEZONE });
    } catch (_) {
        return new Date(timestamp).toISOString();
    }
}

/**
 * Executa uma rodada de verificação em todos os aluguéis ativos
 */
async function checkRentals() {
    try {
        const activeRentals = rentalRepo.getActiveNonLifetimeRentals();
        if (!activeRentals || activeRentals.length === 0) return;

        const now = Date.now();
        const client = globalClient;

        for (const rental of activeRentals) {
            const jid = rental.targetJid || rental.groupJid;
            const remainingMs = rental.expiresAt - now;

            // 1. CASO: ALUGUEL EXPIRADO
            if (remainingMs <= 0) {
                logger.warn(`[RENTAL WORKER] Aluguel do grupo/conversa ${jid} EXPIRADO (${formatLocalTime(rental.expiresAt)}). Encerrando serviço.`);

                // Atualiza banco para desativar
                rental.isActive = false;
                rentalRepo.saveRental(rental);

                if (client) {
                    const isGroup = jid.endsWith('@g.us');
                    const expMsg =
                        `╔══════════════════════════════╗\n` +
                        `║    🔒 *ALUGUEL EXPIRADO* 🔒    ║\n` +
                        `╚══════════════════════════════╝\n\n` +
                        `⏰ O período de aluguel deste grupo encerrou em *${formatLocalTime(rental.expiresAt)}*.\n\n` +
                        `🤝 Agradecemos pelo período em que estivemos juntos!\n` +
                        `👑 *Para renovar ou reativar:* Contate um administrador ou dono do bot.\n\n` +
                        (isGroup ? `👋 _O bot deixará o grupo agora. Até a próxima!_` : `🔒 _O bot está pausado no privado até a renovação._`);

                    try {
                        await client.sendMessage(jid, { text: expMsg });
                    } catch (sendErr) {
                        logger.warn(`[RENTAL WORKER] Não consegui enviar aviso de despedida para ${jid}: ${sendErr.message}`);
                    }

                    // Se for grupo, sai com delay seguro de 3 segundos para a mensagem chegar
                    if (isGroup && typeof client.groupLeave === 'function') {
                        setTimeout(async () => {
                            try {
                                await client.groupLeave(jid);
                                logger.info(`[RENTAL WORKER] Bot saiu do grupo ${jid} devido a aluguel expirado.`);
                            } catch (leaveErr) {
                                logger.error(`[RENTAL WORKER] Falha ao sair do grupo ${jid}: ${leaveErr.message}`);
                            }
                        }, 3000);
                    }
                }
                continue;
            }

            // 2. CASO: AVISO DE 1 HORA (<= 60 minutos restantes)
            if (remainingMs <= 60 * 60 * 1000 && !rental.warned1h) {
                rentalRepo.setRentalWarning(jid, '1h');
                logger.info(`[RENTAL WORKER] Enviando aviso de 1 hora para ${jid}`);

                if (client) {
                    const mins = Math.max(1, Math.round(remainingMs / 60000));
                    const warn1hMsg =
                        `╔══════════════════════════════╗\n` +
                        `║    ⚠️ *ALUGUEL TERMINANDO* ⚠️   ║\n` +
                        `╚══════════════════════════════╝\n\n` +
                        `⏰ *Atenção:* O aluguel deste grupo encerra em aproximadamente *${mins} minuto(s)* (às *${formatLocalTime(rental.expiresAt)}*).\n\n` +
                        `💡 Para evitar a remoção do bot e a interrupção dos comandos, renove o plano antes do encerramento com um administrador/dono!`;

                    try {
                        await client.sendMessage(jid, { text: warn1hMsg });
                    } catch (err) {
                        logger.warn(`[RENTAL WORKER] Falha ao enviar aviso 1h para ${jid}: ${err.message}`);
                    }
                }
                continue;
            }

            // 3. CASO: AVISO DE 24 HORAS (<= 24 horas e > 1 hora)
            if (remainingMs <= 24 * 60 * 60 * 1000 && remainingMs > 60 * 60 * 1000 && !rental.warned24h) {
                rentalRepo.setRentalWarning(jid, '24h');
                logger.info(`[RENTAL WORKER] Enviando aviso de 24 horas para ${jid}`);

                if (client) {
                    const warn24hMsg =
                        `╔══════════════════════════════╗\n` +
                        `║    ⏳ *LEMBRETE DE ALUGUEL* ⏳   ║\n` +
                        `╚══════════════════════════════╝\n\n` +
                        `📅 O plano de aluguel deste grupo vence amanhã, em *${formatLocalTime(rental.expiresAt)}*.\n\n` +
                        `💡 _Para continuar usando os comandos e manter o ranking e economia do grupo, solicite a renovação com os donos do bot._`;

                    try {
                        await client.sendMessage(jid, { text: warn24hMsg });
                    } catch (err) {
                        logger.warn(`[RENTAL WORKER] Falha ao enviar aviso 24h para ${jid}: ${err.message}`);
                    }
                }
            }
        }
    } catch (err) {
        logger.error('[RENTAL WORKER ERROR] Erro durante o ciclo de verificação:', err);
    }
}

/**
 * Inicia o worker periódico
 */
function start(client) {
    globalClient = client;
    if (workerInterval) clearInterval(workerInterval);

    logger.info('🛡️ [RENTAL WORKER] Iniciando monitor ativo de aluguéis (ciclo: 60s)...');
    // Roda uma conferência inicial após 10 segundos para dar tempo ao socket
    setTimeout(checkRentals, 10000);
    workerInterval = setInterval(checkRentals, CHECK_INTERVAL_MS);
}

/**
 * Para o worker
 */
function stop() {
    if (workerInterval) {
        clearInterval(workerInterval);
        workerInterval = null;
        logger.info('[RENTAL WORKER] Monitor de aluguéis pausado.');
    }
}

module.exports = {
    start,
    stop,
    checkRentals
};
