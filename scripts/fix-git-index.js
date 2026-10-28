/**
 * Recuperação do índice do Git (.git/index) corrompido.
 *
 * Sintoma típico (aparece como popup no VS Code):
 *   fatal: .git/index: index file smaller than expected
 *
 * A versão antiga só tratava índice de tamanho ZERO — mas o caso real que ocorreu
 * tinha 126KB e ainda assim estava corrompido. Aqui a detecção é por COMPORTAMENTO:
 * se o git não consegue ler o índice, ele é inválido, independente do tamanho.
 *
 * É seguro: o índice é apenas a "área de stage" e é reconstruído a partir do HEAD.
 * Commits e arquivos do working tree NÃO são afetados (só se perde o que estava
 * em stage e ainda não foi commitado).
 *
 * Uso: npm run fix:git
 */
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

function git(args) {
    return cp.execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
}

function indexIsHealthy() {
    try {
        git('status --porcelain')
        return true
    } catch (err) {
        const out = `${err.stdout || ''}${err.stderr || ''}`
        // Só tratamos como corrupção de índice; outros erros devem aparecer p/ o usuário.
        if (/index file smaller than expected|bad index file|index file corrupt|unknown index entry format/i.test(out)) {
            return false
        }
        throw err
    }
}

function main() {
    const root = path.resolve(__dirname, '..')
    process.chdir(root)

    const indexPath = path.join(root, '.git', 'index')

    let healthy
    try {
        healthy = indexIsHealthy()
    } catch (err) {
        console.error('❌ O git falhou por um motivo diferente de índice corrompido:')
        console.error(`${err.stdout || ''}${err.stderr || ''}`.trim() || err.message)
        process.exit(1)
    }

    if (healthy) {
        console.log('✅ Git index está íntegro — nada a fazer.')
        return
    }

    console.log('⚠️  Índice corrompido detectado. Reconstruindo a partir do HEAD...')

    if (fs.existsSync(indexPath)) {
        const backup = `${indexPath}.corrupt.${Date.now()}.bak`
        try {
            fs.copyFileSync(indexPath, backup)
            console.log(`🗃️  Backup do índice quebrado: ${path.basename(backup)}`)
        } catch (e) {
            console.log(`(não consegui salvar backup do índice: ${e.message})`)
        }
        fs.unlinkSync(indexPath)
    }

    try {
        git('reset')
    } catch (e) {
        console.error('❌ Falha ao reconstruir o índice com `git reset`:', e.message)
        process.exit(1)
    }

    if (indexIsHealthy()) {
        console.log('✅ Git index recuperado com sucesso!')
        console.log('💡 No VS Code, recarregue a janela (Ctrl+Shift+P → "Reload Window") p/ sumir o aviso.')
    } else {
        console.error('❌ O índice continua inválido após a reconstrução.')
        process.exit(1)
    }
}

main()
