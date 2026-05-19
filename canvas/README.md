# Voz Canvas

Esta página é uma tela de teste interativa para o OpenClaw.

## Como usar

- Abra `canvas/index.html` em um ambiente OpenClaw mobile para usar a ponte nativa.
- No desktop, a página entra em modo de simulação e ainda registra ações localmente.
- Os botões enviam ações de teste chamadas `hello`, `time`, `photo` e `dalek`.

## Comportamento

- `Bridge: ready` significa que a página está conectada a `window.openclawSendUserAction`.
- `Modo: simulação de desktop` significa que o app não encontrou a ponte e está testando localmente.
- Use o botão `Retry bridge` para tentar reconectar à ponte nativa se necessário.

## Arquivos

- `index.html` — Estrutura da página
- `styles.css` — Estilos visuais
- `script.js` — Lógica de detecção de ponte e envio de ações
