/**
 * Checagens de ambiente no boot.
 *
 * Existe por causa de um bug real: as pastas montadas do host pertenciam ao
 * root, o container roda como `node` (uid 1000), e TODO comando que escrevia
 * arquivo (play, download, figurinha, transcrição) morria com EACCES — mas só
 * na hora do uso, um comando por vez, sem nada no boot indicando o problema.
 *
 * O Dockerfile faz `chown -R node:node /app`, porém isso vale só para o
 * filesystem da imagem: um bind mount traz o dono do HOST e sobrepõe.
 *
 * Falhar cedo e alto é melhor do que falhar tarde e calado.
 */

const fs = require('fs')
const path = require('path')
const logger = require('../core/logger')

/** Pastas que o bot precisa escrever para funcionar por completo. */
const PASTAS_GRAVAVEIS = [
    { caminho: 'temp', critica: true, usadaPor: 'downloads, áudio, figurinhas, transcrição' },
    { caminho: 'data', critica: true, usadaPor: 'banco de dados' },
    { caminho: 'sessao', critica: true, usadaPor: 'sessão do WhatsApp' },
    { caminho: 'logs', critica: false, usadaPor: 'arquivos de log' },
    { caminho: 'backups', critica: false, usadaPor: 'backups automáticos' },
    { caminho: 'assets/wallpapers', critica: false, usadaPor: '.setwallpaper' }
]

/**
 * Testa escrita de verdade — `fs.access` mente em alguns setups de container,
 * então criamos e apagamos um arquivo.
 * @param {string} dir caminho absoluto
 * @returns {{ok:boolean, erro?:string}}
 */
function podeEscrever(dir) {
    try {
        fs.mkdirSync(dir, { recursive: true })
        const alvo = path.join(dir, `.escrita_${process.pid}`)
        fs.writeFileSync(alvo, 'x')
        fs.unlinkSync(alvo)
        return { ok: true }
    } catch (err) {
        return { ok: false, erro: `${err.code || ''} ${err.message}`.trim() }
    }
}

/**
 * Roda as checagens e reporta.
 * @param {string} [raiz] raiz do projeto
 * @returns {{ok:boolean, falhas:Array}}
 */
function verificarPermissoes(raiz = path.resolve(__dirname, '..', '..')) {
    const falhas = []

    for (const p of PASTAS_GRAVAVEIS) {
        const dir = path.join(raiz, p.caminho)
        const r = podeEscrever(dir)
        if (!r.ok) falhas.push({ ...p, dir, erro: r.erro })
    }

    if (!falhas.length) {
        logger.info('✅ [BOOT] Permissões de escrita conferidas em todas as pastas.')
        return { ok: true, falhas }
    }

    const criticas = falhas.filter(f => f.critica)
    logger.error('═'.repeat(58))
    logger.error(`❌ [BOOT] ${falhas.length} pasta(s) SEM permissão de escrita!`)
    for (const f of falhas) {
        logger.error(`   ${f.critica ? '🔴' : '🟡'} ${f.caminho} — quebra: ${f.usadaPor}`)
        logger.error(`      ${f.erro}`)
    }
    logger.error('')
    logger.error('   CORREÇÃO (no host, na pasta do projeto):')
    logger.error(`      chown -R 1000:1000 ${falhas.map(f => f.caminho).join(' ')}`)
    logger.error('')
    logger.error('   Motivo: o container roda como uid 1000 (node), mas as pastas')
    logger.error('   montadas do host pertencem a outro dono. O chown do Dockerfile')
    logger.error('   não alcança bind mounts.')
    logger.error('═'.repeat(58))

    return { ok: criticas.length === 0, falhas }
}

module.exports = { verificarPermissoes, PASTAS_GRAVAVEIS }
