/**
 * PDF Security, Decryption & Password Inspector
 * Detecta se um PDF possui criptografia/senha, remove restrições via qpdf
 * e informa status de acesso e senha para o usuário
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const logger = require('../core/logger');

/**
 * Detecta se o buffer do PDF possui marcadores de criptografia
 * @param {Buffer} buffer 
 * @returns {boolean}
 */
function isPdfEncrypted(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) return false;
    const str = buffer.toString('binary');
    return str.includes('/Encrypt');
}

/**
 * Tenta remover senhas e restrições de criptografia de um PDF usando qpdf
 * @param {Buffer} buffer - Buffer original do PDF
 * @param {string} [password=''] - Senha conhecida (se houver)
 * @returns {{ buffer: Buffer, isEncrypted: boolean, isUnlocked: boolean, password: string|null }}
 */
function unlockPdfBuffer(buffer, password = '') {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        return { buffer, isEncrypted: false, isUnlocked: true, password: null };
    }

    const hasEncryption = isPdfEncrypted(buffer);
    if (!hasEncryption) {
        return {
            buffer,
            isEncrypted: false,
            isUnlocked: true,
            password: null
        };
    }

    // Cria arquivos temporários para descriptografia segura
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
        try { fs.mkdirSync(tempDir, { recursive: true }); } catch (errIgnorado) { logger.warn(`[PDFSECURITY] Falha ignorada em src/utils/pdfSecurity.js:47: ${errIgnorado.message}`) }
    }

    const tempIn = path.join(tempDir, `sec_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.pdf`);
    const tempOut = path.join(tempDir, `sec_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.pdf`);

    try {
        fs.writeFileSync(tempIn, buffer);
        const args = ['--decrypt'];
        if (password) {
            args.push(`--password=${password}`);
        }
        args.push(tempIn, tempOut);

        const res = spawnSync('qpdf', args, { timeout: 15000 });
        if (res.status === 0 && fs.existsSync(tempOut)) {
            const unlockedBuf = fs.readFileSync(tempOut);
            logger.info(`[PDF SECURITY] Arquivo PDF descriptografado com sucesso via qpdf! Tamanho: ${unlockedBuf.length} bytes`);
            return {
                buffer: unlockedBuf,
                isEncrypted: true,
                isUnlocked: true,
                password: password || 'Desbloqueado automaticamente (Sem Senha)'
            };
        } else {
            logger.warn(`[PDF SECURITY] qpdf não conseguiu descriptografar automaticamente. Status: ${res.status}`);
        }
    } catch (err) {
        logger.warn(`[PDF SECURITY] Falha ao executar qpdf: ${err.message}`);
    } finally {
        if (fs.existsSync(tempIn)) try { fs.unlinkSync(tempIn); } catch (errIgnorado) { logger.warn(`[PDFSECURITY] Falha ignorada em src/utils/pdfSecurity.js:77: ${errIgnorado.message}`) }
        if (fs.existsSync(tempOut)) try { fs.unlinkSync(tempOut); } catch (errIgnorado) { logger.warn(`[PDFSECURITY] Falha ignorada em src/utils/pdfSecurity.js:78: ${errIgnorado.message}`) }
    }

    return {
        buffer,
        isEncrypted: true,
        isUnlocked: false,
        password: password || 'Protegido por Senha do Editor'
    };
}

module.exports = {
    isPdfEncrypted,
    unlockPdfBuffer
};

