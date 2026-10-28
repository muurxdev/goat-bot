# GOAT BOT XP — FASE 1

## Auditoria completa, correção e estabilização do projeto existente

Você é o agente principal responsável pela engenharia deste projeto.

O projeto é o **GOATBOT**, um bot de WhatsApp utilizado principalmente em um grupo de desenvolvedores.

A partir deste momento, seu objetivo NÃO é adicionar novas funcionalidades ainda.

Seu objetivo nesta fase é:

> **entender completamente o projeto existente, encontrar problemas reais, corrigir o que está quebrado, eliminar inconsistências, melhorar a estabilidade e deixar uma base segura para as próximas fases.**

A implementação das novas funcionalidades será feita somente depois que esta fase estiver concluída.

---

# 1. REGRA MAIS IMPORTANTE

NÃO faça uma reescrita completa do projeto imediatamente.

NÃO substitua o projeto inteiro por uma arquitetura nova sem necessidade.

NÃO remova funcionalidades simplesmente porque parecem antigas.

NÃO altere comportamento funcional sem antes entender sua finalidade.

NÃO crie funcionalidades fictícias apenas para preencher lacunas.

NÃO diga que algo está funcionando sem realmente testar.

NÃO considere um comando funcional apenas porque existe um `case` para ele.

O código existente deve ser tratado como legado que precisa ser compreendido antes de ser modificado.

---

# 2. PRIMEIRO PASSO — INVENTÁRIO COMPLETO

Antes de modificar qualquer arquivo, faça uma análise completa do repositório.

Identifique:

* entry point
* package.json
* scripts
* dependências
* arquivos JavaScript/TypeScript
* arquivos JSON
* banco de dados
* sessão/autenticação
* configuração
* comandos
* handlers
* eventos
* serviços
* utilitários
* integração com WhatsApp
* integração com yt-dlp
* integração com FFmpeg
* integração com gallery-dl
* sistemas de XP
* economia
* RPG
* guildas
* arena
* boss
* pets
* craft
* inventário
* missões
* administração
* moderação
* anti-link
* warnings
* qualquer outra funcionalidade existente.

Não modifique nada durante este primeiro levantamento.

---

# 3. MAPA DOS COMANDOS

Crie:

```text
docs/COMMAND_AUDIT.md
```

Liste absolutamente todos os comandos existentes.

Para cada comando:

```text
Comando:
Categoria:
Arquivo:
Função responsável:
Dependências:
Persistência utilizada:
Permissões:
Cooldown:
Status:
```

Classifique o status como:

```text
WORKING
PARTIALLY_WORKING
BROKEN
DUPLICATED
DEAD_CODE
UNKNOWN
```

IMPORTANTE:

Um comando só pode ser classificado como `WORKING` depois de verificar sua implementação e, quando possível, executar um teste real.

---

# 4. MAPA DAS DEPENDÊNCIAS

Analise:

```text
package.json
package-lock.json
npm/yarn/pnpm configuration
```

Verifique:

* dependências inexistentes
* dependências não utilizadas
* dependências duplicadas
* versões incompatíveis
* scripts incorretos
* entry point incorreto
* comandos de inicialização
* módulos importados incorretamente.

Corrija problemas reais.

Não atualize todas as dependências indiscriminadamente.

---

# 5. CORRIGIR O ENTRY POINT

Verifique qual é o verdadeiro ponto de entrada do bot.

O `package.json` deve apontar para o arquivo realmente utilizado.

Por exemplo, se o projeto utiliza:

```text
indexx.js
```

mas o package.json aponta para:

```text
index.js
```

isso deve ser corrigido.

O resultado precisa permitir:

```bash
npm start
```

sem depender do diretório em que o terminal foi aberto.

---

# 6. CAMINHOS DE ARQUIVOS

Procure por caminhos como:

```javascript
'./arquivo.json'
'./data/arquivo.json'
'./sessao'
'./temp'
```

Verifique se eles dependem do diretório atual de execução.

Substitua por caminhos robustos baseados no diretório da aplicação.

Crie uma estrutura centralizada para paths.

Exemplo:

```text
src/
config/
data/
temp/
logs/
auth/
```

Não mova arquivos automaticamente sem atualizar todas as referências.

---

# 7. PERSISTÊNCIA

Mapeie todos os arquivos utilizados como banco de dados.

Especialmente:

```text
xp.json
guilds.json
boss.json
warns.json
missoes.json
```

e quaisquer outros encontrados.

Identifique:

* dados duplicados
* arquivos duplicados
* fontes de verdade diferentes
* gravações simultâneas
* leitura inexistente
* corrupção possível
* estruturas inconsistentes.

Se existirem dois arquivos representando o mesmo sistema, determine qual é a fonte correta antes de remover qualquer coisa.

---

# 8. NÃO MIGRAR PARA BANCO AINDA

Nesta fase:

NÃO faça ainda a migração completa para PostgreSQL ou SQLite.

Primeiro estabilize o funcionamento atual.

Entretanto, prepare a arquitetura para uma futura camada de persistência.

Crie, quando fizer sentido:

```text
src/database/
```

ou equivalente.

A próxima fase decidirá a migração definitiva.

---

# 9. AUDITORIA DO SISTEMA DE XP

Teste e revise:

* ganho de XP
* perda de XP
* level up
* cálculo de nível
* ranking
* persistência
* XP duplicado
* XP negativo
* usuários inexistentes
* usuários novos
* concorrência
* reset
* comandos relacionados.

Verifique especialmente se dois eventos simultâneos podem sobrescrever dados.

Corrija problemas encontrados.

---

# 10. AUDITORIA DA ECONOMIA

Revise completamente:

* coins
* recompensas
* daily
* pagamentos
* transferências
* gastos
* compras
* vendas
* recompensas de missão
* recompensas de batalha.

Procure vulnerabilidades como:

```text
coins negativos
duplicação de recompensa
double claim
double execution
valores NaN
valores Infinity
overflow
comandos sem cooldown
```

Nenhuma ação econômica deve poder gerar recursos infinitos.

---

# 11. AUDITORIA DO RPG

Teste:

```text
Boss
Arena
Duelo
Classes
Classes lendárias
Pets
Craft
Inventário
Poções
Missões
Guildas
```

Verifique:

* estado inexistente
* usuário inexistente
* dados corrompidos
* valores negativos
* recompensas duplicadas
* comandos concorrentes
* cooldowns
* validação de argumentos
* persistência.

---

# 12. AUDITORIA DE MODERAÇÃO

Teste:

```text
warn
warnings
kick
ban
unban
antilink
mute
```

Verifique permissões.

Um usuário normal NÃO pode executar comandos administrativos.

Um administrador não deve conseguir executar ações que estejam reservadas ao owner quando isso for aplicável.

Valide:

```text
bot admin
group admin
owner
usuário comum
```

---

# 13. AUDITORIA DO WHATSAPP / BAILEYS

Analise completamente:

* conexão
* reconexão
* autenticação
* sessão
* eventos
* mensagens
* grupos
* participantes
* permissões
* erros de conexão
* logout
* atualização de credenciais.

Verifique se existem possibilidades de:

* múltiplas conexões
* loop de reconexão
* perda de sessão
* eventos duplicados
* listeners duplicados.

Implemente shutdown limpo para:

```text
SIGINT
SIGTERM
```

O processo deve fechar corretamente antes de ser reiniciado.

---

# 14. SESSÃO

A sessão do WhatsApp deve ser tratada como dado sensível.

Verifique:

```text
sessao/
auth/
```

e qualquer diretório equivalente.

Garanta que:

```text
.env
auth/
sessao/
logs privados
```

não sejam versionados acidentalmente.

Atualize:

```text
.gitignore
```

quando necessário.

Crie:

```text
.env.example
```

sem informações secretas.

NUNCA exponha credenciais existentes.

---

# 15. TRATAMENTO DE ERROS

Procure:

```text
try/catch
uncaughtException
unhandledRejection
Promise
async/await
```

Diferencie:

```text
erro de usuário
erro de validação
erro de rede
erro de serviço externo
erro de banco
erro de filesystem
erro fatal
```

Não silencie erros importantes.

Não coloque simplesmente:

```javascript
catch {}
```

ou:

```javascript
catch (e) {
    console.log(e)
}
```

sem contexto.

Crie logs úteis.

---

# 16. LOGGING

Se não existir um sistema adequado, crie uma camada simples:

```text
src/utils/logger.js
```

ou equivalente.

Os logs devem registrar:

```text
timestamp
nível
evento
comando
usuário anonimizado quando necessário
grupo anonimizado quando necessário
erro
stack trace
```

Evite registrar:

* credenciais
* tokens
* conteúdo privado desnecessário
* sessão do WhatsApp.

---

# 17. YT-DLP

Audite completamente o sistema `.play` e qualquer outro comando que utilize:

```text
yt-dlp
```

Verifique:

* instalação
* localização do executável
* argumentos
* formatos
* MP3
* MP4
* thumbnail
* nomes de arquivos
* caracteres especiais
* playlists
* vídeos indisponíveis
* timeout
* erro de download
* arquivos temporários
* limpeza.

NÃO implemente ainda o novo Media Hub.

Apenas faça o sistema atual funcionar corretamente.

---

# 18. FFMPEG

Verifique se FFmpeg é realmente necessário e onde é utilizado.

Teste:

```text
vídeo → áudio
áudio → mp3
conversões
thumbnail
metadata
```

Não assuma que FFmpeg está instalado.

O código deve detectar ausência da dependência e produzir um erro compreensível.

---

# 19. ARQUIVOS TEMPORÁRIOS

Todos os downloads/conversões devem possuir:

```text
temp/
```

ou equivalente.

Garanta:

```text
criação segura
nome seguro
cleanup
timeout
remoção após sucesso
remoção após erro
```

Um erro no download não pode deixar centenas de arquivos abandonados.

---

# 20. VALIDAÇÃO DE ENTRADA

Todos os comandos que recebem argumentos devem validar:

```text
URL
número
usuário
quantidade
ID
nome
opções
```

Nunca confiar cegamente no texto enviado pelo usuário.

Evitar:

```text
NaN
Infinity
negative values
empty strings
undefined
null
URLs inválidas
```

---

# 21. COOLDOWNS

Mapeie todos os comandos que precisam de cooldown.

Procure maneiras de abusar de:

```text
.daily
.work
.quest
.boss
arena
duelo
recompensas
economia
download
```

Não coloque cooldown arbitrário em tudo.

Apenas corrija os existentes e identifique lacunas.

---

# 22. DUPLICAÇÕES

Procure:

* comandos duplicados
* funções duplicadas
* cases duplicados
* arquivos `.bak`
* código morto
* imports inutilizados
* variáveis não utilizadas
* funções nunca chamadas.

Não delete imediatamente.

Primeiro documente.

Depois remova somente aquilo que comprovadamente não é utilizado ou é duplicado.

---

# 23. TESTES

Crie uma estrutura:

```text
tests/
```

Adicione testes para as partes que possam ser testadas sem WhatsApp.

Prioridade:

```text
XP
Economia
Cooldown
Validação
Inventário
Craft
Missões
Ranking
Permissões
Utilitários
```

Execute:

```bash
npm test
```

ou configure um script apropriado.

---

# 24. TESTE DE BUILD / START

O projeto deve conseguir:

```bash
npm install
npm start
```

sem erros estruturais.

Se existir lint:

```bash
npm run lint
```

Se não existir, avalie se é possível adicionar.

Não introduza uma quantidade enorme de ferramentas apenas para "parecer profissional".

---

# 25. NÃO IMPLEMENTAR AINDA

Nesta fase NÃO implementar:

```text
Media Hub novo
Progress Engine novo
Dev Tools novo
Owner Core novo
.banstatus novo
.bandm novo
.up novo
.down novo
novo sistema de guilda
novo banco PostgreSQL
dashboard
API externa
VPS
Docker
```

Essas funcionalidades pertencem às próximas fases.

Por enquanto queremos uma fundação confiável.

---

# 26. CORREÇÃO INCREMENTAL

Depois da auditoria:

1. Liste os problemas.
2. Classifique:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

3. Corrija primeiro:

```text
CRITICAL
HIGH
```

4. Rode os testes.
5. Corrija regressões.
6. Continue para MEDIUM.
7. Faça uma revisão final.

Não faça 50 alterações sem testar.

---

# 27. GIT / CHECKPOINTS

Se o projeto estiver usando Git:

Antes das alterações significativas, crie um checkpoint.

Exemplo:

```bash
git status
git add .
git commit -m "chore: pre phase 1 audit checkpoint"
```

Depois faça commits menores:

```text
fix: correct application entry point
fix: normalize data paths
fix: stabilize xp persistence
fix: fix economy validation
fix: improve whatsapp reconnect
fix: improve media command
test: add core system tests
```

Se Git não estiver configurado, não inicialize automaticamente sem verificar primeiro.

---

# 28. DOCUMENTAÇÃO FINAL

Ao terminar, crie:

```text
docs/
├── AUDIT_REPORT.md
├── COMMAND_AUDIT.md
├── DEPENDENCY_AUDIT.md
├── SECURITY_AUDIT.md
├── FIXES_APPLIED.md
└── KNOWN_ISSUES.md
```

`AUDIT_REPORT.md` deve responder:

```text
Quantos comandos existem?
Quantos funcionam?
Quantos estavam quebrados?
Quantos foram corrigidos?
Quais dependências são necessárias?
Quais problemas de segurança foram encontrados?
Quais problemas permanecem?
O projeto está pronto para a próxima fase?
```

---

# 29. CRITÉRIO DE CONCLUSÃO

A FASE 1 só pode ser considerada concluída quando:

* [ ] entry point funciona
* [ ] `npm start` funciona
* [ ] dependências foram auditadas
* [ ] comandos foram catalogados
* [ ] comandos quebrados foram identificados
* [ ] problemas críticos corrigidos
* [ ] persistência atual estabilizada
* [ ] XP testado
* [ ] economia testada
* [ ] RPG testado
* [ ] moderação testada
* [ ] Baileys auditado
* [ ] reconexão revisada
* [ ] sessão protegida
* [ ] yt-dlp auditado
* [ ] FFmpeg auditado
* [ ] arquivos temporários tratados
* [ ] validação implementada onde necessário
* [ ] cooldowns auditados
* [ ] erros tratados
* [ ] logs melhorados
* [ ] testes criados
* [ ] testes executados
* [ ] documentação gerada
* [ ] nenhum recurso existente foi removido sem justificativa.

---

# 30. REGRA FINAL

Quando encontrar algo quebrado:

NÃO esconda.

Documente.

Quando não conseguir testar algo por depender do WhatsApp:

marque:

```text
REQUIRES_REAL_WHATSAPP_TEST
```

Quando uma API externa estiver indisponível:

marque:

```text
REQUIRES_EXTERNAL_SERVICE
```

Quando não tiver certeza:

marque:

```text
UNKNOWN
```

Nunca invente um resultado de teste.

---

# RESULTADO ESPERADO

Ao finalizar esta fase, o projeto deve estar:

```text
┌─────────────────────────────┐
│     GOAT BOT XP         │
├─────────────────────────────┤
│                             │
│  Código existente            │
│       ↓                     │
│  Auditado                   │
│       ↓                     │
│  Corrigido                  │
│       ↓                     │
│  Testado                    │
│       ↓                     │
│  Documentado                │
│       ↓                     │
│  ESTÁVEL                    │
│                             │
└─────────────────────────────┘
```

Somente depois disso estaremos autorizados a iniciar a FASE 2.

No final da execução, NÃO comece automaticamente a FASE 2.

Pare e apresente:

1. resumo da auditoria;
2. problemas encontrados;
3. problemas corrigidos;
4. testes executados;
5. testes que não puderam ser executados;
6. arquivos modificados;
7. riscos restantes;
8. recomendação sobre a próxima fase.