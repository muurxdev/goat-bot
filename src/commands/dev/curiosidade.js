/**
 * Comando .curiosidade
 * Exibe fatos e curiosidades científicas, históricas e tecnológicas
 */

const FACTS = [
    "O primeiro bug de computador registrado na história foi uma mariposa real presa dentro de um relé do computador Harvard Mark II em 1947.",
    "O cérebro humano gera cerca de 20 watts de energia elétrica enquanto está acordado, o suficiente para acender uma lâmpada LED fraca.",
    "O Sol representa cerca de 99,86% de toda a massa presente no Sistema Solar.",
    "O mel é o único alimento natural conhecido que nunca estraga; arqueólogos encontraram potes de mel comestíveis de mais de 3.000 anos em tumbas egípcias.",
    "O protocolo HTTP original, criado por Tim Berners-Lee em 1989 no CERN, tinha apenas um método: GET.",
    "A Grande Muralha da China não é uma linha contínua, mas sim uma rede de muralhas e fortificações construídas ao longo de várias dinastias.",
    "O núcleo da Terra é tão quente quanto a superfície do Sol, atingindo cerca de 5.500 °C.",
    "Mais de 90% de todas as moedas e dinheiro em circulação no mundo existem apenas em formato digital em servidores bancários."
];

module.exports = {
    name: "curiosidade",
    aliases: ["fato","curiosidades","voce-sabia","sabiaque","cmd_curiosidade","alt_curiosidade","atalho_curiosidade","abrev_curiosidade","call_curiosidade","func_curiosidade"],
    category: "dev",
    description: "Descubra fatos fascinantes sobre ciência, história e tecnologia",
    execute: async ({ reply }) => {
        const fact = FACTS[Math.floor(Math.random() * FACTS.length)];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    💡 *VOCÊ SABIA? / CURIOSIDADE* 💡 ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ "${fact}"\n\n`;
        doc += `📚 _Conhecimento nunca é demais! Digite \`.curiosidade\` para outro fato._`;

        return reply(doc.trim());
    }
};

