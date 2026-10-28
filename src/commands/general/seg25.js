/**
 * Comando .checarsenha — FORÇA DA SENHA
 *
 * Avalia a força de uma senha — só no privado.
 */

const D = require('../../services/digitalSafetyService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}


module.exports = {
    name: 'checarsenha',
    aliases: ["testarsenha","minhasenha"],
    category: 'general',
    subcategory: 'Segurança Digital',
    description: 'Avalia a força de uma senha — só no privado',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', isGroup, prefix = '.' }) => {
    // Um comando que recebe senha NÃO pode rodar em grupo: a mensagem fica
    // visível para todo mundo e no histórico. Recusar aqui é a única resposta
    // correta, mesmo que o usuário insista.
    if (isGroup) {
        let doc = cab('FORÇA DA SENHA', '🔐')
        doc += '🚫 *Este comando não funciona em grupo — de propósito.*\n\n'
        doc += 'Sua senha ficaria visível para todos os participantes e gravada no histórico da conversa.\n\n'
        doc += '📩 *Chame no privado* e mande `' + prefix + 'checarsenha sua-senha` lá.\n\n'
        doc += '💡 _Se você já digitou uma senha real num grupo, troque essa senha agora:_ `' + prefix + 'emergenciasenhavazada`'
        return reply(doc)
    }
    const senha = (text || args.join(' ')).trim()
    if (!senha) {
        let doc = cab('FORÇA DA SENHA', '🔐')
        doc += '📌 Uso: `' + prefix + 'checarsenha <senha>`\n\n'
        doc += '🔒 *O que este comando NÃO faz*\nNão guarda, não registra e não repete a sua senha na resposta. A avaliação é feita e descartada.\n\n'
        doc += '💡 _Não quer arriscar? Teste uma senha PARECIDA com a sua, do mesmo tamanho e formato._\n'
        doc += '🎲 _Ou peça uma pronta:_ `' + prefix + 'frasesenha`'
        return reply(doc)
    }
    const a = D.avaliarSenha(senha)
    let doc = cab('FORÇA DA SENHA', '🔐')
    doc += linha('Tamanho', a.tamanho + ' caracteres')
    doc += linha('Usa', [a.tem.minuscula && 'minúscula', a.tem.maiuscula && 'maiúscula', a.tem.numero && 'número', a.tem.simbolo && 'símbolo'].filter(Boolean).join(', ') || 'um tipo só')
    doc += sep()
    doc += a.emoji + ' *' + a.nivel + '*\n'
    doc += '⏱️ Tempo para quebrar por força bruta: *' + D.tempoLegivel(a.segundos) + '*\n\n'
    if (a.fraquezas.length) {
        doc += bloco('⚠️ O QUE ENFRAQUECE', a.fraquezas)
    } else {
        doc += '✅ _Nenhum padrão previsível encontrado._\n'
    }
    doc += '\n💡 *A regra que importa*\nTamanho vence complexidade. Uma frase de quatro palavras aleatórias resiste mais que oito caracteres cheios de símbolo.\n\n'
    doc += '🎲 _Gerar uma frase-senha:_ `' + prefix + 'frasesenha`   📖 _Entender:_ `' + prefix + 'praticasenhaforte`'
    return reply(doc)
    }
}
