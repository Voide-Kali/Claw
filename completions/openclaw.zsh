#compdef openclaw

_openclaw_root() {
  _arguments -C \
    "1: :_values 'command' completion[completion] setup[setup] onboard[onboard] configure[configure] config[config] backup[backup] doctor[doctor] dashboard[dashboard] reset[reset] uninstall[uninstall] message[message] mcp[mcp] agent[agent] agents[agents] status[status] health[health] sessions[sessions] tasks[tasks] acp[acp] gateway[gateway] daemon[daemon] logs[logs] system[system] models[models] infer[infer] approvals[approvals] exec-policy[exec-policy] nodes[nodes] devices[devices] node[node] sandbox[sandbox] tui[tui] cron[cron] dns[dns] docs[docs] proxy[proxy] hooks[hooks] webhooks[webhooks] qr[qr] clawbot[clawbot] browser[browser] memory[memory] pairing[pairing] plugins[plugins] channels[channels] directory[directory] security[security] secrets[secrets] skills[skills] update[update]" \
    "*::arg:->args" \
    "completion" \
    "setup" \
    "onboard" \
    "configure" \
    "config" \
    "backup" \
    "doctor" \
    "dashboard" \
    "reset" \
    "uninstall" \
    "message" \
    "mcp" \
    "agent" \
    "agents" \
    "status" \
    "health" \
    "sessions" \
    "tasks" \
    "acp" \
    "gateway" \
    "daemon" \
    "logs" \
    "system" \
    "models" \
    "infer" \
    "approvals" \
    "exec-policy" \
    "nodes" \
    "devices" \
    "node" \
    "sandbox" \
    "tui" \
    "cron" \
    "dns" \
    "docs" \
    "proxy" \
    "hooks" \
    "webhooks" \
    "qr" \
    "clawbot" \
    "browser" \
    "memory" \
    "pairing" \
    "plugins" \
    "channels" \
    "directory" \
    "security" \
    "secrets" \
    "skills" \
    "update" \
    "-V" \
    "--container" \
    "--dev" \
    "--profile" \
    "--log-level" \
    "--no-color"

  case $state in
    (args)
      case $line[1] in
        (completion) _openclaw_completion ;;
        (setup) _openclaw_setup ;;
        (onboard) _openclaw_onboard ;;
        (configure) _openclaw_configure ;;
        (config) _openclaw_config ;;
        (backup) _openclaw_backup ;;
        (doctor) _openclaw_doctor ;;
        (dashboard) _openclaw_dashboard ;;
        (reset) _openclaw_reset ;;
        (uninstall) _openclaw_uninstall ;;
        (message) _openclaw_message ;;
        (mcp) _openclaw_mcp ;;
        (agent) _openclaw_agent ;;
        (agents) _openclaw_agents ;;
        (status) _openclaw_status ;;
        (health) _openclaw_health ;;
        (sessions) _openclaw_sessions ;;
        (tasks) _openclaw_tasks ;;
        (acp) _openclaw_acp ;;
        (gateway) _openclaw_gateway ;;
        (daemon) _openclaw_daemon ;;
        (logs) _openclaw_logs ;;
        (system) _openclaw_system ;;
        (models) _openclaw_models ;;
        (infer) _openclaw_infer ;;
        (approvals) _openclaw_approvals ;;
        (exec-policy) _openclaw_exec_policy ;;
        (nodes) _openclaw_nodes ;;
        (devices) _openclaw_devices ;;
        (node) _openclaw_node ;;
        (sandbox) _openclaw_sandbox ;;
        (tui) _openclaw_tui ;;
        (cron) _openclaw_cron ;;
        (dns) _openclaw_dns ;;
        (docs) _openclaw_docs ;;
        (proxy) _openclaw_proxy ;;
        (hooks) _openclaw_hooks ;;
        (webhooks) _openclaw_webhooks ;;
        (qr) _openclaw_qr ;;
        (clawbot) _openclaw_clawbot ;;
        (browser) _openclaw_browser ;;
        (memory) _openclaw_memory ;;
        (pairing) _openclaw_pairing ;;
        (plugins) _openclaw_plugins ;;
        (channels) _openclaw_channels ;;
        (directory) _openclaw_directory ;;
        (security) _openclaw_security ;;
        (secrets) _openclaw_secrets ;;
        (skills) _openclaw_skills ;;
        (update) _openclaw_update ;;
      esac
      ;;
  esac
}

_openclaw_completion() {
  _arguments -C \
    "-s" \
    "-i" \
    "--write-state" \
    "-y" \

}

_openclaw_setup() {
  _arguments -C \
    "--workspace" \
    "--wizard" \
    "--non-interactive" \
    "--mode" \
    "--remote-url" \
    "--remote-token" \

}

_openclaw_onboard() {
  _arguments -C \
    "--workspace" \
    "--reset" \
    "--reset-scope" \
    "--non-interactive" \
    "--accept-risk" \
    "--flow" \
    "--mode" \
    "--auth-choice" \
    "--token-provider" \
    "--token" \
    "--token-profile-id" \
    "--token-expires-in" \
    "--secret-input-mode" \
    "--cloudflare-ai-gateway-account-id" \
    "--cloudflare-ai-gateway-gateway-id" \
    "--alibaba-model-studio-api-key" \
    "--anthropic-api-key" \
    "--arceeai-api-key" \
    "--openrouter-api-key" \
    "--byteplus-api-key" \
    "--chutes-api-key" \
    "--cloudflare-ai-gateway-api-key" \
    "--deepseek-api-key" \
    "--fal-api-key" \
    "--fireworks-api-key" \
    "--gemini-api-key" \
    "--huggingface-api-key" \
    "--kilocode-api-key" \
    "--kimi-code-api-key" \
    "--litellm-api-key" \
    "--lmstudio-api-key" \
    "--minimax-api-key" \
    "--mistral-api-key" \
    "--moonshot-api-key" \
    "--openai-api-key" \
    "--opencode-zen-api-key" \
    "--opencode-go-api-key" \
    "--qianfan-api-key" \
    "--modelstudio-standard-api-key-cn" \
    "--modelstudio-standard-api-key" \
    "--modelstudio-api-key-cn" \
    "--modelstudio-api-key" \
    "--runway-api-key" \
    "--stepfun-api-key" \
    "--synthetic-api-key" \
    "--together-api-key" \
    "--venice-api-key" \
    "--ai-gateway-api-key" \
    "--volcengine-api-key" \
    "--vydra-api-key" \
    "--xai-api-key" \
    "--xiaomi-api-key" \
    "--zai-api-key" \
    "--custom-base-url" \
    "--custom-api-key" \
    "--custom-model-id" \
    "--custom-provider-id" \
    "--custom-compatibility" \
    "--gateway-port" \
    "--gateway-bind" \
    "--gateway-auth" \
    "--gateway-token" \
    "--gateway-token-ref-env" \
    "--gateway-password" \
    "--remote-url" \
    "--remote-token" \
    "--tailscale" \
    "--tailscale-reset-on-exit" \
    "--install-daemon" \
    "--no-install-daemon" \
    "--skip-daemon" \
    "--daemon-runtime" \
    "--skip-channels" \
    "--skip-skills" \
    "--skip-search" \
    "--skip-health" \
    "--skip-ui" \
    "--node-manager" \
    "--json" \

}

_openclaw_configure() {
  _arguments -C \
    "--section" \

}

_openclaw_config() {
  _arguments -C \
    "get" \
    "set" \
    "unset" \
    "file" \
    "schema" \
    "validate" \
    "--section" \

}

_openclaw_backup() {
  _arguments -C \
    "create" \
    "verify" \

}

_openclaw_doctor() {
  _arguments -C \
    "--no-workspace-suggestions" \
    "--yes" \
    "--repair" \
    "--fix" \
    "--force" \
    "--non-interactive" \
    "--generate-gateway-token" \
    "--deep" \

}

_openclaw_dashboard() {
  _arguments -C \
    "--no-open" \

}

_openclaw_reset() {
  _arguments -C \
    "--scope" \
    "--yes" \
    "--non-interactive" \
    "--dry-run" \

}

_openclaw_uninstall() {
  _arguments -C \
    "--service" \
    "--state" \
    "--workspace" \
    "--app" \
    "--all" \
    "--yes" \
    "--non-interactive" \
    "--dry-run" \

}

_openclaw_message() {
  _arguments -C \
    "send" \
    "broadcast" \
    "poll" \
    "react" \
    "reactions" \
    "read" \
    "edit" \
    "delete" \
    "pin" \
    "unpin" \
    "pins" \
    "permissions" \
    "search" \
    "thread" \
    "emoji" \
    "sticker" \
    "role" \
    "channel" \
    "member" \
    "voice" \
    "event" \
    "timeout" \
    "kick" \
    "ban" \

}

_openclaw_mcp() {
  _arguments -C \
    "serve" \
    "list" \
    "show" \
    "set" \
    "unset" \

}

_openclaw_agent() {
  _arguments -C \
    "-m" \
    "-t" \
    "--session-id" \
    "--agent" \
    "--thinking" \
    "--verbose" \
    "--channel" \
    "--reply-to" \
    "--reply-channel" \
    "--reply-account" \
    "--local" \
    "--deliver" \
    "--json" \
    "--timeout" \

}

_openclaw_agents() {
  _arguments -C \
    "list" \
    "bindings" \
    "bind" \
    "unbind" \
    "add" \
    "set-identity" \
    "delete" \

}

_openclaw_status() {
  _arguments -C \
    "--json" \
    "--all" \
    "--usage" \
    "--deep" \
    "--timeout" \
    "--verbose" \
    "--debug" \

}

_openclaw_health() {
  _arguments -C \
    "--json" \
    "--timeout" \
    "--verbose" \
    "--debug" \

}

_openclaw_sessions() {
  _arguments -C \
    "cleanup" \
    "--json" \
    "--verbose" \
    "--store" \
    "--agent" \
    "--all-agents" \
    "--active" \

}

_openclaw_tasks() {
  _arguments -C \
    "list" \
    "audit" \
    "maintenance" \
    "show" \
    "notify" \
    "cancel" \
    "flow" \
    "--json" \
    "--runtime" \
    "--status" \

}

_openclaw_acp() {
  _arguments -C \
    "client" \
    "--url" \
    "--token" \
    "--token-file" \
    "--password" \
    "--password-file" \
    "--session" \
    "--session-label" \
    "--require-existing" \
    "--reset-session" \
    "--no-prefix-cwd" \
    "--provenance" \
    "-v" \

}

_openclaw_gateway() {
  _arguments -C \
    "run" \
    "status" \
    "install" \
    "uninstall" \
    "start" \
    "stop" \
    "restart" \
    "call" \
    "usage-cost" \
    "health" \
    "probe" \
    "discover" \
    "--port" \
    "--bind" \
    "--token" \
    "--auth" \
    "--password" \
    "--password-file" \
    "--tailscale" \
    "--tailscale-reset-on-exit" \
    "--allow-unconfigured" \
    "--dev" \
    "--reset" \
    "--force" \
    "--verbose" \
    "--cli-backend-logs" \
    "--claude-cli-logs" \
    "--ws-log" \
    "--compact" \
    "--raw-stream" \
    "--raw-stream-path" \

}

_openclaw_daemon() {
  _arguments -C \
    "status" \
    "install" \
    "uninstall" \
    "start" \
    "stop" \
    "restart" \

}

_openclaw_logs() {
  _arguments -C \
    "--limit" \
    "--max-bytes" \
    "--follow" \
    "--interval" \
    "--json" \
    "--plain" \
    "--no-color" \
    "--local-time" \
    "--url" \
    "--token" \
    "--timeout" \
    "--expect-final" \

}

_openclaw_system() {
  _arguments -C \
    "event" \
    "heartbeat" \
    "presence" \

}

_openclaw_models() {
  _arguments -C \
    "list" \
    "status" \
    "set" \
    "set-image" \
    "aliases" \
    "fallbacks" \
    "image-fallbacks" \
    "scan" \
    "auth" \
    "--status-json" \
    "--status-plain" \
    "--agent" \

}

_openclaw_infer() {
  _arguments -C \
    "list" \
    "inspect" \
    "model" \
    "image" \
    "audio" \
    "tts" \
    "video" \
    "web" \
    "embedding" \

}

_openclaw_approvals() {
  _arguments -C \
    "get" \
    "set" \
    "allowlist" \

}

_openclaw_exec_policy() {
  _arguments -C \
    "show" \
    "preset" \
    "set" \

}

_openclaw_nodes() {
  _arguments -C \
    "status" \
    "describe" \
    "list" \
    "pending" \
    "approve" \
    "reject" \
    "rename" \
    "invoke" \
    "notify" \
    "push" \
    "canvas" \
    "camera" \
    "screen" \
    "location" \

}

_openclaw_devices() {
  _arguments -C \
    "list" \
    "remove" \
    "clear" \
    "approve" \
    "reject" \
    "rotate" \
    "revoke" \

}

_openclaw_node() {
  _arguments -C \
    "run" \
    "status" \
    "install" \
    "uninstall" \
    "stop" \
    "restart" \

}

_openclaw_sandbox() {
  _arguments -C \
    "list" \
    "recreate" \
    "explain" \

}

_openclaw_tui() {
  _arguments -C \
    "--url" \
    "--token" \
    "--password" \
    "--session" \
    "--deliver" \
    "--thinking" \
    "--message" \
    "--timeout-ms" \
    "--history-limit" \

}

_openclaw_cron() {
  _arguments -C \
    "status" \
    "list" \
    "add" \
    "rm" \
    "enable" \
    "disable" \
    "runs" \
    "run" \
    "edit" \

}

_openclaw_dns() {
  _arguments -C \
    "setup" \

}

_openclaw_docs() {
  _arguments -C \

}

_openclaw_proxy() {
  _arguments -C \
    "start" \
    "run" \
    "coverage" \
    "sessions" \
    "query" \
    "blob" \
    "purge" \

}

_openclaw_hooks() {
  _arguments -C \
    "list" \
    "info" \
    "check" \
    "enable" \
    "disable" \
    "install" \
    "update" \

}

_openclaw_webhooks() {
  _arguments -C \
    "gmail" \

}

_openclaw_qr() {
  _arguments -C \
    "--remote" \
    "--url" \
    "--public-url" \
    "--token" \
    "--password" \
    "--setup-code-only" \
    "--no-ascii" \
    "--json" \

}

_openclaw_clawbot() {
  _arguments -C \
    "qr" \

}

_openclaw_browser() {
  _arguments -C \
    "status" \
    "start" \
    "stop" \
    "reset-profile" \
    "tabs" \
    "tab" \
    "open" \
    "focus" \
    "close" \
    "profiles" \
    "create-profile" \
    "delete-profile" \
    "screenshot" \
    "snapshot" \
    "navigate" \
    "resize" \
    "click" \
    "type" \
    "press" \
    "hover" \
    "scrollintoview" \
    "drag" \
    "select" \
    "upload" \
    "waitfordownload" \
    "download" \
    "dialog" \
    "fill" \
    "wait" \
    "evaluate" \
    "console" \
    "pdf" \
    "responsebody" \
    "highlight" \
    "errors" \
    "requests" \
    "trace" \
    "cookies" \
    "storage" \
    "set" \
    "--browser-profile" \
    "--json" \
    "--url" \
    "--token" \
    "--timeout" \
    "--expect-final" \

}

_openclaw_memory() {
  _arguments -C \
    "status" \
    "index" \
    "search" \
    "promote" \
    "promote-explain" \
    "rem-harness" \
    "rem-backfill" \

}

_openclaw_pairing() {
  _arguments -C \
    "list" \
    "approve" \

}

_openclaw_plugins() {
  _arguments -C \
    "list" \
    "inspect" \
    "enable" \
    "disable" \
    "uninstall" \
    "install" \
    "update" \
    "doctor" \
    "marketplace" \

}

_openclaw_channels() {
  _arguments -C \
    "list" \
    "status" \
    "capabilities" \
    "resolve" \
    "logs" \
    "add" \
    "remove" \
    "login" \
    "logout" \

}

_openclaw_directory() {
  _arguments -C \
    "self" \
    "peers" \
    "groups" \

}

_openclaw_security() {
  _arguments -C \
    "audit" \

}

_openclaw_secrets() {
  _arguments -C \
    "reload" \
    "audit" \
    "configure" \
    "apply" \

}

_openclaw_skills() {
  _arguments -C \
    "search" \
    "install" \
    "update" \
    "list" \
    "info" \
    "check" \

}

_openclaw_update() {
  _arguments -C \
    "wizard" \
    "status" \
    "--json" \
    "--no-restart" \
    "--dry-run" \
    "--channel" \
    "--tag" \
    "--timeout" \
    "--yes" \

}

_openclaw_root
