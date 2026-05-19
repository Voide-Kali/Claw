# OpenClaw Completion Generator

Este diretório contém um gerador de completions centralizado para `openclaw`.

## Arquivos

- `completions-data.json` — fonte única de comandos e opções.
- `generate.js` — gerador que produz:
  - `openclaw.bash`
  - `openclaw.zsh`
  - `openclaw.fish`
  - `openclaw.ps1`

## Como regenerar

```bash
cd /home/voide/.openclaw/completions
node generate.js
```

Sempre execute o gerador após atualizar `completions-data.json`.
