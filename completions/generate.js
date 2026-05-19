#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} CompletionData
 * @property {string[]} global
 * @property {Object.<string, string[]>} commands
 */

/**
 * @type {CompletionData}
 */
let data;
try {
  const dataPath = path.join(__dirname, 'completions-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  data = JSON.parse(rawData);

  // Validate required structure
  if (!data.global || !Array.isArray(data.global)) {
    throw new Error('Invalid data structure: missing or invalid "global" array');
  }
  if (!data.commands || typeof data.commands !== 'object') {
    throw new Error('Invalid data structure: missing or invalid "commands" object');
  }
} catch (error) {
  console.error('❌ Error loading completions data:', error.message);
  process.exit(1);
}

/**
 * Escape a string for safe use in bash completion code.
 * @param {string} value
 * @returns {string}
 */
function bashEscape(value) {
  return value.replace(/([`"$\\])/g, '\\$1');
}

/**
 * Build the bash completion script from completion metadata.
 * @returns {string}
 */
function generateBash() {
  let output = `_openclaw_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    opts="${data.global.map(bashEscape).join(' ')}"

    case "\${prev}" in\n`;

  for (const [cmd, opts] of Object.entries(data.commands)) {
    output += `      ${cmd})
        opts="${opts.map(bashEscape).join(' ')}"
        COMPREPLY=( $(compgen -W "${opts.map(bashEscape).join(' ')}" -- \${cur}) )
        return 0
        ;;
`;
  }

  output += `    esac

    if [[ \${cur} == -* ]] ; then
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi

    COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
}

complete -F _openclaw_completion openclaw
`;

  return output;
}

/**
 * Convert a command into a valid zsh function name.
 * @param {string} command
 * @returns {string}
 */
function zshFuncName(command) {
  return `_openclaw_${command.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Escape special characters for zsh string interpolation.
 * @param {string} value
 * @returns {string}
 */
function zshEscape(value) {
  return value.replace(/(["\\])/g, '\\$1');
}

function generateZsh() {
  const commands = Object.keys(data.commands);
  const formattedCommands = commands.map(cmd => `${cmd}[${cmd}]`).join(' ');
  const formattedGlobalOptions = data.global.map(opt => `"${zshEscape(opt)}"`).join(' \\\n    ');

  let output = '#compdef openclaw\n\n';
  output += `_openclaw_root() {\n  _arguments -C \\\n    "1: :_values 'command' ${formattedCommands}" \\\n    "*::arg:->args"`;

  if (formattedGlobalOptions) {
    output += ` \\\n    ${formattedGlobalOptions}`;
  }

  output += `\n\n  case $state in\n    (args)\n      case $line[1] in\n`;

  for (const cmd of commands) {
    output += `        (${cmd}) ${zshFuncName(cmd)} ;;
`;
  }

  output += `      esac\n      ;;
  esac\n}\n\n`;

  for (const [cmd, opts] of Object.entries(data.commands)) {
    const funcName = zshFuncName(cmd);
    const formattedOpts = opts.map(opt => `    "${opt.replace(/"/g, '\\"')}" \\\n`).join('');

    output += `${funcName}() {\n  _arguments -C \\\n${formattedOpts}\n}\n\n`;
  }

  output += `_openclaw_root\n`;
  return output;
}

function generateFish() {
  const rootArgs = data.global.map(arg => arg).join(' ');
  let output = '# fish completion for openclaw\n\n';
  output += `complete -c openclaw -n "__fish_use_subcommand" -a "${rootArgs}" -d 'OpenClaw command or global option'\n\n`;

  for (const [cmd, opts] of Object.entries(data.commands)) {
    const condition = `__fish_seen_subcommand_from ${cmd}`;
    const args = opts.join(' ');
    output += `complete -c openclaw -n "${condition}" -a "${args}" -d 'Options for ${cmd}'\n`;
  }

  return output;
}

function generatePowershell() {
  const topCompletions = data.global.map(item => `'${item.replace(/'/g, "''")}'`).join(', ');
  let output = 'Register-ArgumentCompleter -Native -CommandName openclaw -ScriptBlock {\n';
  output += '    param($wordToComplete, $commandAst, $cursorPosition)\n\n';
  output += '    $commandElements = $commandAst.CommandElements\n';
  output += '    $commandPath = ""\n\n';
  output += '    for ($i = 1; $i -lt $commandElements.Count; $i++) {\n';
  output += '        $element = $commandElements[$i].Extent.Text\n';
  output += "        if ($element -like '-*') { break }\n";
  output +=
    "        if ($i -eq $commandElements.Count - 1 -and $wordToComplete -ne '') { break }\n";
  output += '        $commandPath += "$element "\n';
  output += '    }\n';
  output += '    $commandPath = $commandPath.Trim()\n\n';
  output += "    if ($commandPath -eq '') {\n";
  output += `        $completions = @(${topCompletions})\n`;
  output +=
    '        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {\n';
  output +=
    "            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)\n";
  output += '        }\n';
  output += '        return\n';
  output += '    }\n\n';

  for (const [cmd, opts] of Object.entries(data.commands)) {
    const escapedCmd = cmd.replace(/'/g, "''");
    const completions = opts.map(opt => `'${opt.replace(/'/g, "''")}'`).join(', ');
    output += `    if ($commandPath -eq '${escapedCmd}') {\n`;
    output += `        $completions = @(${completions})\n`;
    output +=
      '        $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {\n';
    output +=
      "            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)\n";
    output += '        }\n';
    output += '        return\n';
    output += '    }\n\n';
  }

  output += '}\n';
  return output;
}

/**
 * Persist a generated completion script to disk.
 * @param {string} filename
 * @param {string} content
 * @returns {boolean}
 */
function writeFile(filename, content) {
  try {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.info(`✓ Generated: ${filename}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to generate ${filename}:`, error.message);
    return false;
  }
}

// Generate all completion scripts
try {
  const results = [
    writeFile('openclaw.bash', generateBash()),
    writeFile('openclaw.zsh', generateZsh()),
    writeFile('openclaw.fish', generateFish()),
    writeFile('openclaw.ps1', generatePowershell())
  ];

  const successCount = results.filter(Boolean).length;
  console.info(`\n✅ Successfully generated ${successCount}/4 completion files`);

  if (successCount !== 4) {
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Fatal error during generation:', error.message);
  process.exit(1);
}
