import { envConfig } from '../lib/env';
import { logger } from '../lib/logger';
import { runGateway } from './gateway';

async function main() {
  logger.info('OpenClaw starting up...');
  logger.debug('Environment configuration loaded', envConfig);

  try {
    await runGateway({
      port: envConfig.GATEWAY_PORT,
      token: envConfig.GATEWAY_TOKEN,
      mode: envConfig.GATEWAY_MODE
    });
    logger.info(`OpenClaw Gateway running in ${envConfig.GATEWAY_MODE} mode on port ${envConfig.GATEWAY_PORT}`);
  } catch (error) {
    logger.error('Failed to start OpenClaw Gateway', error);
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unhandled error in main application', error);
  process.exit(1);
});
