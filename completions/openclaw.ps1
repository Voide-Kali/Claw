Register-ArgumentCompleter -Native -CommandName openclaw -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)

    $commandElements = $commandAst.CommandElements
    $commandPath = ""

    for ($i = 1; $i -lt $commandElements.Count; $i++) {
        $element = $commandElements[$i].Extent.Text
        if ($element -like '-*') { break }
        if ($i -eq $commandElements.Count - 1 -and $wordToComplete -ne '') { break }
        $commandPath += "$element "
    }
    $commandPath = $commandPath.Trim()

    if ($commandPath -eq '') {
        $completions = @('completion', 'setup', 'onboard', 'configure', 'config', 'backup', 'doctor', 'dashboard', 'reset', 'uninstall', 'message', 'mcp', 'agent', 'agents', 'status', 'health', 'sessions', 'tasks', 'acp', 'gateway', 'daemon', 'logs', 'system', 'models', 'infer', 'approvals', 'exec-policy', 'nodes', 'devices', 'node', 'sandbox', 'tui', 'cron', 'dns', 'docs', 'proxy', 'hooks', 'webhooks', 'qr', 'clawbot', 'browser', 'memory', 'pairing', 'plugins', 'channels', 'directory', 'security', 'secrets', 'skills', 'update', '-V', '--container', '--dev', '--profile', '--log-level', '--no-color')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'completion') {
        $completions = @('-s', '-i', '--write-state', '-y')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'setup') {
        $completions = @('--workspace', '--wizard', '--non-interactive', '--mode', '--remote-url', '--remote-token')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'onboard') {
        $completions = @('--workspace', '--reset', '--reset-scope', '--non-interactive', '--accept-risk', '--flow', '--mode', '--auth-choice', '--token-provider', '--token', '--token-profile-id', '--token-expires-in', '--secret-input-mode', '--cloudflare-ai-gateway-account-id', '--cloudflare-ai-gateway-gateway-id', '--alibaba-model-studio-api-key', '--anthropic-api-key', '--arceeai-api-key', '--openrouter-api-key', '--byteplus-api-key', '--chutes-api-key', '--cloudflare-ai-gateway-api-key', '--deepseek-api-key', '--fal-api-key', '--fireworks-api-key', '--gemini-api-key', '--huggingface-api-key', '--kilocode-api-key', '--kimi-code-api-key', '--litellm-api-key', '--lmstudio-api-key', '--minimax-api-key', '--mistral-api-key', '--moonshot-api-key', '--openai-api-key', '--opencode-zen-api-key', '--opencode-go-api-key', '--qianfan-api-key', '--modelstudio-standard-api-key-cn', '--modelstudio-standard-api-key', '--modelstudio-api-key-cn', '--modelstudio-api-key', '--runway-api-key', '--stepfun-api-key', '--synthetic-api-key', '--together-api-key', '--venice-api-key', '--ai-gateway-api-key', '--volcengine-api-key', '--vydra-api-key', '--xai-api-key', '--xiaomi-api-key', '--zai-api-key', '--custom-base-url', '--custom-api-key', '--custom-model-id', '--custom-provider-id', '--custom-compatibility', '--gateway-port', '--gateway-bind', '--gateway-auth', '--gateway-token', '--gateway-token-ref-env', '--gateway-password', '--remote-url', '--remote-token', '--tailscale', '--tailscale-reset-on-exit', '--install-daemon', '--no-install-daemon', '--skip-daemon', '--daemon-runtime', '--skip-channels', '--skip-skills', '--skip-search', '--skip-health', '--skip-ui', '--node-manager', '--json')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'configure') {
        $completions = @('--section')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'config') {
        $completions = @('get', 'set', 'unset', 'file', 'schema', 'validate', '--section')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'backup') {
        $completions = @('create', 'verify')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'doctor') {
        $completions = @('--no-workspace-suggestions', '--yes', '--repair', '--fix', '--force', '--non-interactive', '--generate-gateway-token', '--deep')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'dashboard') {
        $completions = @('--no-open')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'reset') {
        $completions = @('--scope', '--yes', '--non-interactive', '--dry-run')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'uninstall') {
        $completions = @('--service', '--state', '--workspace', '--app', '--all', '--yes', '--non-interactive', '--dry-run')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'message') {
        $completions = @('send', 'broadcast', 'poll', 'react', 'reactions', 'read', 'edit', 'delete', 'pin', 'unpin', 'pins', 'permissions', 'search', 'thread', 'emoji', 'sticker', 'role', 'channel', 'member', 'voice', 'event', 'timeout', 'kick', 'ban')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'mcp') {
        $completions = @('serve', 'list', 'show', 'set', 'unset')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'agent') {
        $completions = @('-m', '-t', '--session-id', '--agent', '--thinking', '--verbose', '--channel', '--reply-to', '--reply-channel', '--reply-account', '--local', '--deliver', '--json', '--timeout')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'agents') {
        $completions = @('list', 'bindings', 'bind', 'unbind', 'add', 'set-identity', 'delete')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'status') {
        $completions = @('--json', '--all', '--usage', '--deep', '--timeout', '--verbose', '--debug')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'health') {
        $completions = @('--json', '--timeout', '--verbose', '--debug')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'sessions') {
        $completions = @('cleanup', '--json', '--verbose', '--store', '--agent', '--all-agents', '--active')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'tasks') {
        $completions = @('list', 'audit', 'maintenance', 'show', 'notify', 'cancel', 'flow', '--json', '--runtime', '--status')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'acp') {
        $completions = @('client', '--url', '--token', '--token-file', '--password', '--password-file', '--session', '--session-label', '--require-existing', '--reset-session', '--no-prefix-cwd', '--provenance', '-v')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'gateway') {
        $completions = @('run', 'status', 'install', 'uninstall', 'start', 'stop', 'restart', 'call', 'usage-cost', 'health', 'probe', 'discover', '--port', '--bind', '--token', '--auth', '--password', '--password-file', '--tailscale', '--tailscale-reset-on-exit', '--allow-unconfigured', '--dev', '--reset', '--force', '--verbose', '--cli-backend-logs', '--claude-cli-logs', '--ws-log', '--compact', '--raw-stream', '--raw-stream-path')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'daemon') {
        $completions = @('status', 'install', 'uninstall', 'start', 'stop', 'restart')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'logs') {
        $completions = @('--limit', '--max-bytes', '--follow', '--interval', '--json', '--plain', '--no-color', '--local-time', '--url', '--token', '--timeout', '--expect-final')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'system') {
        $completions = @('event', 'heartbeat', 'presence')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'models') {
        $completions = @('list', 'status', 'set', 'set-image', 'aliases', 'fallbacks', 'image-fallbacks', 'scan', 'auth', '--status-json', '--status-plain', '--agent')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'infer') {
        $completions = @('list', 'inspect', 'model', 'image', 'audio', 'tts', 'video', 'web', 'embedding')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'approvals') {
        $completions = @('get', 'set', 'allowlist')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'exec-policy') {
        $completions = @('show', 'preset', 'set')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'nodes') {
        $completions = @('status', 'describe', 'list', 'pending', 'approve', 'reject', 'rename', 'invoke', 'notify', 'push', 'canvas', 'camera', 'screen', 'location')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'devices') {
        $completions = @('list', 'remove', 'clear', 'approve', 'reject', 'rotate', 'revoke')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'node') {
        $completions = @('run', 'status', 'install', 'uninstall', 'stop', 'restart')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'sandbox') {
        $completions = @('list', 'recreate', 'explain')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'tui') {
        $completions = @('--url', '--token', '--password', '--session', '--deliver', '--thinking', '--message', '--timeout-ms', '--history-limit')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'cron') {
        $completions = @('status', 'list', 'add', 'rm', 'enable', 'disable', 'runs', 'run', 'edit')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'dns') {
        $completions = @('setup')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'docs') {
        $completions = @()
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'proxy') {
        $completions = @('start', 'run', 'coverage', 'sessions', 'query', 'blob', 'purge')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'hooks') {
        $completions = @('list', 'info', 'check', 'enable', 'disable', 'install', 'update')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'webhooks') {
        $completions = @('gmail')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'qr') {
        $completions = @('--remote', '--url', '--public-url', '--token', '--password', '--setup-code-only', '--no-ascii', '--json')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'clawbot') {
        $completions = @('qr')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'browser') {
        $completions = @('status', 'start', 'stop', 'reset-profile', 'tabs', 'tab', 'open', 'focus', 'close', 'profiles', 'create-profile', 'delete-profile', 'screenshot', 'snapshot', 'navigate', 'resize', 'click', 'type', 'press', 'hover', 'scrollintoview', 'drag', 'select', 'upload', 'waitfordownload', 'download', 'dialog', 'fill', 'wait', 'evaluate', 'console', 'pdf', 'responsebody', 'highlight', 'errors', 'requests', 'trace', 'cookies', 'storage', 'set', '--browser-profile', '--json', '--url', '--token', '--timeout', '--expect-final')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'memory') {
        $completions = @('status', 'index', 'search', 'promote', 'promote-explain', 'rem-harness', 'rem-backfill')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'pairing') {
        $completions = @('list', 'approve')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'plugins') {
        $completions = @('list', 'inspect', 'enable', 'disable', 'uninstall', 'install', 'update', 'doctor', 'marketplace')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'channels') {
        $completions = @('list', 'status', 'capabilities', 'resolve', 'logs', 'add', 'remove', 'login', 'logout')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'directory') {
        $completions = @('self', 'peers', 'groups')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'security') {
        $completions = @('audit')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'secrets') {
        $completions = @('reload', 'audit', 'configure', 'apply')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'skills') {
        $completions = @('search', 'install', 'update', 'list', 'info', 'check')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

    if ($commandPath -eq 'update') {
        $completions = @('wizard', 'status', '--json', '--no-restart', '--dry-run', '--channel', '--tag', '--timeout', '--yes')
        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
        }
        return
    }

}
