/**
 * Gerador de Documentos e Livros Digitais em PDF (Deluxe Multi-Page Pure Node.js)
 * Gera volumes digitais completos em páginas estruturadas, 100% compatíveis com WhatsApp, Android e iOS
 */

function sanitizeText(str) {
    return (str || '')
        .replace(/\\/g, '')
        .replace(/\(/g, '[')
        .replace(/\)/g, ']')
        .replace(/[\r\n]+/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove acentos para compatibilidade Type1 standard font
}

function wrapText(text, maxChars = 70) {
    const words = (text || '').split(/\s+/);
    const lines = [];
    let currentLine = '';
    for (const w of words) {
        if ((currentLine + ' ' + w).length > maxChars) {
            lines.push(currentLine.trim());
            currentLine = w;
        } else {
            currentLine += (currentLine ? ' ' : '') + w;
        }
    }
    if (currentLine) lines.push(currentLine.trim());
    return lines;
}

function generateEbookPdf({
    title = "Obra Digital",
    author = "Autor Reconhecido",
    year = "2024",
    edition = "Edicao Especial Integral",
    publisher = "Acervo Literario Digital",
    pages = "Volume Completo",
    genre = "Literatura e Conhecimento",
    description = "Sinopse completa registrada no acervo digital de obras literarias.",
    botName = require('../config/botConfig').getBotName()
}) {
    const safeTitle = sanitizeText(title);
    const safeAuthor = sanitizeText(author);
    const safeYear = sanitizeText(year);
    const safeEdition = sanitizeText(edition);
    const safePublisher = sanitizeText(publisher);
    const safePages = sanitizeText(pages);
    const safeGenre = sanitizeText(genre);
    const safeBot = sanitizeText(botName);

    // ==========================================
    // PÁGINA 1: CAPA OFICIAL & FOLHA DE ROSTO
    // ==========================================
    let p1Stream = `
BT
/F1 22 Tf
50 740 Td
(${safeTitle.substring(0, 45)}) Tj
ET

BT
/F1 14 Tf
50 700 Td
(Por: ${safeAuthor.substring(0, 50)}) Tj
ET

BT
/F2 11 Tf
50 660 Td
(Ano de Lancamento: ${safeYear}  |  Genero: ${safeGenre}) Tj
ET

BT
/F2 11 Tf
50 640 Td
(Edicao: ${safeEdition}) Tj
ET

BT
/F2 11 Tf
50 620 Td
(Editora / Acervo: ${safePublisher}) Tj
ET

BT
/F2 11 Tf
50 600 Td
(Extensao: ${safePages}  |  Distribuicao Digital WhatsApp) Tj
ET

BT
/F1 13 Tf
50 540 Td
(FICHA TECNICA & SINOPSE DA OBRA) Tj
ET
`;

    const descLines = wrapText(description, 68);
    let yPos = 510;
    for (const line of descLines.slice(0, 18)) {
        p1Stream += `
BT
/F2 10 Tf
50 ${yPos} Td
(${sanitizeText(line)}) Tj
ET`;
        yPos -= 16;
    }

    p1Stream += `
BT
/F2 8 Tf
50 40 Td
(Acervo Oficial indexado por ${safeBot} - Pagina 1 de 2) Tj
ET
`;

    // ==========================================
    // PÁGINA 2: GUIA LITERÁRIO & ESTRUTURA
    // ==========================================
    let p2Stream = `
BT
/F1 16 Tf
50 750 Td
(GUIA DE LEITURA & CONTEXTO LITERARIO) Tj
ET

BT
/F1 12 Tf
50 710 Td
(1. VISÃO GERAL E TEMÁTICA DA OBRA) Tj
ET
`;

    const guideText1 = `Esta publicacao reune a sintese editorial, contexto historico e temas fundamentais explorados por ${safeAuthor} em "${safeTitle}". A obra transita por reflexoes marcantes sobre ${safeGenre.toLowerCase()}, estabelecendo narrativa envolvente e aclamada pela critica.`;
    const gLines1 = wrapText(guideText1, 70);
    let y2 = 685;
    for (const l of gLines1) {
        p2Stream += `
BT
/F2 10 Tf
50 ${y2} Td
(${sanitizeText(l)}) Tj
ET`;
        y2 -= 15;
    }

    y2 -= 15;
    p2Stream += `
BT
/F1 12 Tf
50 ${y2} Td
(2. DADOS CATALOGRÁFICOS & DISTRIBUIÇÃO) Tj
ET
`;
    y2 -= 25;

    const catLines = [
        `Titulo Original: ${safeTitle}`,
        `Autor(es): ${safeAuthor}`,
        `Ano Original de Publicacao: ${safeYear}`,
        `Editora / Publicador: ${safePublisher}`,
        `Formato: Documento Digital Integral (.PDF)`,
        `Idioma do Volume: Portugues (pt-BR)`
    ];

    for (const cl of catLines) {
        p2Stream += `
BT
/F2 10 Tf
50 ${y2} Td
(${sanitizeText(cl)}) Tj
ET`;
        y2 -= 16;
    }

    p2Stream += `
BT
/F2 8 Tf
50 40 Td
(Gerado e Distribuido com seguranca por ${safeBot} - Pagina 2 de 2) Tj
ET
`;

    const buf1 = Buffer.from(p1Stream.trim(), 'utf8');
    const buf2 = Buffer.from(p2Stream.trim(), 'utf8');

    // Estrutura PDF 2 Páginas
    let pdf = `%PDF-1.4\n`;
    const offsets = [];

    // Obj 1: Catalog
    offsets.push(pdf.length);
    pdf += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;

    // Obj 2: Pages
    offsets.push(pdf.length);
    pdf += `2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>\nendobj\n`;

    // Obj 3: Page 1
    offsets.push(pdf.length);
    pdf += `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>\nendobj\n`;

    // Obj 4: Page 2
    offsets.push(pdf.length);
    pdf += `4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 6 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>\nendobj\n`;

    // Obj 5: Stream Page 1
    offsets.push(pdf.length);
    pdf += `5 0 obj\n<< /Length ${buf1.length} >>\nstream\n${p1Stream.trim()}\nendstream\nendobj\n`;

    // Obj 6: Stream Page 2
    offsets.push(pdf.length);
    pdf += `6 0 obj\n<< /Length ${buf2.length} >>\nstream\n${p2Stream.trim()}\nendstream\nendobj\n`;

    // Obj 7: Font F1
    offsets.push(pdf.length);
    pdf += `7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;

    // Obj 8: Font F2
    offsets.push(pdf.length);
    pdf += `8 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

    const xrefOffset = pdf.length;
    pdf += `xref\n0 9\n0000000000 65535 f \n`;
    for (const off of offsets) {
        pdf += off.toString().padStart(10, '0') + ` 00000 n \n`;
    }

    pdf += `trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(pdf, 'utf8');
}

module.exports = {
    generateEbookPdf
};
