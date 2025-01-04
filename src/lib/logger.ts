// filepath: /c:/Users/kate/Documents/project/reloader-nextjs/src/lib/logger.ts
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      dirname: 'logs',
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

export default logger;