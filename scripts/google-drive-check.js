#!/usr/bin/env node
/**
 * Verifica a configuração do Google Drive e prepara a pasta do bot.
 *
 * Rode DEPOIS de google-drive-auth.js. Ele:
 *   1. confirma que o refresh token funciona
 *   2. mostra o espaço real da conta
 *   3. cria (ou encontra) a pasta "GOAT Bot" e imprime o GDRIVE_FOLDER_ID
 *   4. com --upload, faz um upload de teste de 1 MB e devolve o link público
 */

require('dotenv').config()
const fs = require('fs')
const os = require('os')
const path = require('path')
const drive = require('../src/services/drive/googleDriveService')

const NOME_PASTA = process.env.GDRIVE_FOLDER_NAME || 'GOAT Bot'
const gb = n => (Number(n) / 1024 ** 3).toFixed(2) + ' GB'
const tb = n => (Number(n) / 1024 ** 4).toFixed(2) + ' TB'

async function main() {
    if (!drive.isConfigured()) {
        console.error('\n❌ Google Drive não configurado.')
        console.error('   Faltam GDRIVE_CLIENT_ID / GDRIVE_CLIENT_SECRET / GDRIVE_REFRESH_TOKEN no .env')
        console.error('   Rode primeiro: node scripts/google-drive-auth.js <CLIENT_ID> <CLIENT_SECRET>\n')
        process.exit(1)
    }

    console.log('\n🔎 Testando credenciais...')
    const q = await drive.getQuota()
    console.log(`   ✅ Conta: ${q.email}`)
    if (q.limite === null) {
        console.log('   Espaço: ilimitado')
    } else {
        console.log(`   Espaço: ${tb(q.usado)} usados de ${tb(q.limite)}  (livre: ${tb(q.livre)})`)
    }

    console.log(`\n📁 Garantindo a pasta "${NOME_PASTA}"...`)
    const folderId = await drive.garantirPasta(NOME_PASTA)
    console.log(`   ✅ id: ${folderId}`)

    if (process.env.GDRIVE_FOLDER_ID !== folderId) {
        console.log('\n📋 Adicione (ou atualize) no .env:\n')
        console.log(`GDRIVE_FOLDER_ID=${folderId}\n`)
    } else {
        console.log('   (já é a pasta configurada no .env)')
    }

    if (process.argv.includes('--upload')) {
        console.log('\n⬆️  Upload de teste (1 MB)...')
        const tmp = path.join(os.tmpdir(), `goat-drive-test-${Date.now()}.bin`)
        fs.writeFileSync(tmp, Buffer.alloc(1024 * 1024, 0x44))
        try {
            const r = await drive.enviarECompartilhar({
                filePath: tmp,
                fileName: 'teste-goat.bin',
                mimeType: 'application/octet-stream',
                folderId,
                onProgress: p => process.stdout.write(`\r   ${p}%`)
            })
            console.log(`\n   ✅ Enviado — ${gb(r.size)}`)
            console.log(`   Ver:    ${r.visualizar}`)
            console.log(`   Baixar: ${r.baixar}`)
            console.log('\n   Removendo o arquivo de teste do Drive...')
            await drive.deleteFile(r.id)
            console.log('   ✅ Removido. Tudo funcionando.')
        } finally {
            try { fs.unlinkSync(tmp) } catch (e) { /* arquivo temporário já sumiu */ }
        }
    } else {
        console.log('\n   💡 Para testar um upload real: node scripts/google-drive-check.js --upload')
    }
    console.log('')
}

main().catch(e => {
    console.error(`\n❌ ${e.message}`)
    if (e.response && e.response.data) {
        console.error('   ' + JSON.stringify(e.response.data).slice(0, 300))
    }
    console.error('')
    process.exit(1)
})
