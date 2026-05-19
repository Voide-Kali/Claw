import { logger } from '../lib/logger';

interface GatewayConfig {
  port: number;
  token?: string;
  mode: 'local' | 'tailscale';
}

export async function runGateway(config: GatewayConfig): Promise<void> {
  return new Promise(resolve => {
    logger.info(`Mock Gateway starting on port ${config.port} in ${config.mode} mode...`);

    setTimeout(() => {
      logger.info('Mock Gateway started successfully.');
      resolve();
    }, 1000);
  });
}
