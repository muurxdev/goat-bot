/**
 * Self-Healing & Diagnostic Engine
 * Motor autônomo de diagnóstico, reparação de integridade, limpeza e otimização
 */

const fs = require("fs");
const path = require("path");
const { getDatabase, q } = require("../database/connection");
const { tempDir, dataDir } = require("../config/paths");
const { checkMediaEnv } = require("./media/mediaEnvCheck");
const { validateCookiesFile, getCookiesFilePath } = require("./media/mediaArgs");
const { getAllMenuMediaStatus } = require("../utils/wallpapers");
const logger = require("../core/logger");

/**
 * Destrava agendamentos presos: fechamento cuja reabertura já passou.
 * A tabela não tem expires_at (a query antiga falhava sempre); o prazo é
 * reopen_at, em ms. O botScheduler marca esse caso como COMPLETED e volta o
 * bot a ONLINE, e aqui fazemos o mesmo.
 * @returns {number} quantos agendamentos foram encerrados
 */
function destravarAgendamentos(agora = Date.now()) {
    const scheduleRepo = require("../database/repositories/scheduleRepository");
    const botScheduler = require("./botScheduler");
    const res = q(`
        UPDATE bot_schedules SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
        WHERE status IN ('PENDING', 'EXECUTING') AND reopen_at IS NOT NULL AND reopen_at < ?
    `).run(agora);
    const total = Number(res.changes) || 0;
    if (total > 0) {
        if (scheduleRepo.getActiveSchedules().length === 0 && botScheduler.getBotState() === botScheduler.BOT_STATES.OFFLINE) {
            botScheduler.setBotState(botScheduler.BOT_STATES.ONLINE);
        }
        logger.info(`[SELF-HEAL] ${total} agendamento(s) com reabertura vencida marcados como COMPLETED`);
    }
    return total;
}

/**
 * Executa uma varredura completa de diagnóstico e auto-reparação
 * @returns {Promise<{ repaired: string[], warnings: string[], stats: object, allHealthy: boolean }>}
 */
async function runSelfHeal() {
    const repaired = [];
    const warnings = [];
    const stats = {};

    logger.info("[SELF-HEAL] Iniciando rotina autônoma de diagnóstico e auto-reparação...");

    // 1. VERIFICAÇÃO E REPARO DO BANCO SQLITE
    try {
        const db = getDatabase();
        const row = db.prepare("PRAGMA integrity_check").get();
        if (row && (row.integrity_check === "ok" || Object.values(row)[0] === "ok")) {
            stats.sqliteIntegrity = "íntegros";
        } else {
            logger.warn("[SELF-HEAL] integrity_check não retornou ok: " + JSON.stringify(row));
            warnings.push("Os dados salvos relataram problema de integridade. Faça um .backup e veja o log do dia.");
        }

        // Checkpoint WAL e Otimização
        try {
            db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
            db.exec("PRAGMA optimize;");
            repaired.push("Dados organizados e gravados em disco.");
        } catch (e) {
            logger.warn(`[SELF-HEAL] wal_checkpoint/optimize falhou: ${e.message}`);
        }

        // Recuperação de agendamentos zumbis/presos
        try {
            const destravados = destravarAgendamentos();
            if (destravados > 0) {
                repaired.push(`Destravei ${destravados} horário(s) de fechamento que tinham ficado presos.`);
            }
        } catch (e) {
            logger.warn(`[SELF-HEAL] limpeza de bot_schedules presos falhou: ${e.message}`);
        }
    } catch (dbErr) {
        logger.warn(`[SELF-HEAL] inspeção do SQLite falhou: ${dbErr.message}`);
        warnings.push("Não consegui checar os dados salvos. O motivo ficou no log do dia.");
    }

    // 2. LIMPEZA DE ARQUIVOS TEMPORÁRIOS E LOCKS
    try {
        let tempFilesDeleted = 0;
        if (fs.existsSync(tempDir)) {
            const cleanDirRecursive = (dirPath) => {
                let count = 0;
                for (const item of fs.readdirSync(dirPath)) {
                    const fullPath = path.join(dirPath, item);
                    try {
                        const stat = fs.statSync(fullPath);
                        if (stat.isDirectory()) {
                            count += cleanDirRecursive(fullPath);
                            try { fs.rmdirSync(fullPath); } catch (e) { logger.debug(`[SELF-HEAL] pasta ${fullPath} não removida (provavelmente não vazia): ${e.message}`); }
                        } else if (Date.now() - stat.mtimeMs > 15 * 60 * 1000) {
                            fs.unlinkSync(fullPath);
                            count++;
                        }
                    } catch (e) {
                        logger.warn(`[SELF-HEAL] não consegui limpar ${fullPath}: ${e.message}`);
                    }
                }
                return count;
            };
            tempFilesDeleted = cleanDirRecursive(tempDir);
        }
        if (tempFilesDeleted > 0) {
            repaired.push(`Apaguei ${tempFilesDeleted} arquivo(s) temporário(s) antigo(s).`);
        }
        stats.tempCleaned = tempFilesDeleted;
    } catch (tempErr) {
        logger.warn(`[SELF-HEAL] limpeza de temporários falhou: ${tempErr.message}`);
        warnings.push("Não consegui limpar os arquivos temporários. O motivo ficou no log do dia.");
    }

    // 3. AUDITORIA DOS COMANDOS
    // Não recarrega: loadCommands() apaga o cache do require e carrega cada
    // arquivo de novo, duplicando o estado de módulo (timers, filas, Sets de
    // confirmação) dos comandos que já estão em uso. Só confere o registro.
    try {
        const { commands, aliases } = require("../handlers/commandDispatcher");
        stats.totalCommands = commands.size;
        stats.totalAliases = aliases.size;
        if (commands.size === 0) {
            warnings.push("A lista de comandos está vazia. Reinicie o bot para carregar os comandos.");
        }
    } catch (cmdErr) {
        logger.warn(`[SELF-HEAL] auditoria de comandos falhou: ${cmdErr.message}`);
        warnings.push("Não consegui conferir a lista de comandos. O motivo ficou no log do dia.");
    }

    // 4. VERIFICAÇÃO DO AMBIENTE DE MÍDIA (FFmpeg / FFprobe / yt-dlp)
    try {
        const mediaEnv = await checkMediaEnv();
        stats.ffmpeg = mediaEnv.ffmpeg?.ok ? "OK" : "AUSENTE";
        stats.ffprobe = mediaEnv.ffprobe?.ok ? "OK" : "AUSENTE";
        stats.ytdlp = mediaEnv.ytDlp?.ok ? "OK" : "AUSENTE";

        if (!mediaEnv.ffmpeg?.ok) warnings.push("FFmpeg não está instalado no servidor: conversão de áudio e vídeo não funciona.");
        if (!mediaEnv.ffprobe?.ok) warnings.push("FFprobe não está instalado no servidor: não consigo medir áudios e vídeos.");
    } catch (mErr) {
        logger.warn(`[SELF-HEAL] checagem de ffmpeg/ffprobe/yt-dlp falhou: ${mErr.message}`);
        warnings.push("Não consegui checar as ferramentas de áudio e vídeo. O motivo ficou no log do dia.");
    }

    // 5. AUDITORIA DE COOKIES E AUTENTICAÇÃO DE MÍDIAS
    try {
        const cookieStatus = validateCookiesFile(getCookiesFilePath());
        if (cookieStatus.ok) {
            stats.cookies = `ativos (${cookieStatus.count} linhas)`;
        } else {
            stats.cookies = "não enviados (baixo sem conta logada)";
        }
    } catch (e) {
        logger.warn(`[SELF-HEAL] validação de cookies falhou: ${e.message}`);
        stats.cookies = "não configurados";
    }

    // 6. INTEGRIDADE DOS WALLPAPERS E COVERS
    try {
        const wpStatus = getAllMenuMediaStatus();
        const activeVideos = wpStatus.filter(c => c.type === "video").length;
        stats.wallpapers = `${activeVideos} de ${wpStatus.length} menus com vídeo`;
    } catch (e) {
        logger.warn(`[SELF-HEAL] status dos wallpapers falhou: ${e.message}`);
    }

    // 7. ESTATÍSTICAS DE MEMÓRIA E UPTIME
    const mem = process.memoryUsage();
    stats.rss = (mem.rss / 1024 / 1024).toFixed(1) + " MB";
    stats.heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(1) + " MB";
    stats.uptime = Math.floor(process.uptime() / 60) + "m " + Math.floor(process.uptime() % 60) + "s";

    const allHealthy = warnings.length === 0;

    return {
        repaired,
        warnings,
        stats,
        allHealthy
    };
}

module.exports = {
    runSelfHeal,
    destravarAgendamentos
};
