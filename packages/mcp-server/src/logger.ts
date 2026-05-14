import winston from 'winston';

export interface LoggerConfig {
  level: string;
  format?: 'json' | 'simple';
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
}

export class Logger {
  private logger: winston.Logger;

  constructor(configOrLogger: LoggerConfig | { existingLogger: winston.Logger }) {
    if ('existingLogger' in configOrLogger) {
      this.logger = configOrLogger.existingLogger;
      return;
    }
    const config = configOrLogger;
    const formats = [];
    
    // Add timestamp to all logs
    formats.push(winston.format.timestamp());
    
    // Add error stack traces
    formats.push(winston.format.errors({ stack: true }));
    
    // Choose output format
    if (config.format === 'json') {
      formats.push(winston.format.json());
    } else {
      formats.push(winston.format.simple());
    }

    const transports: winston.transport[] = [];

    // Console transport
    if (config.enableConsole !== false) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} [${level}]: ${message}${metaStr}`;
            })
          ),
        })
      );
    }

    // File transport
    if (config.enableFile && config.filePath) {
      transports.push(
        new winston.transports.File({
          filename: config.filePath,
          format: winston.format.json(),
        })
      );
    }

    this.logger = winston.createLogger({
      level: config.level,
      format: winston.format.combine(...formats),
      transports,
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.logger.error(message, { error: error.message, stack: error.stack });
    } else if (error) {
      this.logger.error(message, { error });
    } else {
      this.logger.error(message);
    }
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  child(defaultMeta: any): Logger {
    return new Logger({ existingLogger: this.logger.child(defaultMeta) });
  }
}