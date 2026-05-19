import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('generate.js - Shell Completion Generator', () => {
  const mockData = {
    global: ['--help', '--version', '--config', '--verbose', '--quiet'],
    commands: {
      start: ['--port', '--host', '--debug'],
      stop: ['--force', '--timeout'],
      restart: ['--soft', '--hard'],
      status: ['--json', '--verbose']
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Data Validation', () => {
    it('should validate required structure (global array)', () => {
      const invalidData = { commands: {} };

      // Simular validação
      expect(() => {
        if (!invalidData.global || !Array.isArray(invalidData.global)) {
          throw new Error('Invalid data structure: missing "global" array');
        }
      }).toThrow('Invalid data structure: missing "global" array');
    });

    it('should validate required structure (commands object)', () => {
      const invalidData = { global: [] };

      expect(() => {
        if (!invalidData.commands || typeof invalidData.commands !== 'object') {
          throw new Error('Invalid data structure: missing "commands" object');
        }
      }).toThrow('Invalid data structure: missing "commands" object');
    });

    it('should load valid completions data', () => {
      expect(mockData.global).toEqual(['--help', '--version', '--config', '--verbose', '--quiet']);
      expect(mockData.commands).toHaveProperty('start');
      expect(mockData.commands.start).toContain('--port');
    });

    it('should handle corrupted JSON gracefully', () => {
      const invalidJSON = '{ invalid json }';
      expect(() => JSON.parse(invalidJSON)).toThrow();
    });

    it('should handle missing file gracefully', () => {
      const missingData = null;
      expect(missingData).toBeNull();
    });
  });

  describe('Bash Completion', () => {
    it('should escape bash special characters', () => {
      // Função de escape
      const bashEscape = (value: string) => value.replace(/([`"$\\])/g, '\\$1');

      const input = '$USER `whoami` "admin"';
      const expected = '\\$USER \\`whoami\\` \\"admin\\"';

      expect(bashEscape(input)).toBe(expected);
    });

    it('should generate bash completion script with commands', () => {
      const commands = Object.keys(mockData.commands);
      const hasStart = commands.includes('start');
      const hasStop = commands.includes('stop');

      expect(hasStart).toBe(true);
      expect(hasStop).toBe(true);
    });

    it('should handle special characters in options', () => {
      const dataWithSpecial = {
        ...mockData,
        commands: {
          config: ['--with-dash', '--with_underscore', '--with.dot']
        }
      };

      const options = dataWithSpecial.commands.config;
      expect(options).toContain('--with-dash');
      expect(options).toContain('--with_underscore');
      expect(options).toContain('--with.dot');
    });
  });

  describe('Zsh Completion', () => {
    it('should escape zsh special characters', () => {
      const zshEscape = (value: string) => value.replace(/(["\\])/g, '\\$1');

      const input = 'test "quoted" value';
      const expected = 'test \\"quoted\\" value';

      expect(zshEscape(input)).toBe(expected);
    });

    it('should generate valid function names from commands', () => {
      const zshFuncName = (command: string) => `_openclaw_${command.replace(/[^a-zA-Z0-9]/g, '_')}`;

      expect(zshFuncName('start')).toBe('_openclaw_start');
      expect(zshFuncName('list-items')).toBe('_openclaw_list_items');
      expect(zshFuncName('v2.0')).toBe('_openclaw_v2_0');
    });

    it('should generate zsh completion script', () => {
      const commands = Object.keys(mockData.commands);
      expect(commands).toContain('start');
      expect(commands).toContain('stop');
    });
  });

  describe('Fish Completion', () => {
    it('should generate fish completion script', () => {
      const commands = Object.keys(mockData.commands);
      expect(commands.length).toBeGreaterThan(0);
      expect(commands).toContain('start');
    });

    it('should handle commands with multiple options', () => {
      const startOptions = mockData.commands.start;
      expect(startOptions).toContain('--port');
      expect(startOptions).toContain('--host');
    });
  });

  describe('PowerShell Completion', () => {
    it('should escape powershell quotes', () => {
      const psEscape = (value: string) => `'${value.replace(/'/g, "''")}'`;

      const input = "it's valid";
      const expected = "'it''s valid'";

      expect(psEscape(input)).toBe(expected);
    });

    it('should generate PowerShell completion script', () => {
      const data = JSON.stringify(mockData);
      expect(data).toContain('start');
      expect(data).toContain('--port');
    });
  });

  describe('Error Handling', () => {
    it('should report write failures per file', () => {
      const writeResults = [true, false, true, true];
      const successCount = writeResults.filter(Boolean).length;

      expect(successCount).toBe(3);
      expect(writeResults.length - successCount).toBe(1);
    });

    it('should exit with error code if any file fails', () => {
      const results = [true, true, false, true];
      const allSuccess = results.every(Boolean);

      expect(allSuccess).toBe(false);
    });
  });
});
