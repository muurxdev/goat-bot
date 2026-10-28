/**
 * Command Analytics Repository (SQLite)
 * Métricas de uso e de falha dos comandos, persistidas (sobrevivem a restart).
 */

const { q } = require('../connection');

/** Tamanho máximo do erro gravado. Só a mensagem, nunca o stack. */
const MAX_ERRO = 300;

/**
 * Incrementa a contagem de execução de um comando
 * @param {string} commandName - Nome do comando
 * @param {string} category - Categoria do comando
 */
function recordCommandUsage(commandName, category = 'geral') {
    if (!commandName) return;
    q(`
        INSERT INTO command_analytics (command_name, category, execution_count, last_used_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(command_name) DO UPDATE SET
            execution_count = execution_count + 1,
            category = excluded.category,
            last_used_at = CURRENT_TIMESTAMP
    `).run(commandName.toLowerCase(), String(category || 'geral').toLowerCase());
}

/** Mensagem curta de erro: primeira linha útil, espaços colapsados, até MAX_ERRO chars. */
function resumirErro(err) {
    let msg = err && typeof err === 'object'
        ? (err.message || String(err))
        : String(err === undefined ? 'erro desconhecido' : err);
    if (err && err.name && err.name !== 'Error' && !msg.startsWith(err.name)) msg = `${err.name}: ${msg}`;
    msg = msg.replace(/\s+/g, ' ').trim() || 'erro sem mensagem';
    return msg.length > MAX_ERRO ? msg.slice(0, MAX_ERRO - 1) + '…' : msg;
}

/**
 * Registra uma falha de execução: incrementa error_count e guarda o último erro.
 * Não conta como execução (execution_count segue medindo só sucessos).
 * @param {string} commandName
 * @param {string} category
 * @param {Error|string} err
 * @param {number} [quando] - epoch ms (padrão: agora)
 */
function recordCommandFailure(commandName, category = 'geral', err, quando = Date.now()) {
    if (!commandName) return;
    q(`
        INSERT INTO command_analytics (command_name, category, execution_count, error_count, last_error, last_error_at)
        VALUES (?, ?, 0, 1, ?, ?)
        ON CONFLICT(command_name) DO UPDATE SET
            error_count = COALESCE(error_count, 0) + 1,
            category = excluded.category,
            last_error = excluded.last_error,
            last_error_at = excluded.last_error_at
    `).run(commandName.toLowerCase(), String(category || 'geral').toLowerCase(), resumirErro(err), quando);
}

/** Comandos com mais falhas acumuladas. */
function getTopFailures(limit = 10) {
    return q(`
        SELECT command_name, category, execution_count, error_count, last_error, last_error_at
        FROM command_analytics
        WHERE error_count > 0
        ORDER BY error_count DESC, last_error_at DESC
        LIMIT ?
    `).all(limit);
}

/** Falhas mais recentes (uma linha por comando). */
function getRecentFailures(limit = 10) {
    return q(`
        SELECT command_name, category, execution_count, error_count, last_error, last_error_at
        FROM command_analytics
        WHERE error_count > 0
        ORDER BY last_error_at DESC
        LIMIT ?
    `).all(limit);
}

/** Total de falhas registradas. */
function getTotalFailures() {
    const row = q(`SELECT SUM(error_count) as total FROM command_analytics`).get();
    return row?.total || 0;
}

/**
 * Retorna os comandos mais executados
 * @param {number} limit
 * @returns {Array<object>}
 */
function getTopCommands(limit = 10) {
    return q(`
        SELECT command_name, category, execution_count, last_used_at
        FROM command_analytics
        ORDER BY execution_count DESC
        LIMIT ?
    `).all(limit);
}

/**
 * Retorna estatísticas por categoria
 * @returns {Array<object>}
 */
function getCategoryStats() {
    return q(`
        SELECT category, SUM(execution_count) as total_executions, COUNT(command_name) as command_count
        FROM command_analytics
        GROUP BY category
        ORDER BY total_executions DESC
    `).all();
}

/**
 * Retorna o total acumulado de comandos executados
 * @returns {number}
 */
function getTotalExecutions() {
    const row = q(`SELECT SUM(execution_count) as total FROM command_analytics`).get();
    return row?.total || 0;
}

module.exports = {
    recordCommandUsage,
    recordCommandFailure,
    resumirErro,
    getTopFailures,
    getRecentFailures,
    getTotalFailures,
    getTopCommands,
    getCategoryStats,
    getTotalExecutions,
    MAX_ERRO
};
