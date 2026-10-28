# COMMAND AUDIT — GOATBOT

## Inventário Completo de Comandos

---

### INFORMAÇÕES
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| menu | Info | indexx.js | switch case 'menu' | - | - | todos | 3s | WORKING |
| ping | Info | indexx.js | switch case 'ping' | - | - | todos | 3s | WORKING |
| info | Info | indexx.js | switch case 'info' | - | - | todos | 3s | WORKING |
| dono | Info | indexx.js | switch case 'dono' | - | - | todos | 3s | WORKING |
| id | Info | indexx.js | switch case 'id' | - | - | todos | 3s | WORKING |
| meuid | Info | indexx.js | switch case 'meuid' | - | - | todos | 3s | WORKING |

---

### PERFIL & RANK
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| xp | Perfil | indexx.js | switch case 'xp' | getXpData, barraXP | xp.json | todos | 3s | WORKING |
| me | Perfil | indexx.js | switch case 'me' | getXpData, arenas, mundos, pets | xp.json | todos | 3s | WORKING |
| rank | Rank | indexx.js | switch case 'rank' | getXpData, getCargo, getRank | xp.json | todos | 3s | WORKING |
| ranksemana | Rank | indexx.js | switch case 'ranksemana' | getXpData | xp.json | todos | 3s | WORKING |
| rankcoins | Rank | indexx.js | switch case 'rankcoins' | getXpData | xp.json | todos | 3s | WORKING |
| stats | Perfil | indexx.js | switch case 'stats' | getXpData | xp.json | todos | 3s | WORKING |
| daily | Economia | indexx.js | switch case 'daily' | getXpData, saveXpData | xp.json | todos | 3s / 24h | WORKING |
| rep | Social | indexx.js | switch case 'rep' | getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### DUELOS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| duelo | RPG | indexx.js | switch case 'duelo' | getXpData, saveXpData, aplicarBonusDano | xp.json | todos | 3s | WORKING |
| 1v1 | Alias | indexx.js | menu lista | - | - | todos | - | DEAD_CODE |
| 2v2 | Alias | indexx.js | menu lista | - | - | todos | - | DEAD_CODE |

---

### POÇÕES
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| pocao / pocoes | RPG | indexx.js | switch case 'pocao'/'pocoes' | pocoes object | xp.json (inventario) | todos | 3s | WORKING |
| criarpocao | RPG | indexx.js | switch case 'criarpocao' | receitasPocao, getXpData, saveXpData | xp.json | todos | 3s | WORKING |
| usarpocao | RPG | indexx.js | switch case 'usarpocao' | pocoes, getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### ARENAS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| arena | RPG | indexx.js | switch case 'arena' | arenas object, getXpData | xp.json | todos | 3s | WORKING |
| batalhar | RPG | indexx.js | switch case 'batalhar' | arenas, cartasArena, getXpData, saveXpData, aplicarBonusDano, aplicarBonusCoins | xp.json | todos | 3s | WORKING |
| cartas | RPG | indexx.js | switch case 'cartas' | cartasArena, arenas | - | todos | 3s | WORKING |
| arenainfo | RPG | indexx.js | switch case 'arenainfo' | arenas, getXpData | xp.json | todos | 3s | WORKING |
| arenarank | RPG | indexx.js | switch case 'arenarank' | getXpData, arenas | xp.json | todos | 3s | WORKING |

---

### MISSÕES
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| missao | RPG | indexx.js | switch case 'missao' | getMissoesData, saveMissoesData, gerarMissao, hojeId | missoes.json, xp.json | todos | 3s | WORKING |

---

### RPG DEV (HUNT/MUNDO)
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| hunt | RPG | indexx.js | switch case 'hunt' | mundos, getXpData, saveXpData, sortearLootMob | xp.json | todos | 3s | WORKING |
| mundo | RPG | indexx.js | switch case 'mundo' | mundos object | - | todos | 3s | WORKING |
| viajar | RPG | indexx.js | switch case 'viajar' | mundos, getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### BOSSES
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| boss | RPG | indexx.js | switch case 'boss'/'atk'/'ajudar' | getBossData, saveBossData, gerarBoss, sortearLootBoss, getXpData, saveXpData | boss.json, xp.json | todos | 3s | WORKING |
| atk | Alias | indexx.js | switch case 'atk' | mesmo que boss | boss.json, xp.json | todos | 3s | WORKING |
| ajudar / ajd | Alias | indexx.js | switch case 'ajudar'/'ajd' | mesmo que boss | boss.json, xp.json | todos | 3s | WORKING |
| boss criar | Sub | indexx.js | boss action 'criar' | getBossData, saveBossData, gerarBoss | boss.json | todos | 3s | WORKING |
| boss lista | Sub | indexx.js | boss action 'lista' | mundos | - | todos | 3s | WORKING |
| boss loot | Sub | indexx.js | boss action 'loot' | - | - | todos | 3s | WORKING |

---

### MOBS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| mob lista | RPG | indexx.js | switch case 'mob' action 'lista' | mundos object | - | todos | 3s | WORKING |
| mob loot | RPG | indexx.js | switch case 'mob' action 'loot' | mundos, getRaridadeItem | - | todos | 3s | WORKING |

---

### CLASSES
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| classe lista | RPG | indexx.js | switch case 'classe' action 'lista' | classes object | - | todos | 3s | WORKING |
| classe info | RPG | indexx.js | switch case 'classe' action 'info' | classes object | - | todos | 3s | WORKING |
| classe escolher | RPG | indexx.js | switch case 'classe' action 'escolher' | classes, getXpData, saveXpData | xp.json | todos | 3s | WORKING |
| classeshop | RPG | indexx.js | switch case 'classeshop' | classes object | - | todos | 3s | WORKING |
| comprarclasse | RPG | indexx.js | switch case 'comprarclasse' | classes, precosClasses, getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### LENDÁRIAS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| lendaria lista | RPG | indexx.js | switch case 'lendaria' action 'lista' | classesLendarias object | - | todos | 3s | WORKING |
| lendaria info | RPG | indexx.js | switch case 'lendaria' action 'info' | classesLendarias object | - | todos | 3s | WORKING |
| lendaria desbloquear | RPG | indexx.js | switch case 'lendaria' action 'desbloquear' | classesLendarias, getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### PETS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| pet loja | RPG | indexx.js | switch case 'pet' action 'loja' | petsDisponiveis object | - | todos | 3s | WORKING |
| pet meus | RPG | indexx.js | switch case 'pet' action 'meus' | getXpData, petsDisponiveis | xp.json | todos | 3s | WORKING |
| pet comprar | RPG | indexx.js | switch case 'pet' action 'comprar' | petsDisponiveis, precosPets, getXpData, saveXpData | xp.json | todos | 3s | WORKING |
| pet equipar | RPG | indexx.js | switch case 'pet' action 'equipar' | petsDisponiveis, getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### GUILDAS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| guilda criar | Social | indexx.js | switch case 'guilda' action 'criar' | getGuildData, saveGuildData, getXpData, saveXpData | guilds.json, xp.json | todos | 3s | WORKING |
| guilda entrar | Social | indexx.js | switch case 'guilda' action 'entrar' | getGuildData, saveGuildData, getXpData, saveXpData | guilds.json, xp.json | todos | 3s | WORKING |
| guilda sair | Social | indexx.js | switch case 'guilda' action 'sair' | getGuildData, saveGuildData, getXpData, saveXpData | guilds.json, xp.json | todos | 3s | WORKING |
| guilda info | Social | indexx.js | switch case 'guilda' action 'info' | getGuildData, getXpData | guilds.json, xp.json | todos | 3s | WORKING |

---

### INVENTÁRIO
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| inv | Inventário | indexx.js | switch case 'inv' | getXpData | xp.json | todos | 3s | WORKING |
| mochila | Inventário | indexx.js | switch case 'mochila' | getXpData, saveXpData | xp.json | todos | 3s | WORKING |
| mochila up | Inventário | indexx.js | switch case 'mochila' action 'up' | getXpData, saveXpData | xp.json | todos | 3s | WORKING |
| vender loot | Economia | indexx.js | switch case 'vender' action 'loot' | precosLoot, getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### CRAFT & EQUIPS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| lootshop / equipshop | Craft | indexx.js | switch case 'lootshop'/'equipshop' | equipamentos object | - | todos | 3s | WORKING |
| craft | Craft | indexx.js | switch case 'craft' (duplicado 2x) | equipamentos, getXpData, saveXpData | xp.json | todos | 3s | DUPLICATED |
| equip | Craft | indexx.js | switch case 'equip' | getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### ECONOMIA DEV
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| shop | Economia | indexx.js | switch case 'shop' | - | - | todos | 3s | WORKING |
| buy | Economia | indexx.js | switch case 'buy' | lojaItens, getXpData, saveXpData | xp.json | todos | 3s | WORKING |

---

### PROGRAMAÇÃO
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| github | Dev | indexx.js | switch case 'github' | - | - | todos | 3s | WORKING |
| npm | Dev | indexx.js | switch case 'npm' | - | - | todos | 3s | WORKING |
| docs | Dev | indexx.js | switch case 'docs' | - | - | todos | 3s | WORKING |
| search | Dev | indexx.js | switch case 'search' | - | - | todos | 3s | WORKING |
| api | Dev | indexx.js | switch case 'api' | - | - | todos | 3s | WORKING |
| roadmap | Dev | indexx.js | switch case 'roadmap' | - | - | todos | 3s | WORKING |
| color | Dev | indexx.js | switch case 'color' | - | - | todos | 3s | WORKING |
| stack | Dev | indexx.js | switch case 'stack' | - | - | todos | 3s | WORKING |
| desafio | Dev | indexx.js | switch case 'desafio' | desafios array | - | todos | 3s | WORKING |

---

### ÁREA DEV
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| vagas | Dev | indexx.js | switch case 'vagas' | - | - | todos | 3s | WORKING |
| deploy | Dev | indexx.js | switch case 'deploy' | - | - | todos | 3s | WORKING |
| setup | Dev | indexx.js | switch case 'setup' | - | - | todos | 3s | WORKING |
| frontend | Dev | indexx.js | switch case 'frontend' | - | - | todos | 3s | WORKING |
| backend | Dev | indexx.js | switch case 'backend' | - | - | todos | 3s | WORKING |
| host | Dev | indexx.js | switch case 'host' | - | - | todos | 3s | WORKING |

---

### FIGURINHAS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| fig | Media | indexx.js | switch case 'fig' | downloadContentFromMessage, ffmpeg, fs, exec | temp files | todos | 3s | PARTIALLY_WORKING |

---

### MÚSICAS
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| play | Media | indexx.js | switch case 'play' | yt-dlp, ffmpeg, exec, fs | temp files (yt-{id}.mp3) | todos | 3s | PARTIALLY_WORKING |
| play local | Media | indexx.js | switch case 'play' action 'local' | fs | ./musicas/ | todos | 3s | UNKNOWN |

---

### UTILIDADES
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| hora | Util | indexx.js | switch case 'hora' | Date | - | todos | 3s | WORKING |
| data | Util | indexx.js | switch case 'data' | Date | - | todos | 3s | WORKING |
| calc | Util | indexx.js | switch case 'calc' | mathjs | - | todos | 3s | WORKING |

---

### ADMINISTRAÇÃO
| Comando | Categoria | Arquivo | Função Responsável | Dependências | Persistência | Permissões | Cooldown | Status |
|---------|-----------|---------|-------------------|--------------|--------------|------------|----------|--------|
| kick | Admin | indexx.js | switch case 'kick' | isGroup, isAdmin, isBotAdmin, client.groupParticipantsUpdate | - | group admin | 3s | WORKING |
| warn | Admin | indexx.js | switch case 'warn' | isAdmin, warns.json, fs | warns.json | group admin | 3s | WORKING |
| warnings | Admin | indexx.js | switch case 'warnings' | warns.json | warns.json | todos | 3s | WORKING |
| antilink | Admin | indexx.js | switch case 'antilink' | isAdmin, configs.json, fs | configs.json | group admin | 3s | WORKING |
| clear | Admin | indexx.js | switch case 'clear' | isAdmin, client.sendMessage delete | - | group admin | 3s | WORKING |

---

### COMANDOS NO MENU MAS NÃO IMPLEMENTADOS
| Comando | Status |
|---------|--------|
| escrever | DEAD_CODE (case existe mas não no menu real) |
| responda | DEAD_CODE (case existe mas não no menu real) |
| .bandm | DEAD_CODE (não implementado) |
| .banstatus | DEAD_CODE (não implementado) |
| .up | DEAD_CODE (não implementado) |
| .down | DEAD_CODE (não implementado) |
| .trust | DEAD_CODE (não implementado) |
| .dm | DEAD_CODE (não implementado) |

---

### DUPLICADOS ENCONTRADOS
1. **craft** — Duas implementações (linhas ~2811 e ~5384)
2. **boss/atk/ajudar** — Mesmo case, ações diferentes (intencional)
3. **pocao/pocoes** — Aliases (intencional)
4. **fig** — Duas definições no menu (linhas 1918 e ~1920)

---

### TOTAL: 74 comandos únicos catalogados

- **WORKING**: 58
- **PARTIALLY_WORKING**: 2 (fig, play - dependem de yt-dlp/ffmpeg)
- **DUPLICATED**: 1 (craft)
- **DEAD_CODE**: 9 (comandos no menu não implementados + aliases não funcionais)
- **UNKNOWN**: 1 (play local)