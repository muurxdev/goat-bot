# GOATBOT — Dynamic Command Discovery & Help System

Documentação do sistema de descoberta de comandos e ajuda categorizada dinâmica para mais de 110 comandos modulares.

---

## 1. Modos de Operação do `.help`

O comando `.help` atua em 3 níveis de profundidade:

### 1.1. Visão Geral por Categorias (`.help`)
Exibe o catálogo completo de categorias com contadores dinâmicos de comandos:

```text
╔══════════════════════════════╗
║    🤖 GOAT BOT XP 2.0   ║
╚══════════════════════════════╝

📌 Total de Comandos: 110
💡 Digite .help <categoria> para explorar cada seção:

╭━〔 📥 Mídia & Downloads 〕━⬣
┃ 📊 12 comandos disponíveis
┃ 🔍 Exibir: .help media
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 👨‍💻 Dev Hub & Utilitários 〕━⬣
┃ 📊 28 comandos disponíveis
┃ 🔍 Exibir: .help dev
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 ⚔️ RPG, Duelos & Mobs 〕━⬣
┃ 📊 35 comandos disponíveis
┃ 🔍 Exibir: .help rpg
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🛒 Economia, Itens & Perfil 〕━⬣
┃ 📊 15 comandos disponíveis
┃ 🔍 Exibir: .help economy
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🛡️ Administração de Grupos 〕━⬣
┃ 📊 5 comandos disponíveis
┃ 🔍 Exibir: .help admin
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 👑 Owner & Segurança Global 〕━⬣
┃ 📊 12 comandos disponíveis
┃ 🔍 Exibir: .help owner
╰━━━━━━━━━━━━━━━━━━⬣
```

---

### 1.2. Listagem de Comandos por Categoria (`.help <categoria>`)
Exemplo: `.help media`

```text
╭━━━〔 📥 Mídia & Downloads 〕━━━┈⊷
┃ 📊 Total de Comandos: 12
┣━━━━━━━━━━━━━━━━━━━━━━━━━
┃ ➤ .media (Central de downloads multiplataforma)
┃ ➤ .play (Baixa e reproduz músicas)
┃ ➤ .youtube (Download direto do YouTube)
┃ ➤ .insta (Download do Instagram)
┃ ➤ .tiktok (Download de vídeos do TikTok)
┃ ➤ .twitter (Download de clipes do X)
┃ ➤ .reddit (Download de vídeos do Reddit)
┃ ➤ .pinterest (Download do Pinterest)
┃ ➤ .queue (Exibe fila de downloads)
┃ ➤ .cancel (Cancela download ativo)
┃ ➤ .fig (Cria figurinhas animadas e estáticas)
╰━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
_Para ver detalhes de um comando:_ .help .play
```

---

### 1.3. Ficha Técnica de Comando (`.help <comando>` ou `.help .<comando>`)
Exemplo: `.help .play`

```text
╭━━━〔 📖 DETALHES DO COMANDO 〕━━━┈⊷
┃ 📌 Comando: .play
┃ 📂 Categoria: 📥 Mídia & Downloads
┃ 📝 Descrição: Pesquisa e reproduz músicas do YouTube ou executa arquivos de áudio locais
┃ 🏷️ Aliases: .musica, .tocar, .yt
┃ 🔐 Permissão Mínima: `USER`
┃ ⏱️ Cooldown: 4s
╰━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
_Para executar:_ `.play`
```

