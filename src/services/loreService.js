/**
 * Tradutor de jargão.
 *
 * Aplica o GLOSSARIO de config/lore.js (jargão → português simples) sobre o
 * texto que sai para o usuário.
 * Existe porque revisar 447 arquivos à mão não resolve o problema: mensagens de
 * erro nascem dentro de bibliotecas ("connect ETIMEDOUT", "Unexpected token in
 * JSON") e chegam ao usuário sem passar por nenhum texto que eu tenha escrito.
 * O filtro fica no ponto de saída, então cobre inclusive o que ainda não existe.
 *
 * O que NUNCA é traduzido, porque traduzir quebraria:
 *   - blocos de código (```...```) e trechos em crase (`...`)
 *   - URLs e e-mails
 *   - nomes de comando (.sqlformatter continua .sqlformatter)
 *
 * E o filtro é desligado na seção Dev/Skycode: lá o termo técnico é o assunto,
 * não um vazamento.
 */

const { AsyncLocalStorage } = require('node:async_hooks')
const { GLOSSARIO } = require('../config/lore')
const logger = require('../core/logger')

/** Trechos preservados na íntegra, na ordem em que são extraídos. */
// Expressões do português corrente em que uma palavra do glossário aparece com
// outro sentido. 'Servidor público' é uma pessoa, não uma máquina; 'módulo
// lunar' é uma nave. Protegê-las inteiras é mais seguro do que estreitar a
// regra do glossário, que continua valendo para o sentido técnico.
const EXPRESSOES_COMUNS = [
    /servidor(?:es)?\s+p[úu]blic(?:o|os)/gi,
    /servidora?s?\s+p[úu]blica?s?/gi,
    /m[óo]dulo\s+(?:lunar|de\s+comando|de\s+servi[çc]o|habit[áa]vel)/gi,
    /mem[óo]ria\s+(?:afetiva|muscular|coletiva)/gi,
    /padr[ãa]o\s+(?:de\s+(?:vida|qualidade|beleza|consumo|comportamento)|ouro)/gi,
    /por\s+padr[ãa]o/gi
]

const PADROES_PROTEGIDOS = [
    /```[\s\S]*?```/g,            // bloco de código
    /`[^`\n]*`/g,                 // código em linha
    /https?:\/\/\S+/gi,           // URL
    /\b[\w.+-]+@[\w-]+\.[\w.]+/g, // e-mail
    /(?:^|\s)[.!/#]\w[\w-]*/g,    // nome de comando (.play, /menu, !ping)
    // Nome próprio de duas ou mais palavras capitalizadas ("Lobo Full Stack",
    // "Servidor Infernal"): é nome de item, pet ou mundo, não jargão. Sem isto
    // a loja mostrava "Full detalhes do erro" e "sistema Infernal".
    /(?<![\p{L}\p{N}_])\p{Lu}\p{Ll}+(?:[ -]\p{Lu}\p{Ll}+)+(?![\p{L}\p{N}_])/gu,
    ...EXPRESSOES_COMUNS
]

// Marcadores de reserva. Usam caracteres de uso privado do Unicode: não
// aparecem em texto escrito por gente e não são tocados por nenhuma regra do
// glossário, então o texto protegido volta intacto.
const ABRE = ''
const FECHA = ''

/**
 * Faz o termo do Reino seguir o estilo do texto ao redor.
 *
 * Um cabeçalho como "ÚLTIMAS MOVIMENTAÇÕES (SQLITE)" deve virar "(GRIMÓRIO)",
 * mas "use isso no SQL" não pode virar "no IDIOMA RÚNICO" — siglas são
 * maiúsculas por natureza, então olhar só a palavra encontrada engana. Quem
 * decide é a linha inteira: se ela já está em caixa alta, o termo acompanha.
 */
function ajustarCaixa(achado, troca, offset, texto) {
    if (!/[a-zA-ZÀ-ÿ]/.test(achado) || achado !== achado.toUpperCase()) return troca

    const inicioLinha = texto.lastIndexOf('\n', offset) + 1
    let fimLinha = texto.indexOf('\n', offset)
    if (fimLinha === -1) fimLinha = texto.length

    // Letras da linha, tirando a própria ocorrência.
    const linha = texto.slice(inicioLinha, offset) + texto.slice(offset + achado.length, fimLinha)
    const letras = linha.match(/[a-zA-ZÀ-ÿ]/g) || []
    if (letras.length < 3) return troca

    const maiusculas = letras.filter(c => c === c.toUpperCase()).length
    return (maiusculas / letras.length) >= 0.7 ? troca.toUpperCase() : troca
}

/**
 * Substitui os trechos protegidos por marcadores, roda as trocas do glossário e
 * devolve os trechos ao lugar.
 */
function traduzir(texto) {
    if (typeof texto !== 'string' || !texto) return texto

    const guardados = []
    let trabalho = texto

    for (const padrao of PADROES_PROTEGIDOS) {
        padrao.lastIndex = 0
        trabalho = trabalho.replace(padrao, (achado) => {
            guardados.push(achado)
            return `${ABRE}${guardados.length - 1}${FECHA}`
        })
    }

    for (const [regex, troca] of GLOSSARIO) {
        // Regex globais carregam lastIndex entre chamadas; zerar evita pular
        // ocorrências de forma intermitente e difícil de depurar.
        regex.lastIndex = 0
        trabalho = trabalho.replace(regex, (...args) => {
            // Os dois últimos argumentos de replace são sempre offset e texto
            // completo; o que vem antes depende dos grupos de captura da regra.
            const texto = args[args.length - 1]
            const offset = args[args.length - 2]
            return ajustarCaixa(args[0], troca, offset, texto)
        })
    }

    trabalho = colapsarRepetido(trabalho)

    return trabalho.replace(new RegExp(`${ABRE}(\\d+)${FECHA}`, 'g'), (_, i) => guardados[Number(i)] ?? '')
}

/**
 * Colapsa trocas repetidas lado a lado.
 *
 * Aparecem porque duas palavras técnicas diferentes viram o mesmo termo:
 * "banco de dados SQLite" → "registro registro", "servidor VPS" → "sistema
 * sistema". Repetir assim é pior que o jargão original.
 */
function colapsarRepetido(texto) {
    const TERMOS = [
        'registros?', 'sistemas?', 'integração|integrações', 'arquivos? temporários?',
        'salvamentos?', 'blocos? de dados', 'arquivos? de dados', 'recursos?',
        'consultas?', 'conexão|conexões', 'memória', 'identificador(?:es)?'
    ]
    let saida = texto
    for (const termo of TERMOS) {
        // Duas ocorrências coladas: separadas por espaço, barra, hífen, "&" ou "+"
        // ("SERVIDOR & VPS" → "SISTEMA & SISTEMA" → "SISTEMA"). "e" e vírgula
        // ficam de fora: juntar ali quebra a concordância ("servidor e VPS
        // reiniciados" → "sistema reiniciados") e apaga itens de uma lista.
        const coladas = new RegExp(`(${termo})(?:\\s*[/&+-]\\s*|\\s+)(?:${termo})(?![\\p{L}\\p{N}_])`, 'giu')
        // ...ou a segunda entre parênteses/colchetes, como em
        // "Banco de Dados (SQLite)" → "Grimório (Grimório)".
        const entreParenteses = new RegExp(`(${termo})\\s*[([]\\s*(?:${termo})\\s*[)\\]]`, 'gi')
        let anterior
        do {
            anterior = saida
            saida = saida.replace(coladas, '$1').replace(entreParenteses, '$1')
        } while (saida !== anterior)
    }
    return saida
}

/**
 * Aplica a tradução com proteção: se algo der errado, devolve o texto original.
 * Uma falha aqui jamais pode impedir a resposta de chegar ao usuário.
 */
function traduzirSeguro(texto) {
    try {
        return traduzir(texto)
    } catch (err) {
        logger.warn(`[LORE] Falha ao traduzir a resposta: ${err.message} — enviando o texto original.`)
        return texto
    }
}


// ══════════════════════════════════════════════════════════════
// ISENÇÃO POR EXECUÇÃO
// ══════════════════════════════════════════════════════════════

/**
 * Marca a execução atual como isenta de tradução.
 *
 * Precisa ser por execução, não uma variável de módulo: dois comandos podem
 * estar no ar ao mesmo tempo (um comando de mídia lento e um .ping), e uma
 * flag global faria o texto de um vazar a isenção do outro. AsyncLocalStorage
 * carrega o valor por cadeia assíncrona, que é exatamente o recorte certo.
 */
const contexto = new AsyncLocalStorage()

/** Roda `fn` com a tradução desligada para tudo que ela enviar. */
function semLore(fn) {
    return contexto.run({ isento: true }, fn)
}

/** Diz se a execução atual está isenta. */
function estaIsento() {
    return contexto.getStore()?.isento === true
}

/**
 * Traduz um conteúdo do Baileys: mexe apenas nos campos que o usuário lê
 * (`text` e `caption`) e devolve o resto do objeto intocado.
 *
 * O layout passa como veio: as caixas (╔═╗, ╭━〔 〕━⬣, ┃) voltaram por decisão do
 * dono em 2026-09-18. Até então o vozService.normalizarLayout apagava todas
 * aqui, no ponto de saída. A troca de jargão respeita a isenção.
 */
function traduzirConteudo(conteudo) {
    if (!conteudo || typeof conteudo !== 'object') return conteudo
    const isento = estaIsento()

    let copia = null
    for (const campo of ['text', 'caption']) {
        const valor = conteudo[campo]
        if (typeof valor !== 'string' || !valor) continue
        const traduzido = isento ? valor : traduzirSeguro(valor)
        if (traduzido === valor) continue
        if (!copia) copia = { ...conteudo }
        copia[campo] = traduzido
    }
    return copia || conteudo
}

module.exports = { traduzir, traduzirSeguro, traduzirConteudo, semLore, estaIsento }
