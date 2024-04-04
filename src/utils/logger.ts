import winston from 'winston'
import 'winston-daily-rotate-file'
import { resolve } from 'node:path'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, label, timestamp}) => `${timestamp} [${label}] ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: resolve('.', 'logs', `%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
