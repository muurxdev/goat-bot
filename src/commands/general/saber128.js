/**
 * Comando .corpohumano — CORPO HUMANO
 *
 * Índice dos sistemas do corpo. O conteúdo vem de services/bodyService, então
 * a lista nunca fica defasada em relação às fichas individuais.
 *
 * COMANDO é o mapa de chave do serviço para o comando que a exibe: quase todos
 * seguem 'sistema' + chave, e o urinário responde pelo nome histórico
 * .sistemaexcretor, que já estava publicado.
 */
const B = require('../../services/bodyService')

const COMANDO = { urinario: 'sistemaexcretor' }

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }

module.exports = {
    name: 'corpohumano',
    aliases: ["sistemascorpo"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Todos os sistemas do corpo humano e o que cada um faz',
    cooldownMs: 3000,
    execute: async ({ reply, prefix = '.' }) => {
        let doc = cab('CORPO HUMANO', '🫀')
        doc += linha('Sistemas', String(Object.keys(B.SISTEMAS).length))
        doc += linha('Órgãos com ficha', String(Object.keys(B.ORGAOS).length)) + '\n'
        for (const [chave, s] of Object.entries(B.SISTEMAS)) {
            doc += '┃ *' + s.nome + '*\n'
            doc += '┃    ' + s.funcao + '\n'
            doc += '┃    `' + prefix + (COMANDO[chave] || ('sistema' + chave)) + '`\n'
        }
        doc += '\n🧬 _Órgãos:_ `' + prefix + 'orgaos`'
        doc += '   🥗 _Nutrientes:_ `' + prefix + 'nutrientes`'
        doc += '\n🧪 _Exames:_ `' + prefix + 'exames`'
        doc += '   ❤️ _Zonas de treino:_ `' + prefix + 'zonatreino`'
        doc += '\n\n_Informação geral de saúde. Sintoma que preocupa se resolve com consulta, não com busca._'
        return reply(doc)
    }
}
