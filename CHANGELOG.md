# Changelog

## [Unreleased]

### Melhorias

- **Canvas (Voz)**: Renomeado de "Canvas" para "Voz", separado estilos e scripts, adicionado botão de retry para ponte nativa, melhorado status de conexão
- **Sistema de Completions**: Criado gerador unificado que produz autocompletar para bash, zsh, fish e PowerShell a partir de fonte única JSON
- **Extensões**: Melhorada extensão web-search com configuração via variáveis de ambiente, retry/backoff, validação de URLs
- **WhatsApp Integration**: Configurado auto-reply, trigger words, controle de acesso, silêncio inteligente
- **Documentação**: Atualizado README principal, criado guias de backup, manutenção e automação
- **Workspace**: Melhorada documentação em HEARTBEAT.md e SOUL.md com identidade específica da Voz
- **Manutenção**: Criado script automático de limpeza, otimização de bancos de dados, backup
- **Limpeza**: Removidos backups antigos, arquivos temporários, estrutura organizada
- **Automação**: Sistema de manutenção automática, backup configurado, monitoramento básico

### Arquivos Criados/Modificados

- `README.md` — Documentação principal melhorada
- `CHANGELOG.md` — Histórico de mudanças
- `BACKUP.md` — Estratégia de backup
- `AUTOMATION.md` — Guia de automação e melhorias
- `MAINTENANCE.sh` — Script de manutenção automática
- `canvas/index.html` — Interface atualizada com botão retry
- `canvas/styles.css` — Estilos separados e melhorados
- `canvas/script.js` — Lógica de ponte aprimorada
- `canvas/README.md` — Documentação atualizada
- `completions/generate.js` — Gerador unificado criado
- `completions/completions-data.json` — Dados de completion centralizados
- `completions/openclaw.*` — Scripts gerados automaticamente
- `completions/README.md` — Documentação do gerador
- `extensions/openclaw-web-search/index.ts` — Extensão melhorada
- `workspace/HEARTBEAT.md` — Monitoramento periódico configurado
- `workspace/SOUL.md` — Identidade da Voz definida
- `openclaw.json` — Configuração do WhatsApp otimizada
- Backups antigos removidos

### Funcionalidades Ativas

- 🤖 Agente IA com modelos Ollama
- 🎙️ Canvas Voz com ponte nativa/mobile
- 💻 Autocompletar em 4 shells
- 📱 WhatsApp integrado com auto-reply
- 🔍 Web search com resiliência
- 🛠️ Manutenção automática
- 📊 Monitoramento básico
- 🔄 Backup e restauração
