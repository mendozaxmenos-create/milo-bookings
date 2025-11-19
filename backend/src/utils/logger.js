/**
 * Logger estructurado para Milo Bookings
 * Utiliza diferentes niveles de log según el entorno
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_LEVEL_NAMES = {
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.DEBUG]: 'DEBUG',
};

// Determinar nivel de log según entorno
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL?.toUpperCase() || (env === 'production' ? 'INFO' : 'DEBUG');
  return LOG_LEVELS[logLevel] ?? LOG_LEVELS.INFO;
};

const CURRENT_LOG_LEVEL = getLogLevel();

/**
 * Formatea un log entry
 */
function formatLogEntry(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: LOG_LEVEL_NAMES[level],
    message,
    ...meta,
  };

  // En producción, retornar JSON para mejor parsing
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(logEntry);
  }

  // En desarrollo, formato más legible
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${LOG_LEVEL_NAMES[level]}] ${message}${metaStr}`;
}

/**
 * Logger principal
 */
class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  _log(level, message, meta = {}) {
    if (level > CURRENT_LOG_LEVEL) {
      return; // No loggear si está por encima del nivel configurado
    }

    const fullMessage = this.prefix ? `[${this.prefix}] ${message}` : message;
    const logOutput = formatLogEntry(level, fullMessage, meta);

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(logOutput);
        break;
      case LOG_LEVELS.WARN:
        console.warn(logOutput);
        break;
      case LOG_LEVELS.INFO:
        console.log(logOutput);
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(logOutput);
        break;
    }
  }

  error(message, meta = {}) {
    this._log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this._log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this._log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this._log(LOG_LEVELS.DEBUG, message, meta);
  }

  /**
   * Logger para contexto específico (API, Bot, etc.)
   */
  child(prefix) {
    return new Logger(prefix);
  }
}

// Logger global
export const logger = new Logger();

// Loggers especializados
export const apiLogger = logger.child('API');
export const botLogger = logger.child('Bot');
export const dbLogger = logger.child('DB');
export const authLogger = logger.child('Auth');
export const paymentLogger = logger.child('Payment');

export default logger;

