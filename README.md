# OpenClaw

OpenClaw é uma plataforma de automação e IA para desenvolvimento e operações.

## Estrutura do Projeto

- `agents/` — Configurações de agentes e sessões
- `canvas/` — Interface web interativa (Voz)
- `completions/` — Scripts de autocompletar para shells
- `credentials/` — Credenciais e estados de autenticação
- `extensions/` — Extensões personalizadas
- `flows/` — Definições de fluxos de trabalho
- `identity/` — Identidade e autenticação do dispositivo
- `logs/` — Logs do sistema
- `memory/` — Sistema de memória
- `tasks/` — Gerenciamento de tarefas
- `workspace/` — Documentação e estado do workspace

## Começando

1. Configure seu ambiente: `openclaw onboard`
2. Inicie o dashboard: `openclaw dashboard`
3. Explore as funcionalidades disponíveis

## Desenvolvimento

Para contribuir ou modificar:

- Use `openclaw doctor` para verificar saúde do sistema
- Scripts de completion são gerados automaticamente em `completions/`
- Extensões ficam em `extensions/` com estrutura padronizada

## Configuração de Ambiente

Crie um arquivo `.env.local` copiando `.env.example` e preencha as variáveis sensíveis.
O arquivo `.env.local` já está listado em `.gitignore` e é carregado automaticamente em tempo de execução.

Exemplo:

```bash
cp .env.example .env.local
```

## Integração Contínua

Este projeto já inclui um fluxo de CI para GitHub Actions em `.github/workflows/ci.yml`.
O pipeline executa lint, type check e testes com cobertura em cada push ou pull request.

## Suporte

Para ajuda, use `openclaw --help` ou consulte a documentação em `workspace/`.
