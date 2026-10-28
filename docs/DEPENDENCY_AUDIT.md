# DEPENDENCY AUDIT — GOATBOT

## package.json Analysis

### Current package.json
```json
{
  "name": "tec-kode-bot",
  "version": "2.0.0",
  "description": "Esta é uma Base feita por Rony/Spectrum, link do canal dele: https://youtube.com/@Spectrum_bots",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "rony",
  "license": "ISC",
  "dependencies": {
    "@adiwajshing/keyed-db": "^0.2.4",
    "@whiskeysockets/baileys": "^7.0.0-rc11",
    "node-webpmux": "^3.2.1",
    "pino": "^7.11.0"
  }
}
```

---

## Issues Found

### CRITICAL

1. **Entry Point Mismatch**
   - `package.json` → `"main": "index.js"`
   - Actual file: `indexx.js` (112KB)
   - `index.js` **does not exist**
   - `npm start` will fail with "Cannot find module 'index.js'"

2. **Missing `mathjs` dependency**
   - Used in `calc` command (line 2280): `const math = require('mathjs')`
   - Not declared in dependencies
   - Will crash at runtime when `.calc` is used

3. **Missing `gallery-dl` check**
   - Not in dependencies but referenced in Phase 1 requirements
   - Currently not used in code (OK for now)

### HIGH

4. **Baileys version is Release Candidate**
   - `@whiskeysockets/baileys`: `"^7.0.0-rc11"`
   - RC versions may have breaking changes
   - Should pin to stable or use exact version

5. **No devDependencies**
   - No test framework (jest, vitest, etc.)
   - No linter (eslint)
   - No formatter (prettier)
   - No TypeScript despite .js files

6. **`node-webpmux` may have native build issues**
   - Requires Python + build tools on some systems
   - Consider fallback or documentation

### MEDIUM

7. **Unused dependency: `@adiwajshing/keyed-db`**
   - Imported nowhere in indexx.js
   - Used by Baileys internally? Need to verify
   - If not directly used, could be removed

8. **No `engines` field**
   - Should specify Node.js version requirement
   - Baileys 7.x requires Node 18+

9. **No `repository`, `bugs`, `homepage` fields**
   - Good practice for npm packages

### LOW

10. **Description mentions wrong author**
    - "Base feita por Rony/Spectrum"
    - Project is "GOATBOT" by "Martynz Dev" (per menu)

11. **Package name mismatch**
    - `"name": "tec-kode-bot"` vs project "GOATBOT"

12. **ISC license** — OK but MIT is more common

---

## Dependency Usage Verification

| Dependency | Used in Code? | Location | Status |
|------------|---------------|----------|--------|
| @whiskeysockets/baileys | YES | Line 17: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason, downloadContentFromMessage | REQUIRED |
| pino | YES | Line 20: logger for Baileys | REQUIRED |
| node-webpmux | YES | Line 24: webpmux for stickers | REQUIRED |
| @adiwajshing/keyed-db | NO | Not imported directly | VERIFY |
| mathjs | YES (implicit) | Line 2280: require('mathjs') | MISSING |

---

## Recommended Fixes

### Immediate (CRITICAL)
1. Change `"main": "index.js"` → `"main": "indexx.js"` OR rename `indexx.js` → `index.js`
2. Add `"mathjs": "^12.x.x"` to dependencies
3. Run `npm install` to verify

### Short-term (HIGH)
1. Pin Baileys to exact version: `"@whiskeysockets/baileys": "7.0.0-rc11"` (remove ^)
2. Add Node.js engine requirement: `"engines": { "node": ">=18.0.0" }`
3. Verify `@adiwajshing/keyed-db` usage — remove if unused

### Medium-term (MEDIUM)
1. Add devDependencies for testing/linting
2. Fix package metadata (name, description, author)
3. Add proper scripts: test, lint, dev

---

## package-lock.json
- Present (38KB)
- Should be regenerated after dependency fixes
- Run `npm install` after changes

---

## External System Dependencies (Not in package.json)

| Tool | Required By | Install Method | Status |
|------|-------------|----------------|--------|
| yt-dlp | `.play` command | pip/brew/apt | REQUIRED |
| ffmpeg | `.fig` (stickers), `.play` (audio) | apt/brew/choco | REQUIRED |
| gallery-dl | Future Media Hub | pip | NOT YET USED |

**Verification needed:**
- Code assumes `yt-dlp` and `ffmpeg` in PATH
- No version detection or fallback
- No graceful error if missing

---

## Recommendation

**Priority 1**: Fix entry point + add mathjs → enables `npm start`
**Priority 2**: Audit @adiwajshing/keyed-db usage
**Priority 3**: Pin Baileys version, add engines field
**Priority 4**: Document external deps (yt-dlp, ffmpeg) in README