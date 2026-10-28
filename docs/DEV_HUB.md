# GOATBOT — Active Dev Hub & Software Utilities

Documentação técnica das ferramentas ativas para desenvolvedores, criptografia, formatação, encoding, inspeção de tokens e diagnósticos de rede seguros.

---

## 1. Módulos & Utilitários (`src/services/devService.js`)

```text
Dev Hub
├── 📄 JSON Formatter & Minifier (.json format / .json minify)
├── 🔐 Cryptographic Hashing (.hash, .sha256, .md5, .sha512)
├── 📦 Base64 Encoding & Decoding (.b64 encode / .b64 decode)
├── 🔑 JWT Token Inspector (.jwt)
├── 🆔 UUID v4 Generator (.uuid)
├── 🔍 Regular Expression Tester (.regex)
├── 🕒 Timestamp & Epoch Converter (.timestamp)
├── 📱 QR Code Generator (.qrcode / .qr)
├── 🧮 Safe Math Calculator (.calc)
├── 🌐 DNS Record Resolver (.dns)
└── 📡 HTTP Headers Inspector (.headers)
```

---

## 2. Exemplos de Uso

| Comando | Exemplo | Descrição |
| :--- | :--- | :--- |
| **`.json`** | `.json format {"id":1,"name":"test"}` | Valida e formata JSON com indentação |
| **`.sha256`** | `.sha256 senha_segura` | Retorna o digest SHA-256 |
| **`.md5`** | `.md5 string` | Retorna o digest MD5 |
| **`.b64`** | `.b64 encode Olá Mundo` | Codifica para Base64 (`T2zDoSBNdW5kbw==`) |
| **`.jwt`** | `.jwt eyJhbGci...` | Decodifica Header e Payload do JWT |
| **`.uuid`** | `.uuid` | Gera um UUID v4 criptográfico |
| **`.regex`** | `.regex /[0-9]+/g meu id 123` | Testa expressões regulares e exibe grupos |
| **`.timestamp`** | `.timestamp 1700000000` | Converte UNIX epoch para BRT, ISO e UTC |
| **`.qrcode`** | `.qrcode https://site.com` | Renderiza imagem de QR Code para escaneamento |
| **`.dns`** | `.dns google.com MX` | Consulta registros DNS nativos com segurança |
| **`.headers`** | `.headers https://api.github.com` | Inspeciona headers de resposta com proteção SSRF |

