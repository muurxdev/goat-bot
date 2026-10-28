/**
 * Comando .livro / .pdf / .ebook / .book / .libro / .livre
 * Motor inteligente multilíngue com contagem real de páginas e sugestões dinâmicas de autor
 */

const { 
    detectBookLanguage, 
    getI18nLabels, 
    countPdfPages, 
    formatPageBreakdown, 
    searchBooks, 
    resolvePdfUrl, 
    downloadPdfBuffer 
} = require('../../services/bookService');
const { unlockPdfBuffer } = require('../../utils/pdfSecurity');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

module.exports = {
    name: 'livro',
    aliases: ['pdf', 'ebook', 'book', 'libro', 'livre', 'livros', 'ler', 'arquivo', 'documento', 'baixarpdf', 'doc'],
    category: 'livros',
    subcategory: 'Livros & Materiais',
    description: 'Busca inteligente multilíngue de livros e envio de PDFs com autor, ano, edição e sinopse',
    cooldownMs: 3000,
    execute: async ({ text, args, from, client, reply, prefix = '.', info, sender }) => {
        const botName = getBotName();
        const cleanSender = sender ? sender.split('@')[0].split(':')[0] : 'Usuário';

        if (!text || !text.trim()) {
            let ajuda = `📚 *Como pedir um livro*\n`;
            ajuda += `• \`${prefix}livro <título>\` — mando o PDF em português\n`;
            ajuda += `• \`${prefix}livro <título> --en\` — em inglês (também \`--es\` e \`--fr\`)\n`;
            ajuda += `• \`${prefix}livro lista <busca>\` — mostro as opções antes de baixar\n\n`;
            ajuda += `Exemplos: \`${prefix}livro Dom Casmurro\` · \`${prefix}livro Clean Code --en\` · \`${prefix}livro El Principito --es\`\n`;
            ajuda += `Atalhos: \`${prefix}pdf\`, \`${prefix}book\`, \`${prefix}libro\``;

            return reply(ajuda);
        }

        const isSearchOnly = args[0]?.toLowerCase() === 'lista' || args[0]?.toLowerCase() === 'search' || args[0]?.toLowerCase() === 'list';
        const rawQuery = isSearchOnly ? args.slice(1).join(' ').trim() : text.trim();

        if (!rawQuery) {
            return reply(`❌ Faltou o nome do livro ou do autor. Exemplo: \`${prefix}livro O Homem de Giz\``);
        }

        // Detecção do idioma solicitado
        const { lang, cleanQuery } = detectBookLanguage(rawQuery);
        const i18n = getI18nLabels(lang);

        const inicio = Date.now();
        try {
            if (client?.sendMessage && info?.key) client.sendMessage(from, { react: { text: '⏳', key: info.key } }).catch(() => {});
            const loadingMsg = i18n.loading.replace('{query}', cleanQuery);
            await reply(loadingMsg);

            const results = await searchBooks(cleanQuery, 6, lang);

            if (!results || results.length === 0) {
                if (client?.sendMessage && info?.key) client.sendMessage(from, { react: { text: '❌', key: info.key } }).catch(() => {});
                const notFoundMsg = i18n.notFound.replace('{query}', cleanQuery);
                return reply(notFoundMsg);
            }

            // Modo 1: Apenas listagem de opções (.livro lista <nome>)
            if (isSearchOnly) {
                const itens = results.map((r, idx) => {
                    const dados = [r.author, r.year, r.edition || r.publisher].filter(Boolean).join(' · ');
                    return `*${idx + 1}.* ${r.title}${dados ? `\n${dados}` : ''}`;
                }).join('\n\n');

                let lista = `📚 *${i18n.resultsFor} "${cleanQuery}"*\n\n${itens}`;
                if (results[0]?.author) lista += `\n\n${i18n.tipAuthor.replace(/{author}/g, results[0].author)}`;

                return reply(lista);
            }

            // Modo 2: Download e envio direto do PDF Real com Ficha Técnica Completa no Idioma Solicitado
            // Tenta cada resultado até encontrar um PDF disponível
            let targetBook = null;
            let pdfInfo = null;
            let pdfResult = null;

            for (const book of results) {
                logger.info(`[LIVRO] Tentando baixar: "${book.title}" (${book.identifier}) de ${book.source}`);
                const info = await resolvePdfUrl(book.identifier, book.title, lang);
                if (!info?.downloadUrl) {
                    logger.warn(`[LIVRO] Sem URL de download para: "${book.title}" (${book.identifier})`);
                    continue;
                }
                const result = await downloadPdfBuffer(info.downloadUrl, book);
                if (result) {
                    logger.info(`[LIVRO] PDF baixado com sucesso: "${book.title}" (${result.sizeMb})`);
                    targetBook = book;
                    pdfInfo = info;
                    pdfResult = result;
                    break;
                } else {
                    logger.warn(`[LIVRO] Download falhou para: "${book.title}" — URL: ${info.downloadUrl.substring(0, 80)}`);
                }
            }

            if (!targetBook || !pdfResult) {
                // Nenhum PDF encontrado — mostra sugestões dos resultados encontrados
                const suggestions = results.slice(0, 5).map((r, idx) =>
                    `• ${r.title}${r.author ? ` — ${r.author}` : ''}`
                ).join('\n');

                const notFoundMsg = {
                    pt: `🔍 Achei livros parecidos com *${cleanQuery}*, mas nenhum com PDF disponível:\n\n${suggestions}\n\nTente \`${prefix}livro <título>\` com um desses.`,
                    en: `🔍 I found books similar to *${cleanQuery}*, but none with a PDF available:\n\n${suggestions}\n\nTry \`${prefix}book <title>\` with one of these.`,
                    es: `🔍 Encontré libros parecidos a *${cleanQuery}*, pero ninguno con PDF disponible:\n\n${suggestions}\n\nPruebe \`${prefix}libro <título>\` con uno de estos.`
                };
                if (client?.sendMessage && info?.key) client.sendMessage(from, { react: { text: '❌', key: info.key } }).catch(() => {});
                return reply(notFoundMsg[lang] || notFoundMsg.pt);
            }

            const { buffer: rawBuffer } = pdfResult;

            // Verificação e remoção de senhas / restrições de criptografia
            const secResult = unlockPdfBuffer(rawBuffer);
            const finalBuffer = secResult.buffer;

            // Contagem e discriminação exata de páginas do arquivo PDF real
            // TAMANHO EXATO: mede o buffer QUE REALMENTE É ENVIADO, na conta
            // decimal do WhatsApp. O "card diz 61 MB e chega 65 MB" vinha de
            // dividir por 1024×1024 e escrever MB (61 MiB = 64 MB).
            const sentBytes = finalBuffer ? finalBuffer.length : 0;
            const sizeMb = require('../../utils/tamanho').formatarTamanho(sentBytes);

            const detectedPdfPages = countPdfPages(finalBuffer);
            const formattedPages = formatPageBreakdown(detectedPdfPages, targetBook.pagesCount, lang);

            const fileName = (targetBook.title.replace(/[/\\?%*:|"<>]/g, '').trim() || 'Book') + '.pdf';
            const dynamicAuthorTip = i18n.tipAuthor.replace(/{author}/g, targetBook.author);

            const sourceUrl = pdfInfo?.detailsUrl || targetBook.sourceUrl || (targetBook.identifier ? `https://archive.org/details/${targetBook.identifier}` : 'https://archive.org');
            const securityStatus = secResult.isEncrypted && !secResult.isUnlocked ? secResult.password : i18n.unlocked;

            // Ficha do livro no idioma pedido, em moldura como as outras mídias.
            const M = require('../../utils/moldura');
            const { formatElapsed } = require('../../services/media/formatResolver');
            const rotuloBaixado = { pt: 'Baixado em', en: 'Downloaded in', es: 'Descargado en', fr: 'Téléchargé en' }[lang] || 'Baixado em';
            const rotuloFormato = { pt: 'Formato', en: 'Format', es: 'Formato', fr: 'Format' }[lang] || 'Formato';
            const fichaLinhas = [];
            const campoLivro = (emoji, rotulo, valor) => { if (valor) fichaLinhas.push(`${emoji} *${rotulo}:* ${valor}`); };
            campoLivro('📝', i18n.officialTitle, targetBook.title);
            campoLivro('✍️', i18n.author, targetBook.author);
            campoLivro('📅', i18n.year, targetBook.year);
            campoLivro('🏷️', i18n.edition, targetBook.edition || targetBook.publisher);
            campoLivro('📄', i18n.pages, formattedPages);
            campoLivro('🎭', i18n.genre, targetBook.genre);
            campoLivro('🌐', i18n.language, targetBook.language || i18n.langName);
            campoLivro('📦', rotuloFormato, 'PDF');
            campoLivro('💾', i18n.fileSize, sizeMb);
            campoLivro('🔓', i18n.securityLabel, securityStatus);
            campoLivro('⏬', rotuloBaixado, formatElapsed(Date.now() - inicio));
            campoLivro('🏛️', i18n.source, targetBook.source);
            campoLivro('🔗', i18n.sourceLink, sourceUrl);

            const blocosLivro = [
                M.cabecalho('📖', { pt: 'Livro baixado', en: 'Book downloaded', es: 'Libro descargado', fr: 'Livre téléchargé' }[lang] || 'Livro baixado'),
                M.secao('📚', i18n.headerTitle, fichaLinhas)
            ];
            if (targetBook.description) blocosLivro.push(M.secao('📜', i18n.synopsisTitle, [targetBook.description]));
            blocosLivro.push(`💡 ${dynamicAuthorTip}`, M.assinatura());
            const caption = blocosLivro.join('\n\n');

            if (process.env.NODE_ENV === 'test') {
                return reply(caption);
            }

            await client.sendMessage(from, {
                document: finalBuffer,
                mimetype: 'application/pdf',
                fileName,
                caption
            }, { quoted: info });

            if (client?.sendMessage && info?.key) client.sendMessage(from, { react: { text: '✅', key: info.key } }).catch(() => {});

        } catch (err) {
            logger.error(`[LIVRO ERROR] busca "${cleanQuery}" (${lang}):`, err);
            if (client?.sendMessage && info?.key) client.sendMessage(from, { react: { text: '❌', key: info.key } }).catch(e => logger.warn(`[LIVRO] Não reagi com ❌: ${e.message}`));
            return reply(i18n.error.replace('{query}', cleanQuery));
        }
    }
};
