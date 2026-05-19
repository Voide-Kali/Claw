#!/bin/bash
# MAINTENANCE.sh - Manutenção Automática do OpenClaw
set -e

LOG_FILE="$HOME/.openclaw/logs/maintenance.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Função de logging com timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $@" | tee -a "$LOG_FILE"
}

log "🧹 Iniciando manutenção do OpenClaw..."

# Limpar backups antigos (manter apenas o mais recente)
log "📁 Limpando backups antigos..."
cd ~/.openclaw
if ls openclaw.json.bak* 2>/dev/null >/dev/null; then
    ls -t openclaw.json.bak* 2>/dev/null | tail -n +2 | xargs -r rm -fv | sed 's/^/  ✓ Removido: /' >> "$LOG_FILE"
    log "✓ Backups antigos removidos"
else
    log "ℹ Nenhum backup antigo encontrado"
fi

# Limpar arquivos temporários
log "🗑️  Limpando arquivos temporários..."
TMPFILES=$(find . -name "*.tmp" -type f -delete -print 2>/dev/null | wc -l || echo 0)
LOGFILES=$(find . -name "*.log" -type f -mtime +30 -delete -print 2>/dev/null | wc -l || echo 0)
log "✓ Removidos $TMPFILES arquivos .tmp e $LOGFILES logs antigos"

# Otimizar bancos de dados SQLite com validação
log "💾 Otimizando bancos de dados..."
if [ -f ~/.openclaw/tasks/runs.sqlite ]; then
    if sqlite3 ~/.openclaw/tasks/runs.sqlite "PRAGMA integrity_check;" | grep -q "ok"; then
        sqlite3 ~/.openclaw/tasks/runs.sqlite "VACUUM;" && log "✓ runs.sqlite otimizado"
    else
        log "⚠ runs.sqlite com possível corrupção - pulando VACUUM"
    fi
fi

if [ -f ~/.openclaw/memory/main.sqlite ]; then
    if sqlite3 ~/.openclaw/memory/main.sqlite "PRAGMA integrity_check;" | grep -q "ok" 2>/dev/null; then
        sqlite3 ~/.openclaw/memory/main.sqlite "VACUUM;" && log "✓ memory/main.sqlite otimizado"
    else
        log "⚠ memory/main.sqlite não encontrado ou inacessível"
    fi
fi

# Verificar saúde do sistema
log "🏥 Verificando saúde do sistema..."
if command -v openclaw &> /dev/null; then
    if openclaw health --json > /tmp/health_check.json 2>/dev/null; then
        log "✓ Health check concluído com sucesso"
    else
        log "⚠ Health check falhou - sistema pode ter problemas"
    fi
else
    log "ℹ Comando openclaw não disponível - pulando health check"
fi

# Limpar sessões antigas (mais de 7 dias)
log "🧠 Limpando sessões antigas..."
OLDSESSIONS=$(find ~/.openclaw/agents/main/sessions/ -name "*.jsonl" -mtime +7 -delete -print 2>/dev/null | wc -l || echo 0)
log "✓ $OLDSESSIONS sessões antigas removidas"

# Verificar espaço em disco
log "💾 Verificando uso de disco..."
DISK_USAGE=$(df ~/.openclaw 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//' || echo 50)
log "ℹ Uso de disco: $DISK_USAGE%"

if [ "$DISK_USAGE" -gt 90 ]; then
    log "⚠️  ALERTA CRÍTICO: Uso de disco alto ($DISK_USAGE%)"
    log "💡 Recomendações: Limpar logs antigos ou mover backups"
elif [ "$DISK_USAGE" -gt 75 ]; then
    log "⚠️  ALERTA: Uso de disco acima de 75% ($DISK_USAGE%)"
fi

log "✅ Manutenção concluída com sucesso"

echo "✅ Manutenção concluída!"
echo "📊 Status: $(date)" > ~/.openclaw/logs/maintenance.last