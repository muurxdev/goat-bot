# Auditoria Real dos Comandos — GOATBOT

| Comando | Categoria | Arquivo | Permissão | Cooldown | Dependências | Persistência | Status Real |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `.antilink` | admin | `src/commands/admin/antilink.js` | Admin | Padrão (2s) | Interno | SQLite (warns/configs) | REAL_WORKING |
| `.clear` | admin | `src/commands/admin/clear.js` | Admin | Padrão (2s) | Interno | SQLite (warns/configs) | REAL_WORKING |
| `.kick` | admin | `src/commands/admin/kick.js` | Admin | Padrão (2s) | Interno | SQLite (warns/configs) | REAL_WORKING |
| `.warn` | admin | `src/commands/admin/warn.js` | Admin | Padrão (2s) | Interno | SQLite (warns/configs) | REAL_WORKING |
| `.warnings` | admin | `src/commands/admin/warnings.js` | Group | Padrão (2s) | Interno | SQLite (warns/configs) | REAL_WORKING |
| `.api` | dev | `src/commands/dev/api.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.backend` | dev | `src/commands/dev/backend.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.color` | dev | `src/commands/dev/color.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.data` | dev | `src/commands/dev/data.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.deploy` | dev | `src/commands/dev/deploy.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.desafio` | dev | `src/commands/dev/desafio.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.docs` | dev | `src/commands/dev/docs.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.frontend` | dev | `src/commands/dev/frontend.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.github` | dev | `src/commands/dev/github.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.hora` | dev | `src/commands/dev/hora.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.host` | dev | `src/commands/dev/host.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.npm` | dev | `src/commands/dev/npm.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.roadmap` | dev | `src/commands/dev/roadmap.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.search` | dev | `src/commands/dev/search.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.setup` | dev | `src/commands/dev/setup.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.stack` | dev | `src/commands/dev/stack.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.vagas` | dev | `src/commands/dev/vagas.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING (Texto informativo estático) |
| `.buy` | economy | `src/commands/economy/buy.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.mochila` | economy | `src/commands/economy/mochila.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.shop` | economy | `src/commands/economy/shop.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.vender` | economy | `src/commands/economy/vender.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.calc` | general | `src/commands/general/calc.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.dono` | general | `src/commands/general/dono.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.escrever` | general | `src/commands/general/escrever.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.id` | general | `src/commands/general/id.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.info` | general | `src/commands/general/info.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.menu` | general | `src/commands/general/menu.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.meuid` | general | `src/commands/general/meuid.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.ping` | general | `src/commands/general/ping.js` | Todos | Padrão (2s) | Interno | Nenhuma | REAL_WORKING |
| `.fig` | media | `src/commands/media/fig.js` | Todos | Padrão (2s) | Baileys, FFmpeg, node-webpmux | Nenhuma | REAL_WORKING (Sticker WebP) |
| `.play` | media | `src/commands/media/play.js` | Todos | Padrão (2s) | yt-dlp, FFmpeg, Baileys | Nenhuma | PARTIAL (yt-dlp single mp3) |
| `.backup` | owner | `src/commands/owner/backup.js` | Owner | Padrão (2s) | Interno | SQLite (blacklist/settings) | REAL_WORKING |
| `.ban` | owner | `src/commands/owner/ban.js` | Owner | Padrão (2s) | Interno | SQLite (blacklist/settings) | REAL_WORKING |
| `.blacklist` | owner | `src/commands/owner/blacklist.js` | Owner | Padrão (2s) | Interno | SQLite (blacklist/settings) | REAL_WORKING |
| `.broadcast` | owner | `src/commands/owner/broadcast.js` | Owner | Padrão (2s) | Interno | SQLite (blacklist/settings) | REAL_WORKING |
| `.manutencao` | owner | `src/commands/owner/manutencao.js` | Owner | Padrão (2s) | Interno | SQLite (blacklist/settings) | REAL_WORKING |
| `.sysinfo` | owner | `src/commands/owner/sysinfo.js` | Owner | Padrão (2s) | Interno | SQLite (blacklist/settings) | REAL_WORKING |
| `.unban` | owner | `src/commands/owner/unban.js` | Owner | Padrão (2s) | Interno | SQLite (blacklist/settings) | REAL_WORKING |
| `.daily` | profile | `src/commands/profile/daily.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.dossie` | general | `src/commands/general/dossie.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.rank` | profile | `src/commands/profile/rank.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.rankcoins` | profile | `src/commands/profile/rankcoins.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.ranksemana` | profile | `src/commands/profile/ranksemana.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.rep` | profile | `src/commands/profile/rep.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.stats` | profile | `src/commands/profile/stats.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.xp` | profile | `src/commands/profile/xp.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.arena` | rpg | `src/commands/rpg/arena.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.arenainfo` | rpg | `src/commands/rpg/arenainfo.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.arenarank` | rpg | `src/commands/rpg/arenarank.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.atk` | rpg | `src/commands/rpg/atk.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.batalhar` | rpg | `src/commands/rpg/batalhar.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.boss` | rpg | `src/commands/rpg/boss.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.cartas` | rpg | `src/commands/rpg/cartas.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.classe` | rpg | `src/commands/rpg/classe.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.classeshop` | rpg | `src/commands/rpg/classeshop.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.comprarclasse` | rpg | `src/commands/rpg/comprarclasse.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.craft` | rpg | `src/commands/rpg/craft.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.criarpocao` | rpg | `src/commands/rpg/criarpocao.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.curar` | rpg | `src/commands/rpg/curar.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.duelo` | rpg | `src/commands/rpg/duelo.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.equip` | rpg | `src/commands/rpg/equip.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.guilda` | rpg | `src/commands/rpg/guilda.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.hunt` | rpg | `src/commands/rpg/hunt.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.inv` | rpg | `src/commands/rpg/inv.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.lendaria` | rpg | `src/commands/rpg/lendaria.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.lootshop` | rpg | `src/commands/rpg/lootshop.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.missao` | rpg | `src/commands/rpg/missao.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.mob` | rpg | `src/commands/rpg/mob.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.mundo` | rpg | `src/commands/rpg/mundo.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.pet` | rpg | `src/commands/rpg/pet.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.pocao` | rpg | `src/commands/rpg/pocao.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.pocaoativa` | rpg | `src/commands/rpg/pocaoativa.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.usarpocao` | rpg | `src/commands/rpg/usarpocao.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
| `.viajar` | rpg | `src/commands/rpg/viajar.js` | Todos | Padrão (2s) | Interno | SQLite (dataService) | REAL_WORKING |
