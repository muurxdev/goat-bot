# GOAT — convenções do repositório

Bot de WhatsApp (Baileys 7.0.0-rc11), Node.js **≥22.5** (usa `node:sqlite`), SQLite em `data/database.sqlite`. Entrada: `src/index.js`. ~4.590 comandos em `src/commands/<categoria>/` (famílias geradas sobre serviços). Respostas usam `src/utils/formato.js` (F.tela); cartões em imagem em `src/services/cartaoService.js`.

**Visual:** caixas (`╔═╗` no título, `╭━〔 SEÇÃO 〕━⬣` / `┃` / `╰━⬣` nas seções, `👑 *nome do bot*` no fim), desenhadas só por `src/utils/moldura.js`: F.tela, ui.js, renderCard, menu, legenda de mídia e `.livro` passam por ele. Voltaram por decisão do dono em 2026-09-18 (de 15 a 18/09 foram proibidas e apagadas na saída). Testes conferem moldura **bem formada** com `tests/helpers/moldura.js`; título sai em MAIÚSCULAS, então compare texto de título com `temTexto()`.

## Login obrigatório (decisão do dono, 2026-09-21)

Sem `.login`, **nenhum comando** responde — em grupo e no PV, para todo mundo. Só o próprio `.login` (e apelidos) passa. A trava fica em `messageHandler.js`, antes do `dispatch`, e olha o que foi digitado (não só comando registrado), para barrar também os atalhos `.rpg` e link colado. O login é global: uma conta por pessoa na tabela `users`, válida em qualquer grupo e no privado. De 09/09 a 21/09 a regra ficou frouxa (só RPG/economia/perfil); não afrouxe sem o dono pedir. Teste: `tests/login-obrigatorio.test.js`.

**Exceção (decisão do dono, 2026-10-15):** donos (`isOwner`, inclusive quem chega como `@lid` e se resolve para o telefone do dono) nunca são barrados pela trava de login. Para todos os demais a regra continua igual.

## O que fica entre o usuário comum e a resposta (2026-10-15)

O dono vê tudo funcionando (ele fura a camada de módulos, o aluguel e o flood) e o usuário comum recebia respostas secas ou "desligado". São quatro portões, nesta ordem — ao testar "como usuário", passe pelos quatro:

1. **Login** (`messageHandler.js`): sem cadastro só o `.login` responde. O aviso tem moldura e diz o que a pessoa libera.
2. **Módulo opt-in** (`moduleStateService`, no dispatcher): `provisionIfNew` liga **todos** os módulos, menos `skycode`, no primeiro contato com um grupo/PV. Até 2026-10-15 entrava no perfil RPG, que deixa `utilidades`, `dev` e `livros` desligados — 1.786 de 4.569 comandos (incluindo `.dossie`) respondiam "está desligado aqui" ao usuário comum. Quem quiser estreitar um grupo usa `.perfilbot`. Instalação já provisionada com o padrão antigo: `node scripts/liberar-comandos.js [--dry]` (mantém os overrides `.cmd off x`).
3. **Modo Aluguel** (`rentalService`): **ligado por padrão** (`MODO_ALUGUEL_PADRAO`). Grupo sem plano ativo → "🔒 Este grupo está sem plano ativo" para todo comando de quem não é dono. É política de negócio do dono, não bug: libere com `.aluguel vitalicio grupo` (por grupo) ou desligue o modo no global. Num banco novo (ou snapshot com planos vencidos) quase todo grupo cai aqui.
4. **Flood** (`securityService`): por pessoa. Auditoria que dispara milhares de comandos do mesmo remetente só vê "Foram muitos comandos seguidos".

Auditoria do papel comum: `npm run test:comandos:usuario` (`scripts/testar-comandos.js --papel=comum`). O script provisiona o grupo como em produção, **desliga o aluguel** (`--aluguel=padrao` mantém) e usa um remetente por comando; `--modulos=desligados` volta ao banco virgem. `scripts/achar-respostas-secas.js <relatorio.json>` lista as respostas de conteúdo com menos de 220 caracteres (a "resposta seca").

## Downloads (decisão do dono, 2026-09-20)

- **Uma mídia por pedido.** Nada de mandar a miniatura e depois o vídeo, nem a capa e depois o áudio. O aviso de download é só texto (`avisoDownload.js`); a capa do áudio viaja anexada ao próprio áudio (`audioSender.previaDoAudio`). O `capaAudio.js` foi apagado — não recrie.
- **Qualidade é sempre o máximo existente:** `-S res,fps,vcodec:h264,…` (resolução primeiro, codec só de desempate), MP3 em 320 kbps e **nunca** `-ar` forçado (reamostrar é perda pura). Sem teto de 1080p **em servidor que aguenta**.
- **Exceção por hardware (2026-10-15): o pedido nunca pode ficar preso.** Um AV1 4K de 4 min numa VPS de 1 vCPU ficou 8 min só com o ⏳ (a conversão para H.264 levaria ~35 min). Por isso `MEDIA_LIMITS.MAX_VIDEO_HEIGHT` é **1080 em servidor de até 2 núcleos** (o YouTube entrega 1080p já em H.264, direto para a galeria) e 2160 acima disso; `MEDIA_MAX_VIDEO_HEIGHT` muda. E `ensureMobileVideoCompatibility` não começa conversão estimada acima de `MEDIA_CONVERT_MAX_ESTIMATE_S` (300 s): o original sai na hora, como arquivo (`estimarConversaoSeg`).
- **Não recodifique à toa.** `ensureMobileVideoCompatibility` copia, remuxa ou devolve o original; só recodifica VP9/AV1/HEVC que caiba na galeria. Acima do limite da galeria o vídeo vai como arquivo, íntegro.
- Sem a trava de codec o download pode vir em **MKV**. Quem envia tem de olhar a extensão real (`videoSender.tipoReal`), nunca rotular tudo como `video/mp4`.
- A legenda mostra a **ficha do arquivo** (codec, resolução, fps, taxa, amostragem, canais), medida com ffprobe em `formatResolver.probeMedia`. O `🆔 Código` do post foi removido — quem identifica a mídia é o link da fonte. A ficha completa é o `.mediainfo` (responder a mídia, sem marcar ninguém; ou com link).
- **Toda ficha diz tipo, origem, data e próximos passos (decisão do dono, 2026-10-15).** `fichaDaMidia.js` concentra a origem (`origemDe`: o nome dado ou o host do link — "YouTube" nunca é descartado) e os próximos passos do comando usado (`proximosDe`: YouTube/Spotify por nome com `.play mp4|capa|search`; TikTok/Insta/X/Kwai pelo próprio comando com o link; SoundCloud e imagem sem sugestão; faixa de playlist sem repetir). `.play`, `.spotify` e `formatMediaCaption` (TikTok, Insta, X, Kwai, Pinterest, SoundCloud…) usam isso. O `.spotify` diz "Origem: Spotify (áudio pelo YouTube)" porque o arquivo e o link vêm do casamento no YouTube. "- Topic" some do artista.
- **Reação de download: uma só, ⏳ → ✅.** Os comandos de mídia abrem com ⏳ (`COMMAND_REACTIONS`/`CATEGORY_REACTIONS`), nunca 🎬/🎵/🔎: o tipo e a plataforma estão na frase do aviso.
- **A ficha está de volta (decisão do dono, 2026-10-15).** Entre 21/09 e 15/10 ela ficou de fora e as mídias chegavam "cruas". Vídeo, foto e documento levam a ficha na **legenda da própria mídia** (`formatMediaCaption`, teto de 1024 caracteres; com a nota "mandei como arquivo…" é a ficha que encolhe, nunca a nota). **Áudio do WhatsApp não tem legenda.** Padrão (`AUDIO_NUMA_MENSAGEM=capa`, 2026-10-15): a capa com as informações na legenda (imagem) e o áudio liso logo abaixo — só tipos de mensagem que todo WhatsApp entrega, sem kHz nem canais. **A prévia dentro do áudio (`externalAdReply` com a capa) NÃO é o padrão:** o WhatsApp do dono descartava o áudio em silêncio — o log dizia "enviado", a reação ✅ aparecia e nada chegava —, com capa de 720 px e de 400 px. Outros modos: `previa`, `documento` (arquivo com capa na miniatura e legenda), `video` (MP4 de imagem parada com a ficha na legenda) e `off` (ficha em texto + áudio). O dono compara os formatos no celular com `.testeaudio` (manda os seis lado a lado) e a escolha vira a variável.
- **Plataforma se decide pelo HOST** (`media/plataformas.js`), nunca por `/x\.com/.test(link)` — isso casava com `dropbox.com`. Host de CDN (`pinimg.com`, `twimg.com`…) dá o nome mas não a chave de roteamento. `tt.site/t/<código>` (o link que o app do TikTok compartilha) é TikTok. O aviso de download é **uma frase só** (decisão do dono, 2026-10-15): `⏳ Baixando áudio do YouTube…` / `⏳ Baixando vídeo do TikTok…` — tipo e plataforma na frase, sem cartão, sem título e sem o termo pedido (o nome vem na ficha). Um pedido recebe um aviso só (`avisoDownload` filtra pela mensagem de quem pediu). Pesquisa que só lista opções (`.play search`) continua "🔎 Pesquisando…".
- `qualityLabel` usa o **lado menor**: vertical 1080×1920 é 1080p, não 2K.

## Claude como motor (decisão do dono, 2026-10-15)

O dono quer a API do Claude como motor de tudo que é **linguagem, pesquisa e redação**; o que é conta, estado ou arquivo continua script. Chave: `ANTHROPIC_API_KEY` (console.anthropic.com, pago por uso — **não** é o plano Claude Max/Code). Modelo: `ANTHROPIC_MODEL` (padrão `claude-haiku-5-5`).

- **`llmService.ask`**: com a chave, o Claude é o provedor **único** (Gemini/Groq/etc. só valem sem chave). Teto diário `ANTHROPIC_DAILY_MAX_CALLS` (300) e `ANTHROPIC_DAILY_MAX_TOKENS` (500 mil), em memória; estourou → `null` e o comando mostra o aviso de indisponível. Configure também o limite de gasto no console.
- **Pesquisa**: `llmService.pesquisar` usa a ferramenta de busca na web do servidor da Anthropic (`web_search`, `max_uses` 3). `iaEngine.responderFactual` usa isso quando há chave; o caminho local (Wikipédia + raspagem de DuckDuckGo) só roda sem chave.
- **Transcrição**: a fala continua sendo reconhecida pelo faster-whisper (Claude não ouve áudio); `transcriptionService.melhorarTranscricao` revisa o texto (pontuação, acentos, palavras erradas pelo contexto) **sem resumir nem acrescentar**, e devolve o bruto se algo falhar.
- **Estúdio de texto**: as operações de **criar** (`textStudioIA.OPS_COM_IA`: apelido, poema, bio, recados…) passam pelo Claude; **contar, ordenar, trocar caixa, codificar e achar** ficam no script (`textStudioService`) — é exato, instantâneo e de graça. Falhou → molde local, o comando nunca fica mudo.
- **Nunca** mande para o modelo: RPG, economia, banco, cassino (estado e dinheiro são determinísticos e auditáveis).
- **Transcrição sem limite de duração (2026-10-15):** `.transcrever` entrega o áudio a `transcricaoLonga`, que mede a duração, avisa o plano (duração + estimativa ≈ 1,5×) e roda em segundo plano: trechos de 5 min em disco, um trabalho por vez no servidor, estado em `temp/transcricao/<id>/job.json` (retoma sozinho depois de reinício), no máximo 3 pendentes por pessoa (dono sem limite). Trecho que falha é tentado 3×; texto acima de 3.500 caracteres vai como `.txt`. **Nenhum teto de duração, em nenhuma camada.**

## Rede e links (revisão de 2026-09-21)

- Link vindo de usuário passa por `urlSeguro`: `urlSegura`/`validateUrl` (texto, faixas de IP via `net.BlockList`, nome sem ponto = container do Docker) e `urlSeguraResolvida` (resolve o DNS). Quem segue redirecionamento usa `buscarComSeguranca` (confere cada salto) ou `maxRedirects: 0`. Nunca `redirect: 'follow'` com URL de usuário.
- Painel do QR (porta 3000) só em `127.0.0.1` em **todos** os `docker-compose*.yml`, não só no override.
- Resposta/marcação: o handler entrega aos comandos a mensagem **desembrulhada** (`ephemeralMessage`, visualização única). Em grupo com mensagens temporárias a leitura crua voltava vazia.

## Schema de um comando

Todo arquivo em `src/commands/**/*.js` exporta:

```js
module.exports = {
  name: 'nome',              // OBRIGATÓRIO, único no projeto inteiro
  execute: async (ctx) => {} // OBRIGATÓRIO
  aliases: ['a', 'b'],       // opcional; não pode colidir com nome nem outro alias
  category: 'admin',         // deve bater com a pasta
  subcategory: 'Moderação',  // opcional (usado pelo menu gerado)
  description: '...',
  cooldownMs: 3000,
  groupOnly, adminOnly, ownerOnly, botAdminOnly, minRole  // permissões
}
```

Permissão de admin-do-bot é **`botAdminOnly`**, não `botAdminRequired` (esse último nunca foi lido — não use).

## Regras de código

- **Nunca `catch (_) {}` vazio.** Sempre `logger.warn`/`logger.error` com contexto. Um catch vazio em `commandDispatcher.js` escondeu um `ReferenceError` por meses.
- **Statements SQL:** use o helper memoizado `q(sql)` de `src/database/connection.js`, não `getDatabase().prepare()` dentro de função (recompila a cada chamada).
- **Persistência de usuário:** `saveUser` usa `ON CONFLICT DO UPDATE`. Colunas fora do `SET` são preservadas de propósito (`created_at`, `vault_coins`). Para reduzir level/xp/mochila (rebirth, reset, penalidade), chame `saveUser(user, { force: true })`.
- **Hot path:** não chamar `getXpData()` (tabela inteira) no caminho de toda mensagem. Use `getUser(jid)` pontual.
- **Menu:** gerado do registro de comandos, não hardcoded. Comando novo aparece sozinho se tiver `category`/`subcategory`.

## Desenvolvimento no Windows

O desenvolvimento é no Windows; a produção roda em Docker (Linux) na VPS.
- PC novo: `.\scripts\setup-windows.ps1` (Node, sharp win32, ffmpeg/yt-dlp via winget, testes).
- VPS: `.\scripts\vps.ps1 status|logs|restart|deploy|qr|chave|ssh`, pelo alias `vps` do `~/.ssh/config`. O deploy envia o **commit atual** empacotado (não depende do GitHub) e guarda backup do código anterior em `/root/deploy-backups` na VPS. Os `docker-compose*.yml` do repositório são os de produção (VPS de 1 núcleo, painel QR só em 127.0.0.1).
- O que roda na VPS mora em `scripts/remote/*.sh`. `.sh` fica em LF (`.gitattributes`); `.ps1` precisa de BOM, senão o PowerShell 5.1 estraga os acentos.
- **Testes:** primeira linha `process.env.NODE_ENV = 'test'` (usa `data/database.test.sqlite`). Sem isso o teste grava no banco real — cinco testes e o de backup faziam isso até 2026-09-17.
