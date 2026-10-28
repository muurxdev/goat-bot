/**
 * Comando .gerarmac — Gera um endereço MAC de rede aleatório
 */
const F = require('../../utils/formato')

module.exports = {
    name: "gerarmac",
    aliases: ["macrandom","cmd_gerarmac","alt_gerarmac","atalho_gerarmac","abrev_gerarmac","call_gerarmac","func_gerarmac"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um endereço MAC de rede aleatório",
    examples: [' — gera um MAC em três formatos'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
            const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
            const partes = [hex(), hex(), hex(), hex(), hex(), hex()];
            const mac = partes.join(':');
            return reply(F.tela({
                emoji: '🌐',
                titulo: 'Endereço MAC gerado',
                intro: '`' + mac + '`',
                secoes: [{
                    emoji: '📋', titulo: 'Outros formatos',
                    linhas: [
                        F.campo('Com hífen', '`' + partes.join('-') + '`'),
                        F.campo('Sem separador', '`' + partes.join('').toLowerCase() + '`'),
                        F.campo('Estilo Cisco', '`' + (partes.join('').toLowerCase().match(/.{4}/g) || []).join('.') + '`')
                    ]
                }],
                dica: 'É um endereço sorteado, sem fabricante real. Serve para testes e configurações de exemplo.',
                proximos: [
                    { nome: 'macformat', args: mac, oque: 'converter o formato' },
                    { nome: 'geraripv6', oque: 'gerar um IPv6' },
                    { nome: 'gerarmac', oque: 'gerar outro MAC' }
                ],
                prefix
            }));
        }
};
