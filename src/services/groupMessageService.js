/**
 * Mensagens do grupo — modelos, variáveis e formatação.
 *
 * Cada grupo escreve os mesmos avisos repetidamente: boas-vindas, regras,
 * anúncio de evento, aviso de manutenção. Este serviço guarda esses textos como
 * modelos por grupo (em `profile_data`, sem migração) e resolve as variáveis na
 * hora do envio, para que o aviso saia com o nome certo e a contagem certa.
 *
 * Também concentra a formatação do WhatsApp num lugar só: negrito, itálico,
 * moldura, lista. Antes cada comando montava a moldura do seu jeito.
 */

const perfilData = require('./profileDataService')
const logger = require('../core/logger')

const CHAVE_MODELOS = 'mensagens_modelos'
const CHAVE_HISTORICO = 'mensagens_historico'

/** Quantos anúncios enviados ficam guardados por grupo. */
const TETO_HISTORICO = 100

/** Tamanho máximo de um modelo, para não estourar a mensagem do WhatsApp. */
const TETO_MODELO = 3000

/**
 * Modelos que todo grupo tem por padrão. Servem como ponto de partida:
 * o grupo edita o que quiser e o resto continua funcionando.
 */
const MODELOS_PADRAO = {
    boasvindas: '👋 *Boas-vindas ao {grupo}, {nome}!*\n\nQue bom ter você aqui. Já somos *{membros}* por aqui.\n\n📜 Leia as regras antes de mandar a primeira mensagem.\n💬 Apresente-se: conte seu nome e o que te trouxe ao grupo.',
    despedida: '👋 *{nome} deixou o {grupo}*\n\nObrigado pela companhia. Agora somos *{membros}*.',
    regras: '📜 *Regras do {grupo}*\n\n1️⃣ Respeito acima de tudo\n2️⃣ Sem divulgação sem permissão\n3️⃣ Sem conteúdo impróprio\n4️⃣ Sem excesso de mensagens seguidas',
    aviso: '⚠️ *Aviso*\n\n{texto}\n\n— A administração do {grupo}',
    anuncio: '📢 *Anúncio oficial do {grupo}*\n\n{texto}\n\n📅 {data}\n— A administração',
    evento: '🎉 *Evento no {grupo}*\n\n{texto}\n\n📅 {data}\n👥 Todos os {membros} membros estão convidados!',
    manutencao: '🔧 *Manutenção*\n\nVou ficar fora do ar por um tempo. Os comandos podem não responder até eu voltar.\n\n{texto}\n\n🙏 Aviso aqui assim que tudo estiver normal.',
    retorno: '✅ *Tudo normalizado*\n\nVoltei a funcionar e os comandos já respondem de novo. Obrigado pela paciência!',
    fechamento: '🔒 *Grupo fechado*\n\nPor enquanto, só a administração pode mandar mensagens.\n\n{texto}\n\n⏳ Avisaremos quando o grupo abrir de novo.',
    abertura: '🔓 *Grupo aberto*\n\nTodos podem voltar a falar. Bom papo, e lembrem das regras!',
    parceria: '🤝 *Parceria*\n\n{texto}\n\n📩 Interessados falem com a administração do {grupo}.',
    aniversario: '🎂 *Parabéns, {nome}!*\n\nO {grupo} inteiro deseja muita saúde, alegria e conquistas no seu novo ano. 🎉🥳'
}

const VARIAVEIS = {
    '{nome}': 'nome de quem disparou ou foi mencionado',
    '{grupo}': 'nome do grupo',
    '{membros}': 'quantidade de participantes',
    '{data}': 'data de hoje',
    '{hora}': 'hora atual',
    '{texto}': 'o texto que você passar no comando',
    '{admin}': 'quem executou o comando'
}

// ══════════════════════════════════════════════════════════════
// MODELOS
// ══════════════════════════════════════════════════════════════

function modelos(grupoJid) {
    try {
        const bruto = perfilData.getData(grupoJid, CHAVE_MODELOS, null)
        const salvos = bruto ? (typeof bruto === 'string' ? JSON.parse(bruto) : bruto) : {}
        return { ...MODELOS_PADRAO, ...salvos }
    } catch (err) {
        logger.warn(`[MSG] Modelos de ${grupoJid} ilegíveis: ${err.message} — usando os padrões.`)
        return { ...MODELOS_PADRAO }
    }
}

/** Só os modelos que o grupo alterou, para saber o que é personalizado. */
function personalizados(grupoJid) {
    try {
        const bruto = perfilData.getData(grupoJid, CHAVE_MODELOS, null)
        return bruto ? (typeof bruto === 'string' ? JSON.parse(bruto) : bruto) : {}
    } catch (err) {
        logger.warn(`[MSG] Personalizados de ${grupoJid} ilegíveis: ${err.message}`)
        return {}
    }
}

function definirModelo(grupoJid, chave, texto) {
    const k = String(chave || '').toLowerCase().trim()
    if (!k) return { ok: false, erro: 'Informe o nome do modelo.' }
    if (!/^[a-z0-9_-]{2,20}$/.test(k)) return { ok: false, erro: 'O nome só aceita letras, números, hífen e sublinhado (2 a 20).' }
    if (!texto || !texto.trim()) return { ok: false, erro: 'O texto do modelo está vazio.' }
    if (texto.length > TETO_MODELO) return { ok: false, erro: `O modelo passa de ${TETO_MODELO} caracteres.` }
    try {
        const atuais = personalizados(grupoJid)
        atuais[k] = texto
        perfilData.setData(grupoJid, CHAVE_MODELOS, JSON.stringify(atuais))
        return { ok: true, chave: k }
    } catch (err) {
        logger.error(`[MSG] Falha ao salvar modelo "${k}" em ${grupoJid}: ${err.message}`)
        return { ok: false, erro: 'Não consegui salvar o modelo agora. Tente de novo em instantes.' }
    }
}

function apagarModelo(grupoJid, chave) {
    const k = String(chave || '').toLowerCase().trim()
    const atuais = personalizados(grupoJid)
    if (!(k in atuais)) {
        return { ok: false, erro: MODELOS_PADRAO[k] ? 'Esse modelo é padrão e nunca foi alterado.' : 'Modelo não encontrado.' }
    }
    delete atuais[k]
    perfilData.setData(grupoJid, CHAVE_MODELOS, JSON.stringify(atuais))
    return { ok: true, voltouAoPadrao: !!MODELOS_PADRAO[k] }
}

/**
 * Substitui as variáveis do modelo pelos valores reais.
 * Variável sem valor vira texto vazio em vez de ficar visível — ninguém quer
 * ler "{membros}" num aviso oficial.
 */
function resolver(texto, dados = {}) {
    if (typeof texto !== 'string') return ''
    const agora = new Date()
    const valores = {
        '{nome}': dados.nome || '',
        '{grupo}': dados.grupo || 'grupo',
        '{membros}': dados.membros != null ? String(dados.membros) : '',
        '{data}': agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        '{hora}': agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
        '{texto}': dados.texto || '',
        '{admin}': dados.admin || ''
    }
    let saida = texto
    for (const [chave, valor] of Object.entries(valores)) {
        saida = saida.split(chave).join(valor)
    }
    return saida.replace(/\n{3,}/g, '\n\n').trim()
}

// ══════════════════════════════════════════════════════════════
// HISTÓRICO DE ENVIOS
// ══════════════════════════════════════════════════════════════

function historico(grupoJid) {
    try {
        const bruto = perfilData.getData(grupoJid, CHAVE_HISTORICO, '[]')
        const dados = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
        return Array.isArray(dados) ? dados : []
    } catch (err) {
        logger.warn(`[MSG] Histórico de ${grupoJid} ilegível: ${err.message}`)
        return []
    }
}

function registrarEnvio(grupoJid, { modelo, autor, tamanho }) {
    try {
        const atual = historico(grupoJid)
        atual.unshift({ em: Date.now(), modelo, autor, tamanho })
        perfilData.setData(grupoJid, CHAVE_HISTORICO, JSON.stringify(atual.slice(0, TETO_HISTORICO)))
        return true
    } catch (err) {
        logger.warn(`[MSG] Falha ao registrar envio em ${grupoJid}: ${err.message}`)
        return false
    }
}

// ══════════════════════════════════════════════════════════════
// FORMATAÇÃO
// ══════════════════════════════════════════════════════════════

function moldura(titulo, corpo) {
    return `╔══════════════════════════════╗\n║   ${titulo}\n╚══════════════════════════════╝\n\n${corpo}`
}

// Título numa linha, em frase. Era moldura desenhada + CAIXA ALTA forçada, que
// o dono mandou tirar de todas as mensagens em 2026-09-15.
function titulo(texto) {
    const t = require('./vozService').tituloEmFrase(String(texto || '').trim())
    return `*${t}*`
}

function lista(itens, marcador = '▫️') {
    return (itens || []).map(i => `${marcador} ${i}`).join('\n')
}

function numerada(itens) {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    return (itens || []).map((i, n) => `${emojis[n] || (n + 1) + '.'} ${i}`).join('\n')
}

/** Remove a formatação do WhatsApp, deixando o texto cru. */
function limpar(texto) {
    return String(texto || '')
        .replace(/[*_~]/g, '')
        .replace(/```/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

/**
 * Divide um texto longo em partes que cabem numa mensagem.
 * Quebra em parágrafo sempre que possível: cortar no meio de uma frase deixa
 * o aviso ilegível.
 */
function dividir(texto, limite = 3500) {
    const t = String(texto || '')
    if (t.length <= limite) return [t]
    const partes = []
    let restante = t
    while (restante.length > limite) {
        let corte = restante.lastIndexOf('\n\n', limite)
        if (corte < limite * 0.5) corte = restante.lastIndexOf('\n', limite)
        if (corte < limite * 0.5) corte = restante.lastIndexOf(' ', limite)
        if (corte <= 0) corte = limite
        partes.push(restante.slice(0, corte).trim())
        restante = restante.slice(corte).trim()
    }
    if (restante) partes.push(restante)
    return partes
}

/** Estatísticas simples de um texto, para quem escreve o aviso. */
function medir(texto) {
    const t = String(texto || '')
    const palavras = t.trim() ? t.trim().split(/\s+/).length : 0
    return {
        caracteres: t.length,
        semEspacos: t.replace(/\s/g, '').length,
        palavras,
        linhas: t.split('\n').length,
        partes: dividir(t).length,
        leituraSegundos: Math.ceil(palavras / 3.3)
    }
}

module.exports = {
    MODELOS_PADRAO,
    VARIAVEIS,
    TETO_MODELO,
    TETO_HISTORICO,
    modelos,
    personalizados,
    definirModelo,
    apagarModelo,
    resolver,
    historico,
    registrarEnvio,
    moldura,
    titulo,
    lista,
    numerada,
    limpar,
    dividir,
    medir
}
