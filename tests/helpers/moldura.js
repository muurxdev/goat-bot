/**
 * Conferência do visual de caixas (src/utils/moldura.js) para os testes.
 *
 * Até 2026-09-18 os testes proibiam qualquer caractere de caixa; o dono pediu a
 * volta das caixas e a regra virou "caixa bem formada": seção aberta com
 * "╭━〔" fecha com "╰…⬣" antes da próxima, e cabeçalho "╔" vem com "║" e "╚".
 */

/**
 * Descreve o primeiro defeito de moldura do texto, ou null se estiver certo.
 * @param {string} texto
 * @returns {string|null}
 */
function molduraQuebrada(texto) {
    const linhas = String(texto ?? '').split('\n')
    let aberta = null
    for (let i = 0; i < linhas.length; i++) {
        const l = linhas[i].trim()
        if (l.startsWith('╔')) {
            // Uma ou mais linhas "║" (título e subtítulo) e o fecho "╚".
            let j = i + 1
            while (linhas[j]?.trim().startsWith('║')) j++
            if (j === i + 1 || !linhas[j]?.trim().startsWith('╚')) {
                return `cabeçalho incompleto na linha ${i + 1}`
            }
        }
        if (l.startsWith('╭━〔')) {
            if (aberta !== null) return `seção da linha ${aberta + 1} não fechou antes da linha ${i + 1}`
            if (!/〕━⬣$/.test(l)) return `abertura de seção malformada na linha ${i + 1}`
            aberta = i
        } else if (l.startsWith('╰')) {
            if (aberta === null) return `fechamento sem abertura na linha ${i + 1}`
            aberta = null
        } else if (aberta !== null && l && !l.startsWith('┃')) {
            return `linha ${i + 1} dentro da seção sem "┃": ${l.slice(0, 40)}`
        }
    }
    return aberta !== null ? `seção da linha ${aberta + 1} não fechou` : null
}

/**
 * Tira as linhas de título da moldura (cabeçalho e aberturas de seção), que são
 * em MAIÚSCULAS de propósito: "TODO MUNDO" num título não é marcador de código.
 */
function semTitulosDeMoldura(texto) {
    return String(texto ?? '').split('\n')
        .filter(l => !/^\s*(║|╭━〔)/.test(l))
        .join('\n')
}

/**
 * O trecho aparece no texto, sem diferença de maiúscula. Títulos de moldura
 * saem em MAIÚSCULAS ("✅ *ALUGUEL JÁ ATIVO*"), então conferir o título pela
 * grafia de frase ("Aluguel já ativo") precisa ignorar a caixa da letra.
 */
function temTexto(texto, trecho) {
    const t = Array.isArray(texto) ? texto.join('\n') : String(texto ?? '')
    return t.toLocaleLowerCase('pt-BR').includes(String(trecho).toLocaleLowerCase('pt-BR'))
}

module.exports = { molduraQuebrada, semTitulosDeMoldura, temTexto }
