# BACKUP.md - Estratégia de Backup

## Configuração Atual

- **Local:** `~/.openclaw/`
- **Frequência:** Manual (por enquanto)
- **Retenção:** 1 backup recente mantido
- **Exclusões:** Logs temporários, sessões antigas

## Arquivos Críticos

### Sempre fazer backup:

- `openclaw.json` — Configuração principal
- `credentials/` — Credenciais e autenticações
- `workspace/` — Documentação e estado
- `extensions/` — Extensões personalizadas

### Opcional:

- `agents/sessions/` — Histórico de conversas (pode ser grande)
- `logs/` — Logs do sistema (rotacionar)
- `memory/` — Dados de memória (já persistente)

## Estratégia de Backup

### Diário

```bash
# Backup automático diário
openclaw backup create --quiet
```

### Semanal

- Limpeza de logs antigos
- Verificação de integridade
- Backup completo para storage externo

### Manual

```bash
# Backup completo
openclaw backup create

# Verificar backup
openclaw backup verify
```

## Restauração

```bash
# Restaurar de backup
cp backup/openclaw.json.bak ~/.openclaw/openclaw.json
openclaw gateway restart
```

## Monitoramento

- Alertar se backup falhar
- Verificar espaço em disco antes do backup
- Logs de backup em `logs/backup.log`
