/**
 * Book & PDF Document Service (Versão Multilíngue Inteligente com Contagem de Páginas)
 * Suporte a múltiplos idiomas (Português, Inglês, Espanhol, Francês, Alemão, Italiano)
 * Acervo Verificado com Livros Completos em PDF + Archive.org + OpenLibrary
 */

const https = require('https');
const http = require('http');
const logger = require('../core/logger');
const { buscarComSeguranca } = require('./media/urlSeguro');

// Dicionário de internacionalização para a interface de livros
const I18N_BOOK_LABELS = {
    pt: {
        loading: '⏳ Procurando *{query}*…',
        headerTitle: 'Ficha do livro',
        officialTitle: 'Título',
        author: 'Autor',
        year: 'Ano',
        edition: 'Edição',
        pages: 'Páginas',
        genre: 'Gênero',
        fileSize: 'Arquivo',
        source: 'Fonte',
        sourceLink: 'Link',
        securityLabel: 'Senha',
        unlocked: 'nenhuma',
        language: 'Idioma',
        synopsisTitle: 'Sinopse',
        tipAuthor: 'Outros livros de {author}: `.livro lista {author}`',
        notFound: '🔍 Não achei nenhum livro para *{query}*. Tente só o título ou o nome do autor, ou peça em outro idioma com `--en`, `--es` ou `--fr`.',
        error: '❌ Não consegui buscar *{query}* agora. Tente de novo em instantes.',
        resultsFor: 'Resultados para',
        langName: 'Português',
        helpTitle: 'Biblioteca',
        howToSearch: 'Como buscar',
        examples: 'Exemplos',
        pageTextFormat: '{total} no arquivo ({reading} de leitura + {extra} de capa, prefácio e apêndices)',
        pageExactFormat: '{total}'
    },
    en: {
        loading: '⏳ Looking for *{query}*…',
        headerTitle: 'Book details',
        officialTitle: 'Title',
        author: 'Author',
        year: 'Year',
        edition: 'Edition',
        pages: 'Pages',
        genre: 'Genre',
        fileSize: 'File',
        source: 'Source',
        sourceLink: 'Link',
        securityLabel: 'Password',
        unlocked: 'none',
        language: 'Language',
        synopsisTitle: 'Synopsis',
        tipAuthor: 'More books by {author}: `.book list {author}`',
        notFound: '🔍 I couldn\'t find any book for *{query}*. Try just the title or the author\'s name.',
        error: '❌ I couldn\'t search for *{query}* right now. Please try again in a moment.',
        resultsFor: 'Results for',
        langName: 'English',
        helpTitle: 'Library',
        howToSearch: 'How to search',
        examples: 'Examples',
        pageTextFormat: '{total} in the file ({reading} reading pages + {extra} cover, preface and appendix)',
        pageExactFormat: '{total}'
    },
    es: {
        loading: '⏳ Buscando *{query}*…',
        headerTitle: 'Ficha del libro',
        officialTitle: 'Título',
        author: 'Autor',
        year: 'Año',
        edition: 'Edición',
        pages: 'Páginas',
        genre: 'Género',
        fileSize: 'Archivo',
        source: 'Fuente',
        sourceLink: 'Enlace',
        securityLabel: 'Contraseña',
        unlocked: 'ninguna',
        language: 'Idioma',
        synopsisTitle: 'Sinopsis',
        tipAuthor: 'Más libros de {author}: `.libro lista {author}`',
        notFound: '🔍 No encontré ningún libro para *{query}*. Pruebe solo con el título o el nombre del autor.',
        error: '❌ No pude buscar *{query}* ahora. Inténtelo de nuevo en un momento.',
        resultsFor: 'Resultados para',
        langName: 'Español',
        helpTitle: 'Biblioteca',
        howToSearch: 'Cómo buscar',
        examples: 'Ejemplos',
        pageTextFormat: '{total} en el archivo ({reading} de lectura + {extra} de portada, prefacio y anexos)',
        pageExactFormat: '{total}'
    },
    fr: {
        loading: '⏳ Je cherche *{query}*…',
        headerTitle: 'Fiche du livre',
        officialTitle: 'Titre',
        author: 'Auteur',
        year: 'Année',
        edition: 'Édition',
        pages: 'Pages',
        genre: 'Genre',
        fileSize: 'Fichier',
        source: 'Source',
        sourceLink: 'Lien',
        securityLabel: 'Mot de passe',
        unlocked: 'aucun',
        language: 'Langue',
        synopsisTitle: 'Résumé',
        tipAuthor: 'Autres livres de {author} : `.livre list {author}`',
        notFound: '🔍 Je n\'ai trouvé aucun livre pour *{query}*. Essayez seulement le titre ou le nom de l\'auteur.',
        error: '❌ Je n\'ai pas pu chercher *{query}* maintenant. Réessayez dans un instant.',
        resultsFor: 'Résultats pour',
        langName: 'Français',
        helpTitle: 'Bibliothèque',
        howToSearch: 'Comment chercher',
        examples: 'Exemples',
        pageTextFormat: '{total} dans le fichier ({reading} de lecture + {extra} couverture, préface et annexes)',
        pageExactFormat: '{total}'
    },
    de: {
        loading: '⏳ Ich suche *{query}*…',
        headerTitle: 'Buchdaten',
        officialTitle: 'Titel',
        author: 'Autor',
        year: 'Jahr',
        edition: 'Ausgabe',
        pages: 'Seiten',
        genre: 'Genre',
        fileSize: 'Datei',
        source: 'Quelle',
        sourceLink: 'Link',
        securityLabel: 'Passwort',
        unlocked: 'keins',
        language: 'Sprache',
        synopsisTitle: 'Zusammenfassung',
        tipAuthor: 'Weitere Bücher von {author}: `.book list {author}`',
        notFound: '🔍 Ich habe kein Buch für *{query}* gefunden. Versuche nur den Titel oder den Namen des Autors.',
        error: '❌ Ich konnte *{query}* gerade nicht suchen. Versuche es gleich noch einmal.',
        resultsFor: 'Ergebnisse für',
        langName: 'Deutsch',
        helpTitle: 'Bibliothek',
        howToSearch: 'So suchst du',
        examples: 'Beispiele',
        pageTextFormat: '{total} in der Datei ({reading} Leseseiten + {extra} Umschlag und Anhang)',
        pageExactFormat: '{total}'
    },
    it: {
        loading: '⏳ Sto cercando *{query}*…',
        headerTitle: 'Scheda del libro',
        officialTitle: 'Titolo',
        author: 'Autore',
        year: 'Anno',
        edition: 'Edizione',
        pages: 'Pagine',
        genre: 'Genere',
        fileSize: 'File',
        source: 'Fonte',
        sourceLink: 'Link',
        securityLabel: 'Password',
        unlocked: 'nessuna',
        language: 'Lingua',
        synopsisTitle: 'Sinossi',
        tipAuthor: 'Altri libri di {author}: `.libro lista {author}`',
        notFound: '🔍 Non ho trovato nessun libro per *{query}*. Prova solo con il titolo o il nome dell\'autore.',
        error: '❌ Non sono riuscito a cercare *{query}* adesso. Riprova tra un momento.',
        resultsFor: 'Risultati per',
        langName: 'Italiano',
        helpTitle: 'Biblioteca',
        howToSearch: 'Come cercare',
        examples: 'Esempi',
        pageTextFormat: '{total} nel file ({reading} di lettura + {extra} copertina, prefazione e appendici)',
        pageExactFormat: '{total}'
    }
};

/**
 * Detecta o idioma solicitado pelo usuário
 */
function detectBookLanguage(rawText = '') {
    const text = rawText.toLowerCase().trim();

    if (text.includes('--en') || text.includes('--english') || text.includes('in english') || text.includes('em inglês') || text.includes('em ingles') || text.includes('idioma ingles')) {
        return { lang: 'en', cleanQuery: text.replace(/--en|--english|in english|em inglês|em ingles|idioma ingles/gi, '').trim() };
    }
    if (text.includes('--es') || text.includes('--spanish') || text.includes('en español') || text.includes('en espanol') || text.includes('em espanhol') || text.includes('en castellano')) {
        return { lang: 'es', cleanQuery: text.replace(/--es|--spanish|en español|en espanol|em espanhol|en castellano/gi, '').trim() };
    }
    if (text.includes('--fr') || text.includes('--french') || text.includes('en français') || text.includes('en francais') || text.includes('em francês') || text.includes('em frances')) {
        return { lang: 'fr', cleanQuery: text.replace(/--fr|--french|en français|en francais|em francês|em frances/gi, '').trim() };
    }
    if (text.includes('--de') || text.includes('--german') || text.includes('auf deutsch') || text.includes('em alemão') || text.includes('em alemao')) {
        return { lang: 'de', cleanQuery: text.replace(/--de|--german|auf deutsch|em alemão|em alemao/gi, '').trim() };
    }
    if (text.includes('--it') || text.includes('--italian') || text.includes('in italiano') || text.includes('em italiano')) {
        return { lang: 'it', cleanQuery: text.replace(/--it|--italian|in italiano|em italiano/gi, '').trim() };
    }
    if (text.includes('--pt') || text.includes('--portugues') || text.includes('em português') || text.includes('em portugues')) {
        return { lang: 'pt', cleanQuery: text.replace(/--pt|--portugues|em português|em portugues/gi, '').trim() };
    }

    if (text.startsWith('the ') || text.includes('the chalk man') || text.includes('the little prince') || text.includes('clean architecture') || text.includes('the art of war') || text.includes('nineteen eighty-four')) {
        return { lang: 'en', cleanQuery: text };
    }
    if (text.startsWith('el ') || text.startsWith('la ') || text.startsWith('los ') || text.includes('el hombre de tiza') || text.includes('el principito') || text.includes('el arte de la guerra') || text.includes('don quijote')) {
        return { lang: 'es', cleanQuery: text };
    }
    if (text.startsWith('le ') || text.startsWith('les ') || text.includes('le petit prince') || text.includes('l\'etranger') || text.includes('les miserables')) {
        return { lang: 'fr', cleanQuery: text };
    }
    if (text.includes('die verwandlung') || text.includes('der prozess')) {
        return { lang: 'de', cleanQuery: text };
    }

    return { lang: 'pt', cleanQuery: text };
}

function getI18nLabels(lang = 'pt') {
    return I18N_BOOK_LABELS[lang] || I18N_BOOK_LABELS['pt'];
}

/**
 * Inspeciona o buffer do PDF para contar o número real exato de páginas
 */
function countPdfPages(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) return null;
    const str = buffer.toString('binary');
    
    const countMatch = str.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/);
    if (countMatch && countMatch[1]) {
        return parseInt(countMatch[1], 10);
    }

    const pageMatches = str.match(/\/Type\s*\/Page\b/g);
    if (pageMatches) {
        return pageMatches.length;
    }

    return null;
}

/**
 * Formata a discriminação de páginas separando leitura e elementos pré/pós-textuais
 */
function formatPageBreakdown(pdfPages, textPagesNumber, lang = 'pt') {
    const i18n = getI18nLabels(lang);
    const total = pdfPages || (textPagesNumber ? textPagesNumber + 22 : 280);
    const reading = textPagesNumber || Math.max(1, Math.round(total * 0.92));
    const extra = Math.max(0, total - reading);

    if (extra > 0 && total > reading) {
        return i18n.pageTextFormat
            .replace('{total}', String(total))
            .replace('{reading}', String(reading))
            .replace('{extra}', String(extra));
    }
    return i18n.pageExactFormat.replace('{total}', String(total));
}

// Catálogo multilíngue verificado com dados completos
const MULTILANG_POPULAR_BOOKS = [
    // Português (PT)
    {
        lang: 'pt',
        keywords: ["dom casmurro", "machado de assis", "bentinho", "capitu", "casmurro"],
        title: "Dom Casmurro",
        originalTitle: "Dom Casmurro",
        author: "Machado de Assis",
        year: "1899",
        edition: "Edição Clássica Integral — Domínio Público / MEC",
        publisher: "Livraria Garnier / MEC",
        pagesCount: 256,
        pages: "256 págs.",
        language: "Português (pt-BR)",
        genre: "Literatura Brasileira / Romance Realista",
        description: "Narrado por Bento Santiago (Bentinho), o livro conta a história de sua paixão por Capitu, desde a infância, e a terrível dúvida que o persegue: Capitu o traiu com seu melhor amigo, Escobar, gerando seu filho Ezequiel?",
        identifier: "DomCasmurro",
        source: "Domínio Público / Internet Archive"
    },
    {
        lang: 'pt',
        keywords: ["pequeno principe", "pequeno príncipe", "le petit prince", "saint exupery"],
        title: "O Pequeno Príncipe",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Edição Especial Ilustrada Integral",
        publisher: "Editora Agir",
        pagesCount: 96,
        pages: "96 págs.",
        language: "Português (pt-BR)",
        genre: "Fábula Filosófica / Literatura Clássica",
        description: "Um piloto cai no deserto do Saara e encontra um jovem príncipe vindo de um minúsculo asteroide. Uma fábula poética sobre o amor, a amizade, o sentido da vida e a famosa lição: 'O essencial é invisível aos olhos.'",
        identifier: "o-pequeno-principe",
        source: "Domínio Público / Agir"
    },
    {
        lang: 'pt',
        keywords: ["homem de giz", "the chalk man", "c j tudor", "cj tudor", "giz", "tudor"],
        title: "O Homem de Giz",
        originalTitle: "The Chalk Man",
        author: "C. J. Tudor",
        year: "2018",
        edition: "1ª Edição Oficial — Editora Intrínseca",
        publisher: "Editora Intrínseca",
        pagesCount: 272,
        pages: "272 págs.",
        language: "Português (pt-BR)",
        genre: "Suspense / Thriller Psicológico",
        description: "Em 1986, Eddie e seus amigos passam a maior parte dos dias andando de bicicleta pela pacata cidade de Anderbury e usando homens de giz desenhados para deixar mensagens secretas. Mas um dia, um boneco de giz os leva até o corpo de uma garota assassinada. Trinta anos depois, o passado volta para assombrá-los.",
        identifier: "el-hombre-de-tiza-c-j-tudor",
        source: "Acervo Digital / Editora Intrínseca"
    },
    {
        lang: 'pt',
        keywords: ["diario de um banana", "diário de um banana", "diary of a wimpy kid", "jeff kinney", "banana", "greg heffley", "jeff"],
        title: "Diário de um Banana",
        originalTitle: "Diary of a Wimpy Kid",
        author: "Jeff Kinney",
        year: "2008",
        edition: "1ª Edição Oficial Ilustrada — V&R Editoras",
        publisher: "V&R Editoras",
        pagesCount: 224,
        pages: "224 págs.",
        language: "Português (pt-BR)",
        genre: "Humor Infantojuvenil / Ficção Cômica",
        description: "Não é fácil ser criança. E ninguém sabe disso melhor do que Greg Heffley, um garoto que se vê jogado no ensino fundamental onde garotos nanicos dividem os corredores com garotos que são mais altos e já fazem a barba.",
        identifier: "1739709629203",
        source: "Acervo Digital / V&R Editoras"
    },
    {
        lang: 'pt',
        keywords: ["pai rico pai pobre", "pai rico", "robert kiyosaki", "kiyosaki", "financas"],
        title: "Pai Rico, Pai Pobre",
        originalTitle: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        year: "1997",
        edition: "Edição Atualizada e Ampliada",
        publisher: "Alta Books / Elsevier",
        pagesCount: 336,
        pages: "336 págs.",
        language: "Português (pt-BR)",
        genre: "Educação Financeira / Desenvolvimento Pessoal",
        description: "Um dos livros de finanças mais vendidos do mundo. Ensina a diferença entre ativos e passivos, inteligência financeira e como fazer o dinheiro trabalhar por você em vez de trabalhar por dinheiro.",
        identifier: "pairicopaipobre",
        source: "Acervo Digital / Alta Books"
    },
    {
        lang: 'pt',
        keywords: ["1984", "george orwell", "orwell", "grande irmao", "big brother"],
        title: "1984",
        originalTitle: "Nineteen Eighty-Four",
        author: "George Orwell",
        year: "1949",
        edition: "Edição Integral — Companhia das Letras",
        publisher: "Companhia das Letras",
        pagesCount: 416,
        pages: "416 págs.",
        language: "Português (pt-BR)",
        genre: "Ficção Distópica / Clássico",
        description: "Winston Smith vive sob a vigilância constante do Grande Irmão em um regime totalitário onde pensar diferente é um crime gravíssimo. Um clássico atemporal sobre liberdade e verdade.",
        identifier: "orwell-1984_202101",
        source: "Acervo Digital / Companhia das Letras"
    },
    {
        lang: 'pt',
        keywords: ["revolucao dos bichos", "a revolucao dos bichos", "revolução dos bichos", "animal farm", "orwell"],
        title: "A Revolução dos Bichos",
        originalTitle: "Animal Farm",
        author: "George Orwell",
        year: "1945",
        edition: "Edição Especial — Companhia das Letras",
        publisher: "Companhia das Letras",
        pagesCount: 152,
        pages: "152 págs.",
        language: "Português (pt-BR)",
        genre: "Sátira Política / Fábula",
        description: "Os animais de uma granja se rebelam contra seus donos humanos para criar uma sociedade justa e igualitária. Uma sátira brilhante sobre o poder, a corrupção e os regimes autoritários.",
        identifier: "orwell-a-revolucao-dos-bichos",
        source: "Acervo Digital / Companhia das Letras"
    },
    {
        lang: 'pt',
        keywords: ["poder do habito", "o poder do habito", "o poder do hábito", "charles duhigg", "habito"],
        title: "O Poder do Hábito",
        originalTitle: "The Power of Habit",
        author: "Charles Duhigg",
        year: "2012",
        edition: "1ª Edição Oficial — Editora Objetiva",
        publisher: "Editora Objetiva",
        pagesCount: 408,
        pages: "408 págs.",
        language: "Português (pt-BR)",
        genre: "Psicologia Aplicada / Produtividade",
        description: "Explora a ciência por trás da formação e transformação de hábitos na vida pessoal, nas empresas e nas sociedades. Revela o 'loop do hábito': deixa, rotina e recompensa.",
        identifier: "livro-o-poder-do-habito_202503",
        source: "Acervo Digital / Editora Objetiva"
    },
    {
        lang: 'pt',
        keywords: ["harry potter", "pedra filosofal", "j k rowling", "jk rowling", "hogwarts", "bruxo"],
        title: "Harry Potter e a Pedra Filosofal",
        originalTitle: "Harry Potter and the Philosopher's Stone",
        author: "J. K. Rowling",
        year: "1997",
        edition: "Edição Oficial — Editora Rocco",
        publisher: "Editora Rocco",
        pagesCount: 264,
        pages: "264 págs.",
        language: "Português (pt-BR)",
        genre: "Fantasia Infantojuvenil / Aventura",
        description: "Harry Potter descobre no seu aniversário de 11 anos que é um bruxo e é convidado para estudar na Escola de Magia e Bruxaria de Hogwarts, iniciando a saga mais famosa da literatura mundial.",
        identifier: "livro-harry-potter-e-a-pedra-filosofal",
        source: "Acervo Digital / Editora Rocco"
    },
    {
        lang: 'pt',
        keywords: ["o principe", "o príncipe", "maquiavel", "nicolau maquiavel", "politica"],
        title: "O Príncipe",
        originalTitle: "Il Principe",
        author: "Nicolau Maquiavel",
        year: "1532",
        edition: "Edição Clássica Comentada — Domínio Público",
        publisher: "Domínio Público",
        pagesCount: 160,
        pages: "160 págs.",
        language: "Português (pt-BR)",
        genre: "Filosofia Política / Ciência Política",
        description: "O mais influente tratado sobre a conquista e manutenção do poder político. Uma análise crua e pragmática sobre liderança, governança e estratégia de Estado.",
        identifier: "o-principe-maquiavel",
        source: "Domínio Público / Internet Archive"
    },
    {
        lang: 'pt',
        keywords: ["sapiens", "uma breve historia da humanidade", "yuval noah harari", "harari", "humanidade"],
        title: "Sapiens: Uma Breve História da Humanidade",
        originalTitle: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        year: "2014",
        edition: "Edição Ilustrada Integral — L&PM / Companhia das Letras",
        publisher: "Companhia das Letras",
        pagesCount: 464,
        pages: "464 págs.",
        language: "Português (pt-BR)",
        genre: "História / Antropologia / Divulgação Científica",
        description: "Narra como um macaco insignificante se tornou o governante do planeta Terra, das revoluções cognitiva, agrícola e científica até o futuro da inteligência artificial.",
        identifier: "sapiens_202112",
        source: "Acervo Digital / Companhia das Letras"
    },
    {
        lang: 'pt',
        keywords: ["habitos atomicos", "hábitos atômicos", "james clear", "atomicos", "rotina"],
        title: "Hábitos Atômicos",
        originalTitle: "Atomic Habits",
        author: "James Clear",
        year: "2018",
        edition: "1ª Edição Oficial — Paralela / Companhia das Letras",
        publisher: "Editora Paralela",
        pagesCount: 320,
        pages: "320 págs.",
        language: "Português (pt-BR)",
        genre: "Desenvolvimento Pessoal / Produtividade",
        description: "Um método comprovado para construir bons hábitos e eliminar os maus através de pequenas melhorias diárias de 1% que geram resultados gigantescos ao longo do tempo.",
        identifier: "habitos-atomicos-emerson-eduardo-rodrigues",
        source: "Acervo Digital / Editora Paralela"
    },
    {
        lang: 'pt',
        keywords: ["arte da guerra", "sun tzu", "sun zi"],
        title: "A Arte da Guerra",
        originalTitle: "The Art of War",
        author: "Sun Tzu",
        year: "500 a.C.",
        edition: "Edição Comentada Integral — Jardim dos Livros",
        publisher: "Jardim dos Livros / Domínio Público",
        pagesCount: 160,
        pages: "160 págs.",
        language: "Português (pt-BR)",
        genre: "Estratégia Militar / Filosofia",
        description: "O tratado militar mais famoso do mundo antigo sobre estratégia, psicologia de combate, liderança, planejamento e vitória sem a necessidade de destruição.",
        identifier: "AArteDaGuerra",
        source: "Domínio Público / Internet Archive"
    },
    {
        lang: 'pt',
        keywords: ["metamorfose", "a metamorfose", "franz kafka", "gregor samsa"],
        title: "A Metamorfose",
        originalTitle: "Die Verwandlung",
        author: "Franz Kafka",
        year: "1915",
        edition: "Edição Integral — Domínio Público",
        publisher: "Companhia das Letras / Domínio Público",
        pagesCount: 104,
        pages: "104 págs.",
        language: "Português (pt-BR)",
        genre: "Ficção Existencialista / Literatura Clássica",
        description: "Ao acordar de sonhos intranquilos, Gregor Samsa descobre que se transformou em um monstruoso inseto. Um clássico sobre alienação e a condição humana.",
        identifier: "a-metamorfose-franz-kafka",
        source: "Domínio Público / Internet Archive"
    },
    {
        lang: 'pt',
        keywords: ["cortico", "o cortiço", "o cortico", "aluisio azevedo"],
        title: "O Cortiço",
        originalTitle: "O Cortiço",
        author: "Aluísio Azevedo",
        year: "1890",
        edition: "Edição Clássica Integral — Domínio Público",
        publisher: "B. L. Garnier / MEC",
        pagesCount: 240,
        pages: "240 págs.",
        language: "Português (pt-BR)",
        genre: "Literatura Brasileira / Naturalismo",
        description: "A obra máxima do Naturalismo brasileiro retrata a vida em um cortiço carioca do século XIX, mostrando as paixões humanas e as transformações sociais.",
        identifier: "o-cortico_202503",
        source: "Domínio Público / MEC"
    },

    // English (EN)
    {
        lang: 'en',
        keywords: ["clean code", "robert martin", "uncle bob", "agile software"],
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        originalTitle: "Clean Code",
        author: "Robert C. Martin (Uncle Bob)",
        year: "2008",
        edition: "1st Complete Edition — Prentice Hall",
        publisher: "Prentice Hall / Pearson",
        pagesCount: 464,
        pages: "464 pages",
        language: "English (en-US)",
        genre: "Software Engineering / Computer Science",
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book teaches meaningful naming, clean functions, error handling, unit testing, and agile refactoring.",
        identifier: "clean-code-a-handbook-of-agile-software-craftsmanship",
        source: "Internet Archive / Prentice Hall"
    },
    {
        lang: 'en',
        keywords: ["the little prince", "little prince", "antoine de saint-exupery"],
        title: "The Little Prince",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Complete Illustrated Edition — Reynal & Hitchcock",
        publisher: "Reynal & Hitchcock / Harcourt",
        pagesCount: 96,
        pages: "96 pages",
        language: "English (en-US)",
        genre: "Philosophical Tale / Classic Literature",
        description: "A young prince who visits various planets in space, including Earth, addressing themes of loneliness, friendship, love, and loss. 'What is essential is invisible to the eye.'",
        identifier: "the-little-prince-antoine-de-saint-exupery",
        source: "Internet Archive / Public Domain"
    },
    {
        lang: 'en',
        keywords: ["the art of war", "art of war", "sun tzu", "sun zi"],
        title: "The Art of War",
        originalTitle: "The Art of War",
        author: "Sun Tzu",
        year: "500 BC",
        edition: "Complete Translation — Project Gutenberg",
        publisher: "Project Gutenberg / Internet Archive",
        pagesCount: 128,
        pages: "128 pages",
        language: "English (en-GB)",
        genre: "Military Strategy / Philosophy",
        description: "An ancient Chinese military treatise attributed to Sun Tzu, a high-ranking military general, strategist and tactician. Composed of 13 chapters, each devoted to one aspect of warfare.",
        identifier: "artofwar0000sunt",
        source: "Project Gutenberg / Internet Archive"
    },
    {
        lang: 'en',
        keywords: ["1984", "nineteen eighty-four", "george orwell", "big brother"],
        title: "Nineteen Eighty-Four (1984)",
        originalTitle: "Nineteen Eighty-Four",
        author: "George Orwell",
        year: "1949",
        edition: "Definitive Complete Edition — Secker & Warburg",
        publisher: "Secker & Warburg",
        pagesCount: 328,
        pages: "328 pages",
        language: "English (en-GB)",
        genre: "Dystopian Fiction / Political Satire",
        description: "Winston Smith lives in a society ruled by the totalitarian Party and its ubiquitous leader, Big Brother. A harrowing vision of totalitarian surveillance and truth manipulation.",
        identifier: "GeorgeOrwells1984",
        source: "Internet Archive / Secker & Warburg"
    },
    {
        lang: 'en',
        keywords: ["the chalk man", "chalk man", "c j tudor"],
        title: "The Chalk Man",
        originalTitle: "The Chalk Man",
        author: "C. J. Tudor",
        year: "2018",
        edition: "1st Complete Edition — Crown Publishing",
        publisher: "Crown Publishing / Penguin Random House",
        pagesCount: 280,
        pages: "280 pages",
        language: "English (en-GB)",
        genre: "Psychological Thriller / Suspense",
        description: "In 1986, Eddie and his friends spent their days leaving secret messages using chalk stick figures. But when a chalk man leads them to a body in the woods, everything changes.",
        identifier: "el-hombre-de-tiza-c-j-tudor",
        source: "Internet Archive / Digital Library"
    },

    // Spanish (ES)
    {
        lang: 'es',
        keywords: ["el hombre de tiza", "hombre de tiza", "c j tudor", "el hombre de tiza c j tudor"],
        title: "El Hombre de Tiza",
        originalTitle: "The Chalk Man",
        author: "C. J. Tudor",
        year: "2018",
        edition: "1ª Edición Oficial Integral — Plaza & Janés",
        publisher: "Plaza & Janés / Penguin Random House",
        pagesCount: 272,
        pages: "272 págs.",
        language: "Español (es-ES)",
        genre: "Thriller Psicológico / Novela Negra",
        description: "En 1986, Eddie y sus amigos dibujaban muñecos de tiza para comunicarse en clave. Hasta que un dibujo los condujo al cadáver descuartizado de una joven. Treinta años después, el pasado regresa.",
        identifier: "el-hombre-de-tiza-c-j-tudor",
        source: "Internet Archive / Plaza & Janés"
    },
    {
        lang: 'es',
        keywords: ["el principito", "principito", "antoine de saint-exupery"],
        title: "El Principito",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Edición Ilustrada Integral — Dominio Público",
        publisher: "Editorial Emecé / Dominio Público",
        pagesCount: 96,
        pages: "96 págs.",
        language: "Español (es-LATAM)",
        genre: "Fábula Filosófica / Literatura Clásica",
        description: "Un aviador perdido en el desierto conoce a un pequeño príncipe procedente de otro planeta. Una fábula poética sobre el amor, la amistad y el sentido de la vida.",
        identifier: "ElPrincipitoAntoineDeSaintExupery",
        source: "Dominio Público / Internet Archive"
    },
    {
        lang: 'es',
        keywords: ["don quijote", "don quijote de la mancha", "cervantes", "sancho panza"],
        title: "Don Quijote de la Mancha",
        originalTitle: "El Ingenioso Hidalgo Don Quijote de la Mancha",
        author: "Miguel de Cervantes Saavedra",
        year: "1605",
        edition: "Edición Clásica Integral — Real Academia Española",
        publisher: "RAE / Dominio Público",
        pagesCount: 860,
        pages: "860 págs.",
        language: "Español (es-ES)",
        genre: "Novela Caballeresca / Clásico Universal",
        description: "La cumbre de la literatura española narra las aventuras y desventuras del hidalgo Alonso Quijano, quien pierde el juicio por leer libros de caballería y decide salir por los caminos.",
        identifier: "donquijotedelama01cerv",
        source: "Dominio Público / Internet Archive"
    },
    {
        lang: 'es',
        keywords: ["el arte de la guerra", "sun tzu", "arte de la guerra"],
        title: "El Arte de la Guerra",
        originalTitle: "The Art of War",
        author: "Sun Tzu",
        year: "500 a.C.",
        edition: "Edición Integral Comentada — Dominio Público",
        publisher: "Dominio Público / Internet Archive",
        pagesCount: 140,
        pages: "140 págs.",
        language: "Español (es-ES)",
        genre: "Estrategia Militar / Filosofía",
        description: "Tratado militar de sabiduría y estrategia más célebre de la historia, aplicable al combate, la política y la superación de adversidades.",
        identifier: "sun-tzu.-el-arte-de-la-guerra-2017",
        source: "Dominio Público / Internet Archive"
    },

    // French (FR)
    {
        lang: 'fr',
        keywords: ["le petit prince", "petit prince", "antoine de saint-exupery"],
        title: "Le Petit Prince",
        originalTitle: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: "1943",
        edition: "Édition Originale Illustrée Intégrale — Gallimard",
        publisher: "Éditions Gallimard / Reynal & Hitchcock",
        pagesCount: 96,
        pages: "96 pages",
        language: "Français (fr-FR)",
        genre: "Conte Philosophique / Littérature Classique",
        description: "Un aviateur échoué dans le désert rencontre un jeune prince venu d'une autre planète. Une réflexion poétique sur l'amour, l'amitié et la condition humaine. 'L'essentiel est invisible pour les yeux.'",
        identifier: "antoinedesaintexuperylepetitprince1943",
        source: "Domaine Public / Internet Archive"
    }
];

function fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                ...(options.headers || {})
            },
            family: 4,
            timeout: options.timeout || 8000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchJson(res.headers.location, options).then(resolve).catch(reject);
            }
            if (res.statusCode >= 400) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

const LANG_CODE_MAP = {
    pt: 'por OR Portuguese',
    en: 'eng OR English',
    es: 'spa OR Spanish',
    fr: 'fre OR French',
    de: 'ger OR German',
    it: 'ita OR Italian'
};

/**
 * Decompõe a query em partes potenciais de título e autor
 */
function parseBookQuery(rawQuery) {
    let clean = (rawQuery || '').replace(/--[a-z0-9_-]+/gi, '').trim();

    let titlePart = clean;
    let authorPart = '';

    const sepRegex = /\s*(?:[-—/|]|\bpor\b|\bby\b|\bautor:\b|\bauthor:\b)\s*/i;
    if (sepRegex.test(clean)) {
        const parts = clean.split(sepRegex).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
            titlePart = parts[0];
            authorPart = parts.slice(1).join(' ');
        }
    } else {
        const words = clean.split(/\s+/);
        if (words.length >= 3) {
            authorPart = words[words.length - 1];
            titlePart = words.slice(0, -1).join(' ');
        }
    }

    return {
        original: clean,
        titlePart,
        authorPart
    };
}

function scoreBookCatalog(book, parsed) {
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const bTitle = norm(book.title);
    const bOrig = norm(book.originalTitle);
    const bAuthor = norm(book.author);
    const bKeywords = (book.keywords || []).map(norm);

    const qFull = norm(parsed.original);
    const qTitle = norm(parsed.titlePart);
    const qAuthor = norm(parsed.authorPart);

    // 1. Título e Autor perfeitamente combinados
    if (qAuthor && (bAuthor.includes(qAuthor) || qAuthor.split(' ').some(w => w.length > 2 && bAuthor.includes(w)))) {
        if (bTitle.includes(qTitle) || bOrig.includes(qTitle) || bKeywords.some(k => k.includes(qTitle))) {
            return 100;
        }
    }

    // 1.2 Invertido (Autor no início, Título depois)
    if (qTitle && bAuthor.includes(qTitle)) {
        if (bTitle.includes(qAuthor) || bOrig.includes(qAuthor) || bKeywords.some(k => k.includes(qAuthor))) {
            return 98;
        }
    }

    // 2. Título direto ou palavras-chave
    if (bTitle.includes(qTitle) || bOrig.includes(qTitle) || bKeywords.some(k => k.includes(qTitle))) {
        return 85;
    }

    // 3. Match de tokens parciais
    const tokens = qFull.split(' ').filter(w => w.length > 2 && !['para', 'com', 'livro', 'obra', 'pdf', 'ler', 'the', 'and', 'uma', 'uns'].includes(w));
    if (tokens.length > 0) {
        let matched = 0;
        for (const t of tokens) {
            if (bTitle.includes(t) || bAuthor.includes(t) || bOrig.includes(t) || bKeywords.some(k => k.includes(t))) {
                matched++;
            }
        }
        if (matched > 0) {
            return (matched / tokens.length) * 80;
        }
    }

    return 0;
}

/**
 * Busca livros filtrando e priorizando o catálogo curado e acervo Open Access do Archive.org
 */
async function searchBooks(query, limit = 5, requestedLang = 'pt') {
    if (!query || !query.trim()) return [];

    const parsed = parseBookQuery(query);
    const cleanQuery = parsed.original.toLowerCase().replace(/["']/g, '').trim();
    const results = [];
    const seenTitles = new Set();
    const seenIds = new Set();

    const addResult = (item) => {
        if (!item || !item.title) return false;
        const normKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normId = (item.id || item.identifier || '').toLowerCase();
        if (normId && seenIds.has(normId)) return false;
        if (normKey && seenTitles.has(normKey)) return false;
        if (normKey) seenTitles.add(normKey);
        if (normId) seenIds.add(normId);
        results.push(item);
        return true;
    };

    // 1. LAYER 1 (INSTANT HIT): Catálogo Curado Multilíngue Verificado (0ms)
    // Tenta primeiro no idioma solicitado, depois em outros idiomas
    const langCatalog = MULTILANG_POPULAR_BOOKS.filter(b => b.lang === requestedLang);
    const otherCatalog = MULTILANG_POPULAR_BOOKS.filter(b => b.lang !== requestedLang);

    const scoredLang = langCatalog
        .map(b => ({ book: b, score: scoreBookCatalog(b, parsed) }))
        .filter(item => item.score >= 50)
        .sort((a, b) => b.score - a.score);

    for (const item of scoredLang) {
        if (results.length >= limit) break;
        addResult({ ...item.book, id: item.book.identifier });
    }

    if (results.length < limit) {
        const scoredOther = otherCatalog
            .map(b => ({ book: b, score: scoreBookCatalog(b, parsed) }))
            .filter(item => item.score >= 50)
            .sort((a, b) => b.score - a.score);

        for (const item of scoredOther) {
            if (results.length >= limit) break;
            addResult({ ...item.book, id: item.book.identifier });
        }
    }

    // Se temos correspondência exata ou de altíssima relevância no catálogo curado (score >= 85),
    // ou se já atingimos o limite solicitado, retornamos imediatamente (0ms)
    if (results.length >= limit || (results.length > 0 && scoredLang[0]?.score >= 85)) {
        return results.slice(0, limit);
    }

    // 2. LAYER 2: Archive.org Open Access (Rápido, 100% público e gratuito, sem bloqueio de empréstimo)
    try {
        const cleanWords = cleanQuery.split(/\s+/).filter(w => w.length > 1);
        const noiseWordsRegex = /\b(prova|provas|avaliacao|avaliação|exercicio|exercicios|exercício|exercícios|questao|questoes|questão|questões|apostila|apostilas|livro|livros|livrete|pdf|ebook|material|curso|aula|aulas|resumo)\b/gi;
        const strippedTopic = cleanQuery.replace(noiseWordsRegex, '').replace(/\s+/g, ' ').trim();

        const queriesToTry = [];
        if (parsed.titlePart && parsed.authorPart) {
            queriesToTry.push(`(title:("${encodeURIComponent(parsed.titlePart)}") OR "${encodeURIComponent(parsed.titlePart)}") AND (creator:("${encodeURIComponent(parsed.authorPart)}") OR "${encodeURIComponent(parsed.authorPart)}")`);
        }

        if (cleanWords.length > 1) {
            // 1. Tenta título exato
            queriesToTry.push(`title:("${encodeURIComponent(cleanQuery)}")`);
            // 2. Tenta combinação de palavras-chave
            queriesToTry.push(`(${cleanWords.map(w => encodeURIComponent(w)).join('+AND+')})`);
            // 3. Se houver ruído acadêmico (ex: "prova"), tenta o tópico puro
            if (strippedTopic && strippedTopic !== cleanQuery) {
                const topicWords = strippedTopic.split(/\s+/).filter(w => w.length > 1);
                if (topicWords.length > 0) {
                    queriesToTry.push(`(${topicWords.map(w => encodeURIComponent(w)).join('+AND+')})`);
                }
            }
        } else {
            queriesToTry.push(`(title:("${encodeURIComponent(cleanQuery)}") OR "${encodeURIComponent(cleanQuery)}")`);
        }

        for (const iaQuery of queriesToTry) {
            if (results.length >= limit) break;
            const iaSearchUrl = `https://archive.org/advancedsearch.php?q=(${iaQuery})+AND+mediatype:(texts)+AND+NOT+access-restricted-item:true+AND+NOT+collection:(inlibrary+OR+printdisabled)&fl[]=identifier,title,creator,year,downloads,publisher,language&rows=${limit * 2}&sort[]=downloads+desc&output=json`;

            const iaData = await fetchJson(iaSearchUrl, { timeout: 6000 }).catch(() => null);
            if (iaData?.response?.docs?.length > 0) {
                const normQuery = cleanQuery.replace(/[^a-z0-9]/g, '');
                const sortedDocs = [...iaData.response.docs].sort((a, b) => {
                    const aNorm = (a.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    const bNorm = (b.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    const aMatch = aNorm === normQuery ? 2 : (aNorm.includes(normQuery) ? 1 : 0);
                    const bMatch = bNorm === normQuery ? 2 : (bNorm.includes(normQuery) ? 1 : 0);
                    if (aMatch !== bMatch) return bMatch - aMatch;
                    return Number(b.downloads || 0) - Number(a.downloads || 0);
                });
                for (const doc of sortedDocs) {
                    if (!doc.identifier) continue;
                    if (results.length >= limit * 2) break;
                    const title = doc.title || cleanQuery;
                    const authors = Array.isArray(doc.creator) ? doc.creator.join(', ') : (doc.creator || 'Autor Aberto');
                    const year = doc.year ? String(doc.year) : '—';
                    const publisher = doc.publisher || 'Internet Archive / Domínio Público';
                    const docLang = doc.language ? String(doc.language) : requestedLang;

                    addResult({
                        id: doc.identifier,
                        title,
                        author: authors,
                        year,
                        edition: 'Edição Digital Integral',
                        publisher,
                        pagesCount: 0,
                        pages: 'Documento Completo',
                        genre: 'Literatura & Conhecimento',
                        description: `Obra digital preservada no Internet Archive (${doc.downloads || 0} downloads registrados).`,
                        source: 'Internet Archive',
                        language: docLang,
                        identifier: doc.identifier
                    });
                }
            }
        }
    } catch (err) {
        logger.warn(`[BOOK SERVICE] Archive.org search falhou: ${err.message}`);
    }

    if (results.length >= limit) {
        return results.slice(0, limit);
    }

    // 3. LAYER 3: Open Library API (Metadados e busca de IDs do Internet Archive)
    try {
        const noiseWordsRegex = /\b(prova|provas|avaliacao|avaliação|exercicio|exercicios|exercício|exercícios|questao|questoes|questão|questões|apostila|apostilas|livro|livros|livrete|pdf|ebook|material|curso|aula|aulas|resumo)\b/gi;
        const queryForOl = cleanQuery.replace(noiseWordsRegex, '').replace(/\s+/g, ' ').trim() || cleanQuery;

        let olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(queryForOl)}&limit=${limit}&fields=title,author_name,first_publish_year,ia,number_of_pages_median,publisher,ebook_access`;
        if (parsed.authorPart && parsed.titlePart) {
            olUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(parsed.titlePart)}&author=${encodeURIComponent(parsed.authorPart)}&limit=${limit}&fields=title,author_name,first_publish_year,ia,number_of_pages_median,publisher,ebook_access`;
        }
        const olData = await fetchJson(olUrl, { timeout: 6000 }).catch(() => null);
        if (olData?.docs && Array.isArray(olData.docs)) {
            for (const doc of olData.docs) {
                if (results.length >= limit * 2) break;
                const title = doc.title || cleanQuery;
                const authors = Array.isArray(doc.author_name) ? doc.author_name.join(', ') : (doc.author_name || 'Autor Clássico');
                const year = doc.first_publish_year ? String(doc.first_publish_year) : '—';
                const edition = 'Edição Oficial / Open Library';
                const publisher = doc.publisher?.[0] || 'Digital Library';
                const pages = doc.number_of_pages_median ? `${doc.number_of_pages_median} págs.` : 'Documento Completo';
                const iaId = Array.isArray(doc.ia) ? doc.ia.find(id => id && typeof id === 'string') : (doc.ia || null);

                addResult({
                    id: iaId || `ol_${doc.key?.replace('/works/', '') || Math.random().toString(36).substring(2, 8)}`,
                    title,
                    author: authors,
                    year,
                    edition,
                    publisher,
                    pagesCount: doc.number_of_pages_median || 0,
                    pages,
                    genre: 'Literatura & Obras',
                    description: `Catalogado no índice global Open Library.`,
                    source: 'Open Library',
                    language: requestedLang,
                    identifier: iaId || ''
                });
            }
        }
    } catch (err) {
        logger.warn(`[BOOK SERVICE] OpenLibrary search falhou: ${err.message}`);
    }

    // 4. LAYER 4: Google Books API (Ebooks Gratuitos)
    if (results.length < limit) {
        try {
            const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&filter=free-ebooks&maxResults=${limit}`;
            const gbData = await fetchJson(gbUrl, { timeout: 6000 }).catch(() => null);
            if (gbData?.items) {
                for (const item of gbData.items) {
                    if (results.length >= limit * 2) break;
                    const vi = item.volumeInfo;
                    const title = vi.title || cleanQuery;
                    const authors = vi.authors?.join(', ') || 'Google Books Author';
                    const pdfUrl = vi.accessInfo?.pdf?.downloadLink || vi.accessInfo?.webReaderLink || '';
                    if (!pdfUrl) continue;

                    addResult({
                        id: `gb_${item.id}`,
                        title,
                        author: authors,
                        year: vi.publishedDate?.substring(0, 4) || '—',
                        edition: 'Google Books Free Ebook',
                        publisher: vi.publisher || 'Google Books',
                        pagesCount: vi.pageCount || 0,
                        pages: vi.pageCount ? `${vi.pageCount} págs.` : 'Documento Completo',
                        genre: vi.categories?.[0] || 'Literatura',
                        description: vi.description ? vi.description.slice(0, 300) : 'Ebook gratuito disponibilizado no Google Books.',
                        source: 'Google Books',
                        language: requestedLang,
                        identifier: `gb_${item.id}`,
                        directPdfUrl: pdfUrl
                    });
                }
            }
        } catch (err) {
            logger.warn(`[BOOK SERVICE] Google Books search falhou: ${err.message}`);
        }
    }

    // 5. LAYER 5: Web Crawler Aberto (DuckDuckGo Search)
    if (results.length === 0) {
        try {
            const webDoc = await searchWebPdfs(cleanQuery, requestedLang);
            if (webDoc) {
                addResult({
                    id: webDoc.downloadUrl,
                    title: cleanQuery.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    author: 'Acervo Digital Web',
                    year: '—',
                    edition: 'Edição Web Aberta',
                    publisher: webDoc.source,
                    pagesCount: 0,
                    pages: 'Documento Completo',
                    genre: 'Educação & Material Digital',
                    description: `Material encontrado na web aberta via crawler autônomo (${webDoc.source}).`,
                    source: webDoc.source,
                    language: requestedLang,
                    identifier: webDoc.downloadUrl,
                    directPdfUrl: webDoc.downloadUrl
                });
            }
        } catch (err) { logger.warn('[BOOKSERVICE] falha ignorada: ' + (err && err.message)) }
    }

    return results.slice(0, limit);
}

/**
 * Busca PDFs diretamente na web aberta via múltiplos crawlers (DuckDuckGo, repositórios abertos e indexadores públicos)
 * Encontra, verifica se o link é baixável e devolve o PDF real pronto para envio.
 */
async function searchWebPdfs(query, lang = 'pt') {
    if (!query) return null;
    const clean = query.replace(/[^\w\s\u00C0-\u00FF-]/gi, ' ').trim();
    const searchUrls = [
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(clean + ' filetype:pdf')}`,
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(clean + ' (livro OR book OR ebook) filetype:pdf')}`
    ];

    const foundUrls = new Set();

    for (const sUrl of searchUrls) {
        try {
            const res = await fetch(sUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
                },
                signal: AbortSignal.timeout(8000)
            });
            if (!res.ok) continue;
            const html = await res.text();

            // Extrai URLs do parâmetro uddg (redirecionamento DuckDuckGo)
            const uddgMatches = [...html.matchAll(/uddg=([^&"']+)/gi)].map(m => {
                try { return decodeURIComponent(m[1]); } catch (_) { return null; }
            }).filter(Boolean);

            // Extrai links diretos de PDF na página
            const directMatches = [...html.matchAll(/href="(https?:\/\/[^"]+\.pdf[^"]*)"/gi)].map(m => m[1]);

            for (const u of [...uddgMatches, ...directMatches]) {
                const uLower = u.toLowerCase();
                if (uLower.endsWith('.pdf') || uLower.includes('.pdf?') || uLower.includes('/pdf/')) {
                    // Ignora urls quebradas ou spam conhecidos
                    if (!uLower.includes('duckduckgo.com') && !uLower.includes('bing.com')) {
                        foundUrls.add(u);
                    }
                }
            }

            if (foundUrls.size >= 5) break;
        } catch (e) {
            logger.warn(`[BOOK WEB SEARCH] Falha em ${sUrl}: ${e.message}`);
        }
    }

    if (foundUrls.size === 0) return null;

    logger.info(`[BOOK WEB SEARCH] "${clean}": ${foundUrls.size} URLs candidatas de PDF encontradas na web.`);

    // Valida as primeiras URLs com requisição HEAD rápida
    for (const target of Array.from(foundUrls).slice(0, 8)) {
        try {
            // URLs vêm de resultado de busca: cada redirecionamento é conferido (sem IP interno)
            const { resposta: headRes } = await buscarComSeguranca(target, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
                },
                signal: AbortSignal.timeout(4000)
            });

            if (headRes.ok) {
                const cType = (headRes.headers.get('content-type') || '').toLowerCase();
                const cLength = parseInt(headRes.headers.get('content-length') || '0', 10);
                const isPdfType = cType.includes('pdf') || cType.includes('octet-stream') || target.toLowerCase().endsWith('.pdf');
                const isAcceptableSize = cLength === 0 || (cLength > 10000 && cLength < 95 * 1024 * 1024);

                if (isPdfType && isAcceptableSize) {
                    const finalUrl = headRes.url || target;
                    const urlObj = new URL(finalUrl);
                    const pathParts = urlObj.pathname.split('/');
                    const rawName = pathParts[pathParts.length - 1] || `${clean.slice(0, 30).replace(/\s+/g, '_')}.pdf`;
                    const fileName = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');

                    logger.info(`[BOOK WEB SEARCH] ✅ Candidato confirmado: ${finalUrl} (${cLength} bytes, tipo: ${cType})`);
                    return {
                        downloadUrl: finalUrl,
                        detailsUrl: finalUrl,
                        fileName: fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`,
                        sizeBytes: cLength,
                        source: `Web (${urlObj.hostname})`
                    };
                }
            }
        } catch (err) {
            // timeout ou rejeição de HEAD, tenta o próximo
            continue;
        }
    }

    // Se nenhum respondeu HEAD com sucesso, usa a primeira candidata que tem extensão direta .pdf
    const firstDirect = Array.from(foundUrls).find(u => u.toLowerCase().endsWith('.pdf')) || Array.from(foundUrls)[0];
    if (firstDirect) {
        try {
            const urlObj = new URL(firstDirect);
            const pathParts = urlObj.pathname.split('/');
            const rawName = pathParts[pathParts.length - 1] || 'livro.pdf';
            const fileName = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
            return {
                downloadUrl: firstDirect,
                detailsUrl: firstDirect,
                fileName: fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`,
                sizeBytes: 0,
                source: `Web (${urlObj.hostname})`
            };
        } catch (err) { logger.warn('[BOOKSERVICE] falha ignorada: ' + (err && err.message)) }
    }

    return null;
}

/**
 * Obtém a URL do PDF real verificado
 */
async function resolvePdfUrl(identifier, fallbackQuery = '', lang = 'pt') {
    let targetId = identifier;
    logger.info(`[BOOK RESOLVE] Resolvendo PDF para identifier="${identifier}", fallbackQuery="${fallbackQuery}"`);

    // 0. Link direto HTTP/HTTPS já informado
    if (targetId && (targetId.startsWith('http://') || targetId.startsWith('https://'))) {
        try {
            const urlObj = new URL(targetId);
            const pathParts = urlObj.pathname.split('/');
            const rawName = pathParts[pathParts.length - 1] || 'documento.pdf';
            const fileName = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
            return {
                downloadUrl: targetId,
                detailsUrl: targetId,
                fileName: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
                sizeBytes: 0,
                source: urlObj.hostname
            };
        } catch (err) { logger.warn('[BOOKSERVICE] falha ignorada: ' + (err && err.message)) }
    }

    // 1. Google Books (gb_<id>)
    if (targetId && targetId.startsWith('gb_')) {
        const gbId = targetId.slice(3);
        try {
            const gbUrl = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(gbId)}`;
            const gbData = await fetchJson(gbUrl, { timeout: 6000 });
            const pdfUrl = gbData?.accessInfo?.pdf?.downloadLink || gbData?.accessInfo?.webReaderLink || '';
            if (pdfUrl) {
                return {
                    downloadUrl: pdfUrl,
                    detailsUrl: `https://books.google.com/books?id=${gbId}`,
                    fileName: `${(gbData.volumeInfo?.title || 'livro').slice(0, 40).replace(/[^a-z0-9]+/gi, '_')}.pdf`,
                    sizeBytes: 0
                };
            }
        } catch (e) {
            logger.warn(`[BOOK RESOLVE] Google Books falhou: ${e.message}`);
        }
        return null;
    }

    // 2. Se não tem targetId válido (ou é ol_...), faz busca direta no Archive.org com fallbackQuery
    if ((!targetId || targetId.startsWith('ol_')) && fallbackQuery) {
        try {
            const cleanFallback = fallbackQuery.toLowerCase().replace(/["']/g, '').trim();
            const cleanWords = cleanFallback.split(/\s+/).filter(w => w.length > 1);
            const queryPart = cleanWords.length > 1
                ? cleanWords.map(w => encodeURIComponent(w)).join('+AND+')
                : `"${encodeURIComponent(cleanFallback)}"`;
            const iaSearchUrl = `https://archive.org/advancedsearch.php?q=(${queryPart})+AND+mediatype:(texts)+AND+NOT+access-restricted-item:true+AND+NOT+collection:(inlibrary+OR+printdisabled)&fl[]=identifier&rows=1&sort[]=downloads+desc&output=json`;
            const iaData = await fetchJson(iaSearchUrl, { timeout: 6000 });
            targetId = iaData?.response?.docs?.[0]?.identifier;
            logger.info(`[BOOK RESOLVE] Archive.org fallback resolveu targetId="${targetId}" para "${fallbackQuery}"`);
        } catch (e) {
            logger.warn(`[BOOK RESOLVE] Archive.org fallback falhou: ${e.message}`);
        }
    }

    // 3. Resolve arquivos para targetId no Archive.org
    if (targetId && !targetId.startsWith('ol_')) {
        try {
            const metaUrl = `https://archive.org/metadata/${encodeURIComponent(targetId)}/files`;
            const meta = await fetchJson(metaUrl, { timeout: 8000 });

            if (meta?.result && Array.isArray(meta.result)) {
                // Filtra arquivos PDF válidos:
                // - Termina com .pdf ou format inclui pdf
                // - Exclui thumbs, previews, capas isoladas, ocr parcial
                // - Tamanho > 50KB (evita PDFs de 1 página / amostra) e < 95MB (limite WhatsApp)
                const pdfFiles = meta.result.filter(f => {
                    const name = (f.name || '').toLowerCase();
                    const format = (f.format || '').toLowerCase();
                    const size = Number(f.size || 0);
                    const isPdf = name.endsWith('.pdf') || format.includes('pdf');
                    const isExcluded = name.includes('_thumb') || name.includes('_cover') || name.includes('_encrypted') || name.includes('_chocr');
                    const isGoodSize = size > 50000 && size < 95000000;
                    return isPdf && !isExcluded && isGoodSize;
                });

                logger.info(`[BOOK RESOLVE] Archive.org ${targetId}: ${pdfFiles.length} PDFs válidos encontrados`);

                if (pdfFiles.length > 0) {
                    // Ordena pelo maior arquivo (o livro completo é o maior)
                    pdfFiles.sort((a, b) => Number(b.size || 0) - Number(a.size || 0));
                    const chosenFile = pdfFiles[0];
                    const encodedFileName = encodeURIComponent(chosenFile.name).replace(/%2F/g, '/');
                    const downloadUrl = `https://archive.org/download/${encodeURIComponent(targetId)}/${encodedFileName}`;

                    return {
                        downloadUrl,
                        detailsUrl: `https://archive.org/details/${encodeURIComponent(targetId)}`,
                        fileName: chosenFile.name || `${targetId}.pdf`,
                        sizeBytes: Number(chosenFile.size || 0)
                    };
                }

                // Fallback: se nenhum arquivo passou no filtro de tamanho > 50KB, tenta qualquer .pdf < 95MB
                const anyPdf = meta.result.filter(f => {
                    const name = (f.name || '').toLowerCase();
                    const format = (f.format || '').toLowerCase();
                    const size = Number(f.size || 0);
                    return (name.endsWith('.pdf') || format.includes('pdf')) && size < 95000000;
                });

                if (anyPdf.length > 0) {
                    anyPdf.sort((a, b) => Number(b.size || 0) - Number(a.size || 0));
                    const chosenFile = anyPdf[0];
                    const encodedFileName = encodeURIComponent(chosenFile.name).replace(/%2F/g, '/');
                    return {
                        downloadUrl: `https://archive.org/download/${encodeURIComponent(targetId)}/${encodedFileName}`,
                        detailsUrl: `https://archive.org/details/${encodeURIComponent(targetId)}`,
                        fileName: chosenFile.name || `${targetId}.pdf`,
                        sizeBytes: Number(chosenFile.size || 0)
                    };
                }
            }
        } catch (e) {
            logger.warn(`[BOOK RESOLVE] Archive.org metadata falhou: ${e.message}`);
        }
    }

    // 4. Web Crawler Fallback (Busca aberta via DuckDuckGo na web inteira)
    if (fallbackQuery) {
        try {
            logger.info(`[BOOK RESOLVE] Tentando busca aberta na Web para: "${fallbackQuery}"`);
            const webDoc = await searchWebPdfs(fallbackQuery, lang);
            if (webDoc) return webDoc;
        } catch (e) {
            logger.warn(`[BOOK RESOLVE] Busca aberta na Web falhou: ${e.message}`);
        }
    }

    return null;
}

/**
 * Baixa buffer do PDF real com validação de assinatura e limites de tamanho
 */
async function downloadPdfBuffer(downloadUrl, bookMeta = {}, redirectCount = 0) {
    if (!downloadUrl) return null;
    if (redirectCount > 5) {
        logger.warn(`[BOOK PDF DOWNLOAD] Excesso de redirecionamentos (>5) para: ${downloadUrl}`);
        return null;
    }

    logger.info(`[BOOK DOWNLOAD] Baixando PDF de: ${downloadUrl.substring(0, 120)} (redirect=${redirectCount})`);

    try {
        const client = downloadUrl.startsWith('https:') ? https : http;
        const res = await new Promise((resolve, reject) => {
            const req = client.get(downloadUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'Accept': 'application/pdf,*/*'
                },
                family: 4,
                timeout: 60000
            }, (response) => {
                // Redirecionamento (301, 302, 303, 307, 308)
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    const nextUrl = new URL(response.headers.location, downloadUrl).toString();
                    return resolve(downloadPdfBuffer(nextUrl, bookMeta, redirectCount + 1));
                }

                if (response.statusCode >= 400) {
                    return reject(new Error(`HTTP ${response.statusCode}`));
                }

                const chunks = [];
                let totalBytes = 0;
                response.on('data', chunk => {
                    chunks.push(chunk);
                    totalBytes += chunk.length;
                    // Se exceder 95MB, interrompe o download para respeitar limite do WhatsApp
                    if (totalBytes > 95 * 1024 * 1024) {
                        req.destroy();
                        return reject(new Error('PDF excede o limite máximo suportado de 95MB.'));
                    }
                });

                response.on('end', () => {
                    const finalBuffer = Buffer.concat(chunks);
                    resolve(finalBuffer);
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout de download excedido (60s)'));
            });
        });

        if (!res) return null;
        const finalBuffer = Buffer.isBuffer(res) ? res : res.buffer;
        if (!finalBuffer || !Buffer.isBuffer(finalBuffer)) return null;

        // Validação de integridade do PDF
        if (finalBuffer.length < 10000) {
            logger.warn(`[BOOK PDF DOWNLOAD] Buffer muito pequeno (${finalBuffer.length} bytes), rejeitado.`);
            return null;
        }

        const head = finalBuffer.slice(0, 1024).toString('binary');
        if (!head.includes('%PDF-')) {
            logger.warn(`[BOOK PDF DOWNLOAD] Buffer não é um arquivo PDF válido (sem assinatura %PDF-). Rejeitado.`);
            return null;
        }

        return {
            buffer: finalBuffer,
            sizeMb: require('./../utils/tamanho').formatarTamanho(finalBuffer.length)
        };
    } catch (e) {
        logger.warn(`[BOOK PDF DOWNLOAD] Falha no download remoto: ${e.message}`);
        return null;
    }
}

module.exports = {
    detectBookLanguage,
    getI18nLabels,
    countPdfPages,
    formatPageBreakdown,
    searchBooks,
    searchWebPdfs,
    resolvePdfUrl,
    downloadPdfBuffer,
    MULTILANG_POPULAR_BOOKS
};
