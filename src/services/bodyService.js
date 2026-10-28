/**
 * Corpo humano: sistemas, órgãos, nutrientes e exames.
 *
 * Cada ficha responde três coisas: o que é, o que faz e o sinal de que algo
 * vai mal. O campo `sinal` existe para ser útil, não para diagnosticar — todos
 * os comandos que usam este serviço dizem isso no rodapé.
 *
 * Valores de referência de exames variam por laboratório, idade e sexo. Os
 * intervalos aqui são os mais comuns em adultos e servem para entender a
 * ordem de grandeza, nunca para substituir o laudo.
 */

const SISTEMAS = {
    circulatorio: { nome: 'Sistema circulatório', orgaos: 'Coração, artérias, veias, capilares',
        funcao: 'Transporta oxigênio, nutrientes, hormônios e calor, e recolhe resíduos.',
        numero: 'Cerca de 100 mil km de vasos — daria duas voltas e meia na Terra.',
        sinal: 'Falta de ar aos esforços, inchaço nas pernas e dor no peito pedem avaliação.' },
    respiratorio: { nome: 'Sistema respiratório', orgaos: 'Nariz, traqueia, brônquios, pulmões, diafragma',
        funcao: 'Traz oxigênio para o sangue e elimina gás carbônico.',
        numero: 'Cerca de 480 milhões de alvéolos, com área total próxima à de uma quadra de tênis.',
        sinal: 'Tosse por mais de três semanas, chiado ou falta de ar em repouso merecem consulta.' },
    digestorio: { nome: 'Sistema digestório', orgaos: 'Boca, esôfago, estômago, intestinos, fígado, pâncreas',
        funcao: 'Quebra o alimento em moléculas absorvíveis e descarta o que sobra.',
        numero: 'Cerca de 9 metros da boca ao ânus; o intestino delgado responde por 6 deles.',
        sinal: 'Mudança persistente do hábito intestinal, sangue nas fezes ou perda de peso sem motivo.' },
    nervoso: { nome: 'Sistema nervoso', orgaos: 'Cérebro, medula espinhal, nervos',
        funcao: 'Capta estímulos, processa informação e comanda todo o resto do corpo.',
        numero: 'Cerca de 86 bilhões de neurônios; o sinal viaja até 120 m/s nos nervos mais rápidos.',
        sinal: 'Perda súbita de força, fala arrastada ou desvio no rosto: emergência, ligue 192.' },
    muscular: { nome: 'Sistema muscular', orgaos: 'Músculos esqueléticos, lisos e cardíaco',
        funcao: 'Move o corpo, mantém a postura e gera calor.',
        numero: 'Mais de 600 músculos, cerca de 40% da massa corporal em adultos.',
        sinal: 'Fraqueza progressiva ou dor muscular intensa após remédio novo devem ser avaliadas.' },
    esqueletico: { nome: 'Sistema esquelético', orgaos: 'Ossos, cartilagens, ligamentos',
        funcao: 'Sustenta, protege órgãos, armazena cálcio e produz células do sangue.',
        numero: '206 ossos no adulto; o bebê nasce com cerca de 270, que se fundem com o crescimento.',
        sinal: 'Fratura com trauma pequeno pode indicar osteoporose e pede investigação.' },
    endocrino: { nome: 'Sistema endócrino', orgaos: 'Hipófise, tireoide, suprarrenais, pâncreas, gônadas',
        funcao: 'Regula metabolismo, crescimento, humor e reprodução por hormônios.',
        numero: 'A hipófise pesa menos de 1 grama e comanda quase todas as outras glândulas.',
        sinal: 'Cansaço, mudança de peso e alteração de humor sem causa pedem exame de tireoide.' },
    imunologico: { nome: 'Sistema imunológico', orgaos: 'Medula óssea, timo, baço, linfonodos',
        funcao: 'Reconhece e destrói agentes estranhos, e guarda memória do que já enfrentou.',
        numero: 'A memória imune de algumas doenças dura a vida toda; de outras, poucos meses.',
        sinal: 'Infecções repetidas e graves fora do padrão pedem investigação.' },
    urinario: { nome: 'Sistema urinário', orgaos: 'Rins, ureteres, bexiga, uretra',
        funcao: 'Filtra o sangue, regula água, sais e pressão, e elimina resíduos.',
        numero: 'Os rins filtram cerca de 180 litros por dia e devolvem quase tudo ao corpo.',
        sinal: 'Urina espumosa persistente, sangue na urina ou inchaço matinal pedem consulta.' },
    reprodutor: { nome: 'Sistema reprodutor', orgaos: 'Gônadas e vias genitais',
        funcao: 'Produz gametas e hormônios sexuais e permite a reprodução.',
        numero: 'A produção de espermatozoides leva cerca de 74 dias do início ao fim.',
        sinal: 'Dor pélvica persistente e alterações de ciclo merecem avaliação.' },
    tegumentar: { nome: 'Sistema tegumentar', orgaos: 'Pele, pelos, unhas, glândulas',
        funcao: 'Barreira contra o ambiente, regula temperatura e sintetiza vitamina D.',
        numero: 'Maior órgão do corpo: cerca de 2 m² e 4 kg em um adulto.',
        sinal: 'Pinta que muda de cor, borda ou tamanho deve ser mostrada a um dermatologista.' },
    linfatico: { nome: 'Sistema linfático', orgaos: 'Vasos linfáticos, linfonodos, baço, tonsilas',
        funcao: 'Drena o excesso de líquido dos tecidos, absorve gorduras e transporta células de defesa.',
        numero: 'Não tem bomba própria: depende do movimento dos músculos para circular.',
        sinal: 'Gânglio endurecido, indolor e crescendo há semanas precisa ser avaliado.' }
}

const ORGAOS = {
    coracao: { nome: 'Coração', sistema: 'Circulatório', peso: '250 a 350 g',
        funcao: 'Bomba que impulsiona o sangue por dois circuitos, o pulmonar e o sistêmico.',
        curiosidade: 'Bate cerca de 100 mil vezes por dia e bombeia perto de 7 mil litros nesse período.',
        cuidado: 'Pressão controlada, não fumar e movimento diário são o que mais protege.' },
    cerebro: { nome: 'Cérebro', sistema: 'Nervoso', peso: '1,3 a 1,4 kg',
        funcao: 'Processa informação, comanda o corpo e sustenta consciência, memória e linguagem.',
        curiosidade: 'É 2% do peso do corpo e consome cerca de 20% do oxigênio e da glicose.',
        cuidado: 'Sono suficiente e controle de pressão e glicose são o principal.' },
    pulmoes: { nome: 'Pulmões', sistema: 'Respiratório', peso: '1 kg os dois',
        funcao: 'Trocam oxigênio e gás carbônico entre o ar e o sangue.',
        curiosidade: 'O pulmão esquerdo é menor: cede espaço para o coração.',
        cuidado: 'Não fumar é, de longe, a medida com maior impacto.' },
    figado: { nome: 'Fígado', sistema: 'Digestório', peso: '1,5 kg',
        funcao: 'Metaboliza nutrientes e remédios, produz bile e proteínas, e armazena glicogênio.',
        curiosidade: 'É o único órgão interno capaz de regenerar boa parte da própria massa.',
        cuidado: 'Álcool e excesso de gordura corporal são os dois maiores agressores.' },
    rins: { nome: 'Rins', sistema: 'Urinário', peso: '150 g cada',
        funcao: 'Filtram o sangue, ajustam água e sais e regulam a pressão arterial.',
        curiosidade: 'Cada rim tem cerca de um milhão de néfrons, as unidades de filtragem.',
        cuidado: 'Pressão alta e diabetes descontrolados são as principais causas de perda renal.' },
    estomago: { nome: 'Estômago', sistema: 'Digestório', peso: 'variável, ~1 litro de capacidade',
        funcao: 'Armazena o alimento e inicia a digestão de proteínas com ácido e enzimas.',
        curiosidade: 'O pH chega a 1,5 — ácido o suficiente para corroer metal; a mucosa se renova a cada poucos dias.',
        cuidado: 'Dor que melhora comendo e piora em jejum pode ser úlcera e pede avaliação.' },
    intestinodelgado: { nome: 'Intestino delgado', sistema: 'Digestório', peso: '—',
        funcao: 'Absorve a maior parte dos nutrientes.',
        curiosidade: 'As vilosidades multiplicam a área de absorção para cerca de 30 m².',
        cuidado: 'Diarreia crônica com perda de peso pode indicar má absorção.' },
    intestinogrosso: { nome: 'Intestino grosso', sistema: 'Digestório', peso: '—',
        funcao: 'Absorve água e sais e abriga a microbiota que fermenta fibras.',
        curiosidade: 'Concentra a maior parte dos micro-organismos do corpo humano.',
        cuidado: 'Rastreamento de câncer colorretal é recomendado a partir dos 45 anos.' },
    pancreas: { nome: 'Pâncreas', sistema: 'Digestório e endócrino', peso: '70 a 100 g',
        funcao: 'Produz enzimas digestivas e os hormônios insulina e glucagon.',
        curiosidade: 'Acumula duas funções muito diferentes no mesmo órgão.',
        cuidado: 'Dor abdominal intensa que irradia para as costas exige atendimento imediato.' },
    tireoide: { nome: 'Tireoide', sistema: 'Endócrino', peso: '15 a 25 g',
        funcao: 'Produz T3 e T4, que regulam a velocidade do metabolismo.',
        curiosidade: 'Precisa de iodo para funcionar — por isso o sal de cozinha é iodado por lei no Brasil.',
        cuidado: 'Cansaço, frio, ganho de peso e queda de cabelo pedem dosagem de TSH.' },
    pele: { nome: 'Pele', sistema: 'Tegumentar', peso: 'até 4 kg',
        funcao: 'Barreira física, controle de temperatura, sensibilidade e síntese de vitamina D.',
        curiosidade: 'Renova-se por completo em cerca de 28 dias.',
        cuidado: 'Protetor solar diário reduz câncer de pele e envelhecimento precoce.' },
    olhos: { nome: 'Olhos', sistema: 'Nervoso', peso: '7,5 g cada',
        funcao: 'Convertem luz em sinal elétrico interpretado pelo cérebro.',
        curiosidade: 'Distinguem cerca de 10 milhões de tons; o ponto cego é preenchido pelo cérebro.',
        cuidado: 'Pressão ocular alta não dói e pode levar a glaucoma — exame periódico importa.' },
    ouvidos: { nome: 'Ouvidos', sistema: 'Nervoso', peso: '—',
        funcao: 'Captam som e mantêm o equilíbrio pelo sistema vestibular.',
        curiosidade: 'Os menores ossos do corpo — martelo, bigorna e estribo — ficam no ouvido médio.',
        cuidado: 'Perda auditiva por ruído é permanente. Fone acima de 60% do volume por muito tempo cobra caro.' },
    baco: { nome: 'Baço', sistema: 'Linfático', peso: '150 g',
        funcao: 'Filtra o sangue, recicla hemácias velhas e ajuda na defesa.',
        curiosidade: 'É possível viver sem ele, mas com risco maior de infecções por bactérias encapsuladas.',
        cuidado: 'Trauma abdominal com dor no lado esquerdo pode ser ruptura: emergência.' },
    medulaossea: { nome: 'Medula óssea', sistema: 'Imunológico', peso: '~2,6 kg no total',
        funcao: 'Fabrica hemácias, leucócitos e plaquetas.',
        curiosidade: 'Produz cerca de 2 milhões de hemácias por segundo.',
        cuidado: 'Palidez com cansaço e manchas roxas fáceis pedem hemograma.' },
    bexiga: { nome: 'Bexiga', sistema: 'Urinário', peso: '—',
        funcao: 'Armazena a urina até a eliminação.',
        curiosidade: 'A vontade aparece com cerca de 200 ml, e a capacidade confortável vai a 400-500 ml.',
        cuidado: 'Ardência ao urinar com urgência frequente sugere infecção urinária.' },
    diafragma: { nome: 'Diafragma', sistema: 'Respiratório', peso: '—',
        funcao: 'Principal músculo da respiração; ao contrair, puxa o ar para os pulmões.',
        curiosidade: 'O soluço é uma contração involuntária e brusca dele.',
        cuidado: 'Respiração diafragmática reduz ansiedade de forma mensurável.' },
    esofago: { nome: 'Esôfago', sistema: 'Digestório', peso: '—',
        funcao: 'Leva o alimento da boca ao estômago por ondas musculares.',
        curiosidade: 'Funciona mesmo de cabeça para baixo: é músculo, não gravidade.',
        cuidado: 'Azia frequente por anos pode lesar a mucosa e exige acompanhamento.' },
    suprarrenais: { nome: 'Glândulas suprarrenais', sistema: 'Endócrino', peso: '4 a 6 g cada',
        funcao: 'Produzem cortisol, aldosterona e adrenalina.',
        curiosidade: 'A descarga de adrenalina prepara o corpo em menos de um segundo.',
        cuidado: 'Cortisol cronicamente alto por estresse prolongado tem efeitos reais no corpo.' },
    apendice: { nome: 'Apêndice', sistema: 'Digestório', peso: '—',
        funcao: 'Reservatório de bactérias benéficas do intestino, segundo a hipótese mais aceita hoje.',
        curiosidade: 'Foi considerado inútil por décadas; hoje se atribui a ele um papel imunológico.',
        cuidado: 'Dor que começa perto do umbigo e migra para o lado direito inferior: procure emergência.' }
}

const NUTRIENTES = {
    vitaminaa: { nome: 'Vitamina A', tipo: 'Vitamina lipossolúvel', papel: 'Visão, pele e imunidade',
        fontes: 'Fígado, cenoura, abóbora, folhas verde-escuras', falta: 'Cegueira noturna e pele áspera',
        excesso: 'Tóxica em doses altas por suplemento; a de vegetais não causa toxicidade.' },
    vitaminab12: { nome: 'Vitamina B12', tipo: 'Vitamina hidrossolúvel', papel: 'Formação do sangue e sistema nervoso',
        fontes: 'Carnes, ovos, laticínios, alimentos fortificados', falta: 'Anemia, formigamento e alterações de memória',
        excesso: 'Raramente tóxica; o excesso é excretado.' },
    vitaminac: { nome: 'Vitamina C', tipo: 'Vitamina hidrossolúvel', papel: 'Colágeno, cicatrização e absorção de ferro',
        fontes: 'Acerola, goiaba, laranja, pimentão, brócolis', falta: 'Sangramento gengival, escorbuto em carência grave',
        excesso: 'Doses muito altas podem causar diarreia e cálculo renal em predispostos.' },
    vitaminad: { nome: 'Vitamina D', tipo: 'Vitamina lipossolúvel', papel: 'Absorção de cálcio e saúde óssea',
        fontes: 'Sol na pele, peixes gordos, gema de ovo', falta: 'Fraqueza óssea, dor difusa, raquitismo em crianças',
        excesso: 'Suplementação exagerada eleva o cálcio no sangue e pode lesar os rins.' },
    vitaminae: { nome: 'Vitamina E', tipo: 'Vitamina lipossolúvel', papel: 'Antioxidante das membranas celulares',
        fontes: 'Óleos vegetais, castanhas, sementes', falta: 'Rara; ocorre em má absorção de gordura',
        excesso: 'Doses altas podem aumentar risco de sangramento.' },
    vitaminak: { nome: 'Vitamina K', tipo: 'Vitamina lipossolúvel', papel: 'Coagulação do sangue e mineralização óssea',
        fontes: 'Couve, espinafre, brócolis', falta: 'Sangramentos e hematomas fáceis',
        excesso: 'Interfere em anticoagulantes — quem usa varfarina precisa de consumo estável.' },
    complexob: { nome: 'Complexo B', tipo: 'Vitaminas hidrossolúveis', papel: 'Metabolismo energético e sistema nervoso',
        fontes: 'Cereais integrais, carnes, leguminosas, folhas', falta: 'Fadiga, irritabilidade, lesões na boca',
        excesso: 'B6 em dose alta e prolongada pode causar neuropatia.' },
    acidofolico: { nome: 'Ácido fólico (B9)', tipo: 'Vitamina hidrossolúvel', papel: 'Divisão celular e formação do tubo neural',
        fontes: 'Feijão, lentilha, folhas verdes, fígado', falta: 'Anemia megaloblástica; na gestação, defeitos do tubo neural',
        excesso: 'Pode mascarar deficiência de B12 no exame.' },
    ferro: { nome: 'Ferro', tipo: 'Mineral', papel: 'Transporte de oxigênio pela hemoglobina',
        fontes: 'Carnes vermelhas, fígado, feijão, folhas escuras', falta: 'Anemia, cansaço, palidez, queda de cabelo',
        excesso: 'Acumula em órgãos; suplementar sem exame é má ideia.' },
    calcio: { nome: 'Cálcio', tipo: 'Mineral', papel: 'Ossos, dentes, contração muscular e coagulação',
        fontes: 'Leite e derivados, gergelim, tofu, folhas verdes', falta: 'Perda óssea a longo prazo, cãibras',
        excesso: 'Pode favorecer cálculo renal e atrapalhar a absorção de ferro.' },
    magnesio: { nome: 'Magnésio', tipo: 'Mineral', papel: 'Mais de 300 reações enzimáticas, músculo e nervo',
        fontes: 'Castanhas, sementes, cacau, folhas verdes', falta: 'Cãibras, fraqueza, alteração do ritmo cardíaco',
        excesso: 'Em dose alta causa diarreia; perigoso em insuficiência renal.' },
    potassio: { nome: 'Potássio', tipo: 'Mineral', papel: 'Equilíbrio de líquidos, nervo e ritmo cardíaco',
        fontes: 'Banana, feijão, batata, água de coco', falta: 'Fraqueza muscular e arritmia',
        excesso: 'Perigoso para quem tem função renal reduzida.' },
    zinco: { nome: 'Zinco', tipo: 'Mineral', papel: 'Imunidade, cicatrização e paladar',
        fontes: 'Carnes, ostras, sementes de abóbora, castanhas', falta: 'Cicatrização lenta, perda de paladar, queda de cabelo',
        excesso: 'Atrapalha a absorção de cobre a longo prazo.' },
    iodo: { nome: 'Iodo', tipo: 'Mineral', papel: 'Produção dos hormônios da tireoide',
        fontes: 'Sal iodado, peixes e frutos do mar', falta: 'Bócio e hipotireoidismo',
        excesso: 'Também pode desregular a tireoide — o intervalo saudável é estreito.' },
    sodio: { nome: 'Sódio', tipo: 'Mineral', papel: 'Equilíbrio de líquidos e transmissão nervosa',
        fontes: 'Sal de cozinha e alimentos industrializados', falta: 'Rara em dieta comum; ocorre com perdas intensas',
        excesso: 'Principal fator dietético ligado à hipertensão. A OMS recomenda até 5 g de sal por dia.' },
    fibras: { nome: 'Fibras', tipo: 'Carboidrato não digerível', papel: 'Trânsito intestinal, saciedade e microbiota',
        fontes: 'Frutas com casca, aveia, feijão, hortaliças', falta: 'Constipação e piora do perfil metabólico',
        excesso: 'Aumento rápido sem água causa gases e desconforto.' },
    proteina: { nome: 'Proteína', tipo: 'Macronutriente', papel: 'Construção e reparo de tecidos, enzimas e hormônios',
        fontes: 'Carnes, ovos, laticínios, leguminosas', falta: 'Perda de massa muscular e imunidade reduzida',
        excesso: 'Em rim saudável, o excesso é apenas caro; em rim doente, exige orientação.' },
    omega3: { nome: 'Ômega 3', tipo: 'Gordura essencial', papel: 'Anti-inflamatório, saúde cardiovascular e cerebral',
        fontes: 'Sardinha, salmão, linhaça, chia', falta: 'Pele seca, prejuízo cognitivo em carência prolongada',
        excesso: 'Doses altas podem aumentar tempo de sangramento.' },
    agua: { nome: 'Água', tipo: 'Essencial', papel: 'Solvente de tudo: transporte, temperatura e função renal',
        fontes: 'Água, alimentos com alto teor hídrico', falta: 'Sede, urina escura, dor de cabeça, queda de desempenho',
        excesso: 'Beber litros em pouco tempo pode diluir o sódio e causar hiponatremia.' },
    colageno: { nome: 'Colágeno', tipo: 'Proteína estrutural', papel: 'Sustenta pele, tendões, ossos e cartilagem',
        fontes: 'O corpo produz; precisa de proteína e vitamina C na dieta', falta: 'Produção cai com a idade, a partir dos 25 anos',
        excesso: 'Sem toxicidade conhecida; a eficácia do suplemento oral ainda é debatida.' }
}

const EXAMES = {
    hemograma: { nome: 'Hemograma completo', jejum: 'não exige', mede: 'Hemácias, leucócitos e plaquetas',
        referencia: 'Hemoglobina ~13-17 g/dL (homens) e ~12-15 (mulheres)',
        paraque: 'Rastreia anemia, infecção e alterações da medula. É o exame mais pedido da medicina.' },
    glicemia: { nome: 'Glicemia de jejum', jejum: '8 horas', mede: 'Açúcar no sangue em jejum',
        referencia: 'Normal até 99 mg/dL; 100-125 pré-diabetes; ≥126 sugere diabetes',
        paraque: 'Rastreia diabetes. Precisa de confirmação em segunda coleta.' },
    hba1c: { nome: 'Hemoglobina glicada', jejum: 'não exige', mede: 'Média da glicose dos últimos 2-3 meses',
        referencia: 'Normal abaixo de 5,7%; 5,7-6,4% pré-diabetes; ≥6,5% diabetes',
        paraque: 'Mostra o controle ao longo do tempo, sem depender do que você comeu ontem.' },
    colesterol: { nome: 'Perfil lipídico', jejum: 'geralmente dispensado hoje', mede: 'Colesterol total, LDL, HDL e triglicerídeos',
        referencia: 'LDL desejável varia com o risco cardiovascular de cada pessoa',
        paraque: 'Estima risco cardiovascular. O alvo do LDL não é igual para todos.' },
    tsh: { nome: 'TSH e T4 livre', jejum: 'não exige', mede: 'Função da tireoide',
        referencia: 'TSH ~0,4 a 4,0 mUI/L',
        paraque: 'Investiga hipo e hipertireoidismo. TSH alto com T4 baixo indica tireoide lenta.' },
    creatinina: { nome: 'Creatinina e ureia', jejum: 'não exige', mede: 'Função dos rins',
        referencia: 'Creatinina ~0,7 a 1,3 mg/dL, com variação por massa muscular',
        paraque: 'Estima a filtração renal. Sozinha engana em pessoas muito musculosas ou muito magras.' },
    tgo: { nome: 'TGO e TGP', jejum: 'não exige', mede: 'Enzimas do fígado',
        referencia: 'Até cerca de 40 U/L, variável por laboratório',
        paraque: 'Detecta lesão hepática por álcool, gordura, remédio ou vírus.' },
    vitaminadexame: { nome: 'Vitamina D (25-OH)', jejum: 'não exige', mede: 'Estoque de vitamina D',
        referencia: 'Acima de 20 ng/mL para população geral; 30-60 para grupos de risco',
        paraque: 'Avalia carência. Não é indicado como rastreio em todo mundo saudável.' },
    ferritina: { nome: 'Ferritina', jejum: 'não exige', mede: 'Estoque de ferro no corpo',
        referencia: 'Ampla variação; abaixo de 30 ng/mL sugere estoque baixo',
        paraque: 'Diferencia anemia por falta de ferro de outras causas. Sobe também em inflamação.' },
    psa: { nome: 'PSA', jejum: 'não exige', mede: 'Antígeno prostático específico',
        referencia: 'Interpretação depende de idade e volume prostático',
        paraque: 'Rastreio de próstata, sempre em decisão compartilhada com o médico.' },
    urina: { nome: 'Urina tipo 1', jejum: 'não exige', mede: 'Sedimento, proteínas, glicose e células na urina',
        referencia: 'Ausência de proteína, glicose, nitrito e sangue',
        paraque: 'Detecta infecção urinária e sinais precoces de doença renal.' },
    eletrocardiograma: { nome: 'Eletrocardiograma', jejum: 'não exige', mede: 'Atividade elétrica do coração',
        referencia: 'Ritmo sinusal com frequência entre 60 e 100 bpm em repouso',
        paraque: 'Detecta arritmias, sobrecargas e sinais de isquemia. Dura poucos minutos.' },
    raiox: { nome: 'Raio-X de tórax', jejum: 'não exige', mede: 'Imagem de pulmões, coração e arcabouço ósseo',
        referencia: '—',
        paraque: 'Investiga tosse persistente, febre e falta de ar. Baixa dose de radiação.' },
    ultrassom: { nome: 'Ultrassonografia', jejum: 'depende da região', mede: 'Imagem por ondas sonoras',
        referencia: '—',
        paraque: 'Avalia abdome, tireoide, mamas e gestação sem qualquer radiação.' },
    pressao: { nome: 'Medida da pressão arterial', jejum: 'não exige', mede: 'Pressão sistólica e diastólica',
        referencia: 'Ideal em torno de 120/80 mmHg; ≥140/90 em medidas repetidas indica hipertensão',
        paraque: 'É o exame mais barato e um dos mais decisivos. Deve ser medida sentado e em repouso.' }
}

function orgaosDe(sistema) {
    const s = String(sistema || '').toLowerCase()
    return Object.entries(ORGAOS).filter(([, o]) => o.sistema.toLowerCase().includes(s)).map(([chave, o]) => ({ chave, ...o }))
}

function nutrientesPorTipo(tipo) {
    const t = String(tipo || '').toLowerCase()
    return Object.entries(NUTRIENTES).filter(([, n]) => n.tipo.toLowerCase().includes(t)).map(([chave, n]) => ({ chave, ...n }))
}

/** IMC com a faixa e a ressalva que quase ninguém lê. */
function imc(pesoKg, alturaM) {
    const p = Number(pesoKg), a = Number(alturaM)
    if (!Number.isFinite(p) || !Number.isFinite(a) || p <= 0 || a <= 0) return null
    const altura = a > 3 ? a / 100 : a
    const valor = p / (altura * altura)
    const faixas = [
        [18.5, 'Abaixo do peso'], [25, 'Peso adequado'], [30, 'Sobrepeso'],
        [35, 'Obesidade grau I'], [40, 'Obesidade grau II'], [Infinity, 'Obesidade grau III']
    ]
    const faixa = faixas.find(([lim]) => valor < lim)[1]
    const idealMin = 18.5 * altura * altura
    const idealMax = 24.9 * altura * altura
    return { valor, faixa, altura, idealMin, idealMax }
}

/** Água diária recomendada, com ajuste por atividade. */
function aguaDiaria(pesoKg, minutosAtividade = 0) {
    const p = Number(pesoKg)
    if (!Number.isFinite(p) || p <= 0) return null
    const base = p * 35
    const extra = Math.max(0, Number(minutosAtividade) || 0) / 30 * 350
    return { base, extra, total: base + extra, copos: Math.round((base + extra) / 250) }
}

/** Frequência cardíaca de treino pela fórmula de Karvonen simplificada. */
function zonasCardiacas(idade, repouso = 70) {
    const i = Number(idade)
    if (!Number.isFinite(i) || i <= 0 || i > 120) return null
    const fcMax = 208 - 0.7 * i
    const reserva = fcMax - (Number(repouso) || 70)
    const zonas = [
        ['Leve — recuperação', 0.5, 0.6],
        ['Moderada — base aeróbica', 0.6, 0.7],
        ['Intensa — condicionamento', 0.7, 0.8],
        ['Muito intensa — limiar', 0.8, 0.9],
        ['Máxima — tiros curtos', 0.9, 1.0]
    ].map(([nome, a, b]) => ({
        nome,
        min: Math.round((Number(repouso) || 70) + reserva * a),
        max: Math.round((Number(repouso) || 70) + reserva * b)
    }))
    return { fcMax: Math.round(fcMax), zonas }
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    const fontes = [['sistema', SISTEMAS], ['orgao', ORGAOS], ['nutriente', NUTRIENTES], ['exame', EXAMES]]
    for (const [tipo, cat] of fontes) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = { SISTEMAS, ORGAOS, NUTRIENTES, EXAMES, orgaosDe, nutrientesPorTipo, imc, aguaDiaria, zonasCardiacas, procurar }
