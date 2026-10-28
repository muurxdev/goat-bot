/**
 * Comando .checkupseguranca — CHECK-UP DE SEGURANÇA
 *
 * Roteiro de 10 minutos para revisar suas contas.
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
    name: 'checkupseguranca',
    aliases: ["revisaoseguranca"],
    category: 'general',
    subcategory: 'Segurança Digital',
    description: 'Roteiro de 10 minutos para revisar suas contas',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', isGroup, prefix = '.' }) => {
    let doc = cab('CHECK-UP DE SEGURANÇA', '✅')
    doc += '_Dez minutos, uma vez por ano. Na ordem, do que mais protege para o que menos protege._\n\n'
    doc += bloco('1️⃣ E-MAIL PRINCIPAL (5 min)', [
        'Senha longa e usada só ali',
        'Verificação em duas etapas ativa',
        'Endereço de recuperação confere',
        'Nenhuma regra de encaminhamento estranha',
        'Lista de aparelhos conectados sem desconhecidos'
    ])
    doc += bloco('2️⃣ APLICATIVO DE MENSAGEM (2 min)', [
        'Verificação em duas etapas com PIN ativa',
        'Aparelhos conectados revisados',
        'Foto e visto por último restritos a contatos',
        'Grupos: só contatos podem te adicionar'
    ])
    doc += bloco('3️⃣ BANCO E PAGAMENTO (2 min)', [
        'Aviso de compra por mensagem ligado',
        'Limite do cartão compatível com o seu uso',
        'Cartão virtual para compra na internet',
        'Chaves de pagamento cadastradas conferidas'
    ])
    doc += bloco('4️⃣ CELULAR (1 min)', [
        'Bloqueio de tela com senha forte por trás da digital',
        'Atualização automática ligada',
        'Localizar meu aparelho ativado',
        'IMEI anotado fora do celular (disque *#06#)'
    ])
    doc += '\n🔐 _Testar uma senha (no privado):_ `' + prefix + 'checarsenha`\n'
    doc += '🛡️ _Entender cada item:_ `' + prefix + 'praticasseguranca`'
    return reply(doc)
    }
}
