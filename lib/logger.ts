import winston from 'winston';
import { envConfig } from './env';

export const logger = winston.createLogger({
  level: envConfig.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'openclaw-web-search' },
  transports: [
    new winston.transports.File({
      filename: envConfig.LOG_FILE,
      level: 'info',
      handleExceptions: true
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  ],
  exitOnError: false
});
