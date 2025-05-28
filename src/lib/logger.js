/**
 * Système de logs centralisé pour l'application
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

const LOG_COLORS = {
  ERROR: '🔴',
  WARN: '🟡',
  INFO: '🔵',
  DEBUG: '⚪'
}

class Logger {
  constructor(context = 'APP') {
    this.context = context
    this.level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG')
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level]
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const emoji = LOG_COLORS[level]
    const prefix = `${emoji} [${timestamp}] [${this.context}] [${level}]`
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`
    }
    
    return `${prefix} ${message}`
  }

  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message, data))
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, data))
    }
  }

  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      console.info(this.formatMessage('INFO', message, data))
    }
  }

  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      console.debug(this.formatMessage('DEBUG', message, data))
    }
  }

  // Méthodes spécialisées pour l'API
  apiRequest(method, endpoint, userId = null) {
    this.info(`API Request: ${method} ${endpoint}`, { userId })
  }

  apiResponse(method, endpoint, status, responseTime = null) {
    const level = status >= 400 ? 'ERROR' : 'INFO'
    this[level.toLowerCase()](`API Response: ${method} ${endpoint} - ${status}`, { responseTime })
  }

  apiError(method, endpoint, error) {
    this.error(`API Error: ${method} ${endpoint}`, {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
  }

  // Méthodes pour la base de données
  dbQuery(query, params = null) {
    this.debug(`DB Query: ${query}`, params)
  }

  dbError(query, error) {
    this.error(`DB Error: ${query}`, {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
  }

  // Méthodes pour l'authentification
  authSuccess(userId, method = 'JWT') {
    this.info(`Auth Success: User ${userId} authenticated via ${method}`)
  }

  authFailure(reason, details = null) {
    this.warn(`Auth Failure: ${reason}`, details)
  }
}

// Créer des instances spécialisées
export const apiLogger = new Logger('API')
export const dbLogger = new Logger('DATABASE')
export const authLogger = new Logger('AUTH')
export const appLogger = new Logger('APP')

// Export par défaut
export default Logger 