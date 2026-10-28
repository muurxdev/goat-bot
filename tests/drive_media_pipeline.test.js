/**
 * Testes Automatizados da Integração com Google Drive de 5TB para Mídias > 2GB
 * 
 * Cobertura:
 * 1. Resolução canônica de links de pasta do Drive (obterLinkPasta)
 * 2. Links de visualização rápida e download direto sem recompressão
 * 3. Bypassing do teto de 2GB no mediaDownloader quando Drive estiver configurado
 * 4. Roteamento direto sem FFmpeg no videoSender para arquivos > 2GB
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const drive = require('../src/services/drive/googleDriveService')
const { MEDIA_LIMITS, MEDIA_ERRORS } = require('../src/services/media/constants')
const videoSender = require('../src/services/media/videoSender')

let pass = 0
let fail = 0

async function test(name, fn) {
    try {
        await fn()
        pass++
        console.log(`  ✅ PASS: ${name}`)
    } catch (e) {
        fail++
        console.log(`  ❌ FAIL: ${name}`)
        console.log(`      ${e.stack || e.message}`)
    }
}

async function run() {
    console.log('\n--- 1. Links Canônicos de Pastas e Arquivos no Google Drive ---')

    await test('obterLinkPasta gera URL pública canônica da pasta', () => {
        const folderId = '1AbCdEfGhIjKlMnOpQrStUvWxYz_12345'
        const link = drive.obterLinkPasta(folderId)
        assert.strictEqual(link, `https://drive.google.com/drive/folders/${folderId}`)

        assert.strictEqual(drive.obterLinkPasta(null), null)
        assert.strictEqual(drive.obterLinkPasta(''), null)
    })

    await test('links gera URLs de visualização e download sem recompressão', () => {
        const fileId = 'file_abc123xyz'
        const l = drive.links(fileId)
        assert.strictEqual(l.visualizar, `https://drive.google.com/file/d/${fileId}/view`)
        assert.strictEqual(l.baixar, `https://drive.google.com/uc?export=download&id=${fileId}`)
    })

    console.log('\n--- 2. Limites de Download para Drive 5TB (constants.js) ---')

    await test('MAX_DRIVE_FILE_SIZE_BYTES está configurado para até 50 GB', () => {
        assert.ok(MEDIA_LIMITS.MAX_DRIVE_FILE_SIZE_BYTES >= 50 * 1024 * 1024 * 1024, 'Limite do Drive deve ser >= 50GB')
        assert.ok(MEDIA_LIMITS.MAX_FILE_SIZE_BYTES === 2000 * 1024 * 1024, 'Limite WhatsApp deve ser 2000MB')
    })

    console.log('\n--- 3. Bypassing de FFmpeg para Arquivos > 2GB (videoSender.js) ---')

    await test('Arquivos > 2GB vão direto para o Google Drive e incluem link de pasta exata', async () => {
        // Mock de arquivo simulando 2.5 GB
        const fakeFilePath = path.join(__dirname, 'fake_large_video.mp4')
        const fakeSize = 2500 * 1024 * 1024 // 2.5 GB

        // Simula fs.statSync para este arquivo
        const originalStat = fs.statSync
        fs.statSync = (p) => {
            if (p === fakeFilePath) {
                return { size: fakeSize, isFile: () => true }
            }
            return originalStat(p)
        }

        // Mock de drive.isConfigured() e upload
        const originalIsConfigured = drive.isConfigured
        const originalEnviarECompartilhar = drive.enviarECompartilhar
        const originalGetQuota = drive.getQuota

        drive.isConfigured = () => true
        drive.getQuota = async () => ({ livre: 4 * 1024 * 1024 * 1024 * 1024 }) // 4 TB livres
        drive.enviarECompartilhar = async ({ folderId }) => ({
            id: 'drive_file_999',
            name: 'fake_large_video.mp4',
            size: fakeSize,
            visualizar: 'https://drive.google.com/file/d/drive_file_999/view',
            baixar: 'https://drive.google.com/uc?export=download&id=drive_file_999',
            folderId: folderId || 'fake_folder_5tb',
            folderUrl: `https://drive.google.com/drive/folders/${folderId || 'fake_folder_5tb'}`
        })

        const messagesSent = []
        const mockClient = {
            sendMessage: async (to, payload) => {
                messagesSent.push({ to, payload })
                return { key: { id: 'msg_1' } }
            }
        }

        try {
            const res = await videoSender.enviarVideo({
                client: mockClient,
                from: 'test_group@g.us',
                filePath: fakeFilePath,
                caption: 'Vídeo 4K gravado',
                info: {},
                fileName: 'grande_filme.mp4'
            })

            assert.strictEqual(res.modo, 'drive')
            assert.ok(res.drive)
            assert.strictEqual(res.drive.folderUrl, 'https://drive.google.com/drive/folders/fake_folder_5tb')
            assert.strictEqual(res.drive.visualizar, 'https://drive.google.com/file/d/drive_file_999/view')

            // Verifica mensagem entregue ao usuário
            const lastMsg = messagesSent[messagesSent.length - 1]
            assert.ok(lastMsg.payload.text.includes('coloquei no Drive'))
            assert.ok(lastMsg.payload.text.includes('https://drive.google.com/drive/folders/fake_folder_5tb'))
            assert.ok(lastMsg.payload.text.includes('https://drive.google.com/file/d/drive_file_999/view'))
            assert.ok(lastMsg.payload.text.includes('https://drive.google.com/uc?export=download&id=drive_file_999'))
        } finally {
            fs.statSync = originalStat
            drive.isConfigured = originalIsConfigured
            drive.enviarECompartilhar = originalEnviarECompartilhar
            drive.getQuota = originalGetQuota
        }
    })

    console.log(`\n========================================`)
    console.log(`Resultados dos Testes: ${pass} PASSOU | ${fail} FALHOU`)
    console.log(`========================================\n`)

    if (fail > 0) process.exit(1)
}

run().catch(err => {
    console.error('Erro fatal nos testes de Drive:', err)
    process.exit(1)
})
