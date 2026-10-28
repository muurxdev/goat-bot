# Plano — 1.000 comandos (versão Premium)

> Escrito em 2026-09-04, **depois** da auditoria dos 8 módulos. A base está
> estável: 601 comandos, 0 erros de carga, 0 aliases mortos, suíte 23/23.

## 1. Onde estamos (medido, não estimado)

**601 comandos** distribuídos assim:

| Módulo | Hoje | Situação |
|---|---:|---|
| rpg | 112 | saturado |
| utilidades | 108 | saturado |
| dev | 73 | bem servido |
| diversao | 70 | bem servido |
| moderacao | 51 | bem servido |
| economia | 47 | ok |
| owner | 38 | ok |
| perfil | 20 | **magro** |
| downloads | 19 | **magro** |
| mensagens-grupo | 17 | **magro** |
| figurinhas | 17 | **magro** |
| jogos | 15 | **magro** |
| cassino | 10 | **magro** |
| livros | 2 | **quase vazio** |
| ia | 1 | **quase vazio** |
| skycode | 1 | **quase vazio** |

O ponto central: **o espaço vazio não está no RPG nem em utilidades** (que já
têm 220 juntos), e sim em livros, IA, jogos, figurinhas e mensagens de grupo.
Crescer ali é ganho real; crescer nos saturados é encher linguiça.

## 2. Meta: 601 -> ~1.000 (+399)

| Módulo | Hoje | Meta | Novos | Por quê |
|---|---:|---:|---:|---|
| jogos | 15 | 70 | **+55** | jogos interativos usam o interactionService (resposta livre) — mecânica já pronta e testada |
| figurinhas | 17 | 55 | **+38** | filtros/efeitos de imagem com sharp, sem API externa |
| livros | 2 | 38 | **+36** | busca por autor/gênero/idioma, apostilas, favoritos, biblioteca pessoal |
| ia | 1 | 34 | **+33** | tradução, resumo, explicação de código, OCR+IA, análise de texto |
| cassino | 10 | 42 | **+32** | variações de aposta com saldo real (economia já persiste) |
| mensagens-grupo | 17 | 47 | **+30** | automação: agendamento, boas-vindas, enquetes, anúncios, regras |
| economia | 47 | 75 | **+28** | profissões, negócios, mercado, impostos, investimentos |
| perfil | 20 | 45 | **+25** | conquistas, títulos, coleções, comparativos, histórico |
| downloads | 19 | 42 | **+23** | novas plataformas e formatos |
| dev | 73 | 93 | **+20** | conversores, validadores, geradores, cheatsheets |
| moderacao | 51 | 69 | **+18** | filtros, auditoria, automação de punição |
| rpg | 112 | 128 | **+16** | fecha lacunas (profissões, eventos, endgame) |
| utilidades | 108 | 122 | **+14** | conversores e calculadoras que faltam |
| skycode | 1 | 12 | **+11** | painel do grupo: relatórios, métricas, configuração |
| diversao | 70 | 80 | **+10** | pacotes de conteúdo novos |
| owner | 38 | 48 | **+10** | operação, diagnóstico, backup, auditoria |
| **TOTAL** | **601** | **1.000** | **+399** | |

## 3. Como cada lote é produzido

1. **Gerar** — `node scripts/gen-commands.js <batch.js>`; o gerador pula nomes e
   aliases já usados, e cada `execute` é função real (nada de stub).
2. **Nascer OFF** — todo comando novo cai num módulo e começa desativado; o dono
   libera por ambiente com `.modulo on <mod>`.
3. **Auditar com o mesmo rigor da varredura dos 8 módulos:**
   - estrutural: executa sem crash (harness com timeout)
   - funcional: muda estado e **persiste**; resultado conferível quando for cálculo
   - `npm test` verde + `dispatcher-integrity` (0 erros, 0 aliases mortos)
4. **Commit + deploy** por lote, com relatório do lote.

## 4. Ordem de execução (16 lotes, um por módulo)

Prioridade = maior lacuna x menor dependência externa.

| Lote | Módulo | Novos | Dependência |
|---|---|---:|---|
| 1 | jogos | 55 | nenhuma (interactionService pronto) |
| 2 | figurinhas | 38 | sharp (já instalado) |
| 3 | cassino | 32 | nenhuma (economia persiste) |
| 4 | perfil | 25 | nenhuma |
| 5 | mensagens-grupo | 30 | scheduler já existe |
| 6 | economia | 28 | nenhuma |
| 7 | dev | 20 | nenhuma |
| 8 | utilidades | 14 | nenhuma |
| 9 | moderacao | 18 | bot admin no grupo |
| 10 | rpg | 16 | nenhuma |
| 11 | diversao | 10 | nenhuma |
| 12 | owner | 10 | nenhuma |
| 13 | skycode | 11 | nenhuma |
| 14 | downloads | 23 | yt-dlp/cookies (ok) |
| 15 | **livros** | 36 | **fontes de acervo** |
| 16 | **ia** | 33 | **chave de API** |

## 5. Riscos declarados

- **Lotes 15 e 16 dependem de coisa externa.** Livros: hoje só o Archive.org
  entrega de fato (Gutendex inalcançável, Google Books devolve 429 sem chave).
  IA: precisa de chave de API. Sem resolver isso, esses 69 comandos seriam
  fachada — e a regra do projeto é não ter comando fake.
- **Diversao e alguns pacotes de conteúdo** são naturalmente repetitivos
  (respostas sorteadas de uma lista). Mantidos em dose baixa (+10) de propósito.
- **Teto de aliases:** hoje 62 conflitos (limite do teste: 63). Com centenas de
  comandos novos isso estoura; o gerador já pula aliases ocupados, mas o teto do
  `dispatcher-integrity` vai precisar ser revisto conscientemente.

## 6. Definição de pronto (por lote)

- [ ] comandos criados pelo gerador, todos com lógica real
- [ ] 100% executam sem crash
- [ ] os que mudam estado, persistem (verificado com ida e volta no banco)
- [ ] 0 aliases mortos, 0 erros de carga
- [ ] `npm test` verde
- [ ] commit + push + deploy na VPS + relatório do lote
