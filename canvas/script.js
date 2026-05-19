(() => {
  /**
   * @typedef {Object} BridgeStatus
   * @property {boolean} helperReady
   * @property {boolean} hasIOS
   * @property {boolean} hasAndroid
   */
  /**
   * @typedef {Object} ButtonConfig
   * @property {string} id
   * @property {string} action
   * @property {string} component
   */

  const logEl = document.getElementById('log');
  const statusEl = document.getElementById('status');
  const modeEl = document.getElementById('desktop-mode');

  /**
   * @param {unknown} msg
   */
  const log = msg => {
    if (logEl) logEl.textContent = String(msg);
  };

  const connectionNoteEl = document.getElementById('connection-note');
  const retryBtn = document.getElementById('btn-retry');

  const hasIOS = () =>
    !!(
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.openclawCanvasA2UIAction
    );

  const hasAndroid = () =>
    !!(
      window.openclawCanvasA2UIAction &&
      typeof window.openclawCanvasA2UIAction.postMessage === 'function'
    );

  const hasHelper = () => typeof window.openclawSendUserAction === 'function';

  /**
   * @param {string} message
   */
  const setConnectionNote = message => {
    if (connectionNoteEl) connectionNoteEl.textContent = message;
  };

  /**
   * @param {boolean} helperReady
   */
  const updateStatus = helperReady => {
    if (!statusEl || !modeEl) return;
    statusEl.textContent = '';
    statusEl.appendChild(document.createTextNode('Bridge: '));
    const bridgeStatus = document.createElement('span');
    bridgeStatus.className = helperReady ? 'ok' : 'bad';
    bridgeStatus.textContent = helperReady ? 'ready' : 'missing';
    statusEl.appendChild(bridgeStatus);
    statusEl.appendChild(
      document.createTextNode(
        ` · iOS=${hasIOS() ? 'yes' : 'no'} · Android=${hasAndroid() ? 'yes' : 'no'}`
      )
    );
    modeEl.textContent = helperReady
      ? 'Modo: nativo'
      : 'Modo: simulação de desktop (botões ainda funcionam localmente)';
    setConnectionNote(
      helperReady
        ? 'A ponte nativa está conectada. Use os botões para enviar ações reais.'
        : 'A ponte não está disponível. Os botões funcionam em modo desktop local. Clique em Retry para tentar novamente.'
    );
    if (retryBtn) {
      retryBtn.disabled = helperReady;
      retryBtn.classList.toggle('disabled', helperReady);
    }
  };

  let retryCount = 0;
  const MAX_RETRIES = 10;

  const checkBridge = () => {
    const ready = hasHelper();
    updateStatus(ready);
    if (!ready && retryCount < MAX_RETRIES) {
      retryCount++;
      window.setTimeout(checkBridge, 1500);
    } else if (!ready) {
      log('Bridge connection retry limit reached. Please reload the page.');
    }
  };

  const handleRetry = () => {
    if (!hasHelper()) {
      log('Tentando reconectar à ponte...');
      checkBridge();
    }
  };

  if (retryBtn) {
    retryBtn.addEventListener('click', handleRetry);
  }

  checkBridge();

  // Create abort controller for proper cleanup
  const eventController = new AbortController();

  const onStatus = ev => {
    const d = (ev && ev.detail) || {};
    log(`Action status: id=${d.id || '?'} ok=${!!d.ok}${d.error ? ` error=${d.error}` : ''}`);
  };

  // Use AbortSignal for automatic cleanup
  window.addEventListener('openclaw:a2ui-action-status', onStatus, {
    signal: eventController.signal
  });

  // Cleanup resources on page unload/navigation
  window.addEventListener(
    'unload',
    () => {
      eventController.abort();
    },
    { once: true }
  );

  /**
   * Send an action to the native bridge or simulate locally.
   * @param {string} name
   * @param {string} sourceComponentId
   */
  function send(name, sourceComponentId) {
    if (!hasHelper()) {
      // Fallback for desktop testing
      console.info(`Action sent: ${name} from ${sourceComponentId}`);
      log(`Simulated action: ${name} (desktop mode)`);
      return;
    }
    try {
      const sendUserAction = window.openclawSendUserAction;
      if (typeof sendUserAction !== 'function') {
        throw new Error('openclawSendUserAction is not a function');
      }
      const ok = sendUserAction({
        name,
        surfaceId: 'main',
        sourceComponentId,
        context: { t: Date.now() }
      });
      log(ok ? `Sent action: ${name}` : `Failed to send action: ${name}`);
    } catch (error) {
      log(`Error sending action ${name}: ${error.message}`);
    }
  }

  // Setup button event listeners with DRY pattern
  const buttonConfig = [
    { id: 'btn-hello', action: 'hello', component: 'demo.hello' },
    { id: 'btn-time', action: 'time', component: 'demo.time' },
    { id: 'btn-photo', action: 'photo', component: 'demo.photo' },
    { id: 'btn-dalek', action: 'dalek', component: 'demo.dalek' }
  ];

  buttonConfig.forEach(({ id, action, component }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => send(action, component), {
        signal: eventController.signal
      });
    }
  });
})();
