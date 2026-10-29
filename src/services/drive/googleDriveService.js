/**
 * Upload para o Google Drive do dono do bot.
 *
 * POR QUE OAuth E NÃO SERVICE ACCOUNT
 * -----------------------------------
 * A saída "óbvia" seria uma Service Account (chave JSON no servidor, sem login).
 * Ela NÃO funciona aqui: uma Service Account tem cota de Drive PRÓPRIA de 15 GB e
 * não herda o plano do dono da pasta. Subir um arquivo de 3 GB numa pasta
 * compartilhada com ela falha com 403 `storageQuotaExceeded`. O contorno oficial
 * do Google é Shared Drive — que só existe no Workspace, não no Google One.
 *
 * Então usamos OAuth2 com refresh token DO DONO: o arquivo nasce na conta dele e
 * consome os 5 TB dele. O refresh token não expira enquanto o app não for
 * revogado, então é configuração de uma vez só (ver scripts/google-drive-auth.js).
 *
 * Sem googleapis: aquele pacote traz ~50 MB e o cliente inteiro do Google Cloud.
 * Precisamos de 5 endpoints REST — axios (já é dependência) dá conta.
 */

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const logger = require('../../core/logger')

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'
const FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const ABOUT_URL = 'https://www.googleapis.com/drive/v3/about'

// Pedaço do upload resumível. Múltiplo de 256 KB (exigência do Google).
// 16 MB equilibra número de requisições e memória: nunca carregamos o arquivo
// inteiro na RAM, o que importa numa VPS de 2 vCPU com arquivos de GB.
const CHUNK_BYTES = 16 * 1024 * 1024

const cfg = () => ({
    clientId: process.env.GDRIVE_CLIENT_ID,
    clientSecret: process.env.GDRIVE_CLIENT_SECRET,
    refreshToken: process.env.GDRIVE_REFRESH_TOKEN,
    folderId: process.env.GDRIVE_FOLDER_ID || null
})

/** O bot só oferece o caminho do Drive se as 3 credenciais existirem. */
function isConfigured() {
    const c = cfg()
    return Boolean(c.clientId && c.clientSecret && c.refreshToken)
}

// Access token vive 1h; guardamos em memória e renovamos com 1 min de folga.
let _token = null
let _tokenExpiraEm = 0

async function getAccessToken() {
    if (_token && Date.now() < _tokenExpiraEm) return _token
    const c = cfg()
    if (!isConfigured()) throw new Error('Google Drive não configurado (GDRIVE_CLIENT_ID/SECRET/REFRESH_TOKEN)')

    const body = new URLSearchParams({
        client_id: c.clientId,
        client_secret: c.clientSecret,
        refresh_token: c.refreshToken,
        grant_type: 'refresh_token'
    })
    const { data } = await axios.post(OAUTH_TOKEN_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000
    })
    _token = data.access_token
    _tokenExpiraEm = Date.now() + ((data.expires_in || 3600) - 60) * 1000
    return _token
}

/** Espaço restante na conta — usado para recusar o upload antes de gastar banda. */
async function getQuota() {
    const token = await getAccessToken()
    const { data } = await axios.get(ABOUT_URL, {
        params: { fields: 'storageQuota,user' },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
    })
    const q = data.storageQuota || {}
    const limite = q.limit ? Number(q.limit) : null      // ausente = ilimitado
    const usado = Number(q.usage || 0)
    return {
        limite,
        usado,
        livre: limite === null ? Infinity : limite - usado,
        email: data.user?.emailAddress || null
    }
}

/**
 * Upload resumível, lendo o arquivo em pedaços.
 *
 * O upload simples (`uploadType=media`) exige o arquivo inteiro em UMA requisição:
 * qualquer oscilação de rede aos 2,8 GB perde tudo. O resumível envia por faixa e
 * o Google devolve, em caso de queda, o byte exato onde parou.
 *
 * @param {object} o
 * @param {(pct:number, enviados:number, total:number)=>void} [o.onProgress]
 * @returns {Promise<{id:string, name:string, size:number}>}
 */
async function uploadFile({ filePath, fileName, mimeType = 'video/mp4', folderId, onProgress }) {
    const token = await getAccessToken()
    const tamanho = fs.statSync(filePath).size
    const nome = fileName || path.basename(filePath)
    const pasta = folderId || cfg().folderId

    // 1. Abre a sessão: o Google devolve uma URL exclusiva desse upload.
    const metadata = { name: nome, ...(pasta ? { parents: [pasta] } : {}) }
    const inicio = await axios.post(UPLOAD_URL, metadata, {
        params: { uploadType: 'resumable', supportsAllDrives: true },
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': mimeType,
            'X-Upload-Content-Length': String(tamanho)
        },
        timeout: 60000
    })
    const sessao = inicio.headers.location
    if (!sessao) throw new Error('Google não devolveu a URL da sessão de upload')

    // 2. Envia pedaço a pedaço. 308 = "recebi, continue"; 200/201 = terminou.
    let enviados = 0
    let resultado = null
    let falhasSeguidas = 0

    while (enviados < tamanho) {
        const fim = Math.min(enviados + CHUNK_BYTES, tamanho) - 1
        const pedaco = fs.createReadStream(filePath, { start: enviados, end: fim })
        const bytesDoPedaco = fim - enviados + 1

        let resp
        try {
            resp = await axios.put(sessao, pedaco, {
                headers: {
                    'Content-Length': String(bytesDoPedaco),
                    'Content-Range': `bytes ${enviados}-${fim}/${tamanho}`
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 300000,
                // 308 não é erro: é o "continue" do protocolo resumível.
                validateStatus: s => s === 200 || s === 201 || s === 308
            })
            falhasSeguidas = 0
        } catch (e) {
            // Queda de rede: pergunta ao Google onde parou e retoma dali, em vez
            // de reenviar os GB já transferidos. Sem teto de tentativas isso
            // viraria laço infinito se a sessão morresse de vez.
            if (++falhasSeguidas > 5) {
                throw new Error(`Upload interrompido após 5 falhas seguidas: ${e.message}`)
            }
            logger.warn(`[GDRIVE] Falha no pedaço ${enviados}-${fim} (${falhasSeguidas}/5): ${e.message}. Retomando...`)
            const status = await axios.put(sessao, '', {
                headers: { 'Content-Range': `bytes */${tamanho}` },
                timeout: 60000,
                validateStatus: s => s === 308 || s === 200 || s === 201
            })
            const range = status.headers.range
            enviados = range ? Number(range.split('-')[1]) + 1 : enviados
            continue
        }

        if (resp.status === 308) {
            const range = resp.headers.range
            enviados = range ? Number(range.split('-')[1]) + 1 : fim + 1
        } else {
            enviados = tamanho
            resultado = resp.data
        }

        if (onProgress) {
            try {
                onProgress(Math.floor((enviados / tamanho) * 100), enviados, tamanho)
            } catch (e) {
                // Callback de UI não pode derrubar um upload de 3 GB.
                logger.warn(`[GDRIVE] onProgress falhou: ${e.message}`)
            }
        }
    }

    if (!resultado || !resultado.id) throw new Error('Upload terminou sem ID de arquivo')
    logger.info(`[GDRIVE] "${nome}" enviado (${require('../../utils/tamanho').formatarTamanho(tamanho)}) — id ${resultado.id}`)
    return { id: resultado.id, name: nome, size: tamanho }
}

/** Deixa o arquivo acessível por link (leitura para "qualquer um com o link"). */
async function tornarPublico(fileId) {
    const token = await getAccessToken()
    await axios.post(`${FILES_URL}/${fileId}/permissions`,
        { role: 'reader', type: 'anyone' },
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { supportsAllDrives: true },
            timeout: 30000
        })
    return links(fileId)
}

/**
 * Os dois links úteis:
 *  - visualizar: player do Drive, abre no navegador/app sem baixar
 *  - baixar: força o download do arquivo original, sem recompressão
 */
function links(fileId) {
    return {
        visualizar: `https://drive.google.com/file/d/${fileId}/view`,
        baixar: `https://drive.google.com/uc?export=download&id=${fileId}`
    }
}

/** Retorna o link web canônico para navegação da pasta no Google Drive */
function obterLinkPasta(folderId) {
    if (!folderId) return null
    return `https://drive.google.com/drive/folders/${folderId}`
}

/** Deixa a pasta acessível por link (leitura para qualquer pessoa com o link) */
async function tornarPastaPublica(folderId) {
    if (!folderId) return null
    try {
        const token = await getAccessToken()
        await axios.post(`${FILES_URL}/${folderId}/permissions`,
            { role: 'reader', type: 'anyone' },
            {
                headers: { Authorization: `Bearer ${token}` },
                params: { supportsAllDrives: true },
                timeout: 30000
            })
    } catch (e) {
        logger.warn(`[GDRIVE] Não foi possível definir permissão pública na pasta ${folderId}: ${e.message}`)
    }
    return obterLinkPasta(folderId)
}

async function deleteFile(fileId) {
    const token = await getAccessToken()
    await axios.delete(`${FILES_URL}/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { supportsAllDrives: true },
        timeout: 30000
    })
}

/** Cria a pasta se ainda não existir; devolve o id. Idempotente pelo nome. */
async function garantirPasta(nome, paiId = null) {
    const token = await getAccessToken()
    const nomeEscapado = nome.replace(/'/g, "\\'")
    const q = [
        `name='${nomeEscapado}'`,
        "mimeType='application/vnd.google-apps.folder'",
        'trashed=false',
        paiId ? `'${paiId}' in parents` : null
    ].filter(Boolean).join(' and ')

    const { data } = await axios.get(FILES_URL, {
        params: { q, fields: 'files(id,name)', supportsAllDrives: true },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
    })
    if (data.files && data.files.length) {
        const existingId = data.files[0].id
        await tornarPastaPublica(existingId).catch(() => {})
        return existingId
    }

    const { data: nova } = await axios.post(FILES_URL,
        { name: nome, mimeType: 'application/vnd.google-apps.folder', ...(paiId ? { parents: [paiId] } : {}) },
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { supportsAllDrives: true },
            timeout: 30000
        })
    logger.info(`[GDRIVE] Pasta "${nome}" criada — id ${nova.id}`)
    await tornarPastaPublica(nova.id).catch(() => {})
    return nova.id
}

/** Upload + link público num passo só (o caso de uso do bot). */
async function enviarECompartilhar({ filePath, fileName, mimeType, folderId, onProgress }) {
    let pasta = folderId || cfg().folderId
    if (!pasta) {
        try {
            pasta = await garantirPasta('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Downloads')
        } catch (err) {
            logger.warn(`[GDRIVE] Não foi possível criar pasta padrão: ${err.message}`)
        }
    } else {
        tornarPastaPublica(pasta).catch(() => {})
    }

    const arquivo = await uploadFile({ filePath, fileName, mimeType, folderId: pasta, onProgress })
    const url = await tornarPublico(arquivo.id)
    const folderUrl = pasta ? obterLinkPasta(pasta) : null

    return {
        ...arquivo,
        ...url,
        folderId: pasta,
        folderUrl
    }
}

module.exports = {
    isConfigured,
    getAccessToken,
    getQuota,
    uploadFile,
    tornarPublico,
    tornarPastaPublica,
    obterLinkPasta,
    links,
    deleteFile,
    garantirPasta,
    enviarECompartilhar,
    CHUNK_BYTES
}
