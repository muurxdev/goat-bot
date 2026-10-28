/**
 * Comando .verdadeoudesafio — sorteia uma verdade ou um desafio (leve, p/ grupo).
 */
const F = require('../../utils/formato')
const VERDADES = [
    'Qual foi o bug mais vergonhoso que você já causou?',
    'Você já commitou direto na main sem revisar? Conta a história.',
    'Qual linguagem você finge gostar mas na verdade odeia?',
    'Já copiou código do Stack Overflow sem entender? Quantas vezes?',
    'Qual sua desculpa favorita quando o deploy quebra?',
    'Você já mandou mensagem no grupo errado? O que era?',
    'Qual app você mais perde tempo quando deveria estar codando?',
    'Já dormiu em reunião online? Assume.'
]
const DESAFIOS = [
    'Mande o print da sua última aba do navegador aberta.',
    'Escreva uma mensagem só usando emojis por 3 turnos.',
    'Conte uma piada de programação AGORA.',
    'Explique o que você faz para uma criança de 5 anos, em 1 frase.',
    'Mande um áudio cantando o refrão da música que está ouvindo.',
    'Digite com os olhos fechados: "os sete pecados capitais".',
    'Elogie sinceramente a pessoa que mandou a última mensagem.',
    'Mande sua foto de perfil de 2015 (ou a mais antiga que achar).'
]

module.exports = {
    name: 'verdadeoudesafio',
    aliases: ['verdadedesafio', 'vd', 'truthordare'],
    category: 'fun',
    subcategory: 'Diversão',
    description: 'Sorteia uma verdade ou um desafio para o grupo',
    usage: '[verdade|desafio]',
    examples: [' — sorteia verdade ou desafio', 'verdade — pede uma pergunta de verdade', 'desafio — pede um desafio'],
    cooldownMs: 2000,
    execute: async ({ args, reply, prefix = '.' }) => {
        const escolha = (args[0] || '').toLowerCase()
        let tipo
        if (escolha.startsWith('v')) tipo = 'verdade'
        else if (escolha.startsWith('d')) tipo = 'desafio'
        else tipo = Math.random() < 0.5 ? 'verdade' : 'desafio'

        if (tipo === 'verdade') {
            const q = VERDADES[Math.floor(Math.random() * VERDADES.length)]
            return reply(F.tela({
                emoji: '🟢',
                titulo: 'Verdade',
                intro: `❓ *${q}*`,
                dica: 'Responda com sinceridade: o grupo sabe quando é mentira.',
                proximos: [
                    { nome: 'verdadeoudesafio', args: 'desafio', oque: 'pedir um desafio' },
                    { nome: 'verdadeoudesafio', args: 'verdade', oque: 'outra verdade' }
                ],
                prefix
            }))
        }
        const d = DESAFIOS[Math.floor(Math.random() * DESAFIOS.length)]
        return reply(F.tela({
            emoji: '🔴',
            titulo: 'Desafio',
            intro: `🎯 *${d}*`,
            dica: 'Recusou? O grupo escolhe uma prenda no lugar.',
            proximos: [
                { nome: 'verdadeoudesafio', args: 'verdade', oque: 'pedir uma verdade' },
                { nome: 'verdadeoudesafio', args: 'desafio', oque: 'outro desafio' }
            ],
            prefix
        }))
    }
}
