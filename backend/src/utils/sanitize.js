/**
 * Utilidades para sanitización de inputs
 * Previene XSS y otros ataques de inyección
 */

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {string} input - Input a sanitizar
 * @param {object} options - Opciones de sanitización
 * @returns {string} - String sanitizado
 */
export function sanitizeString(input, options = {}) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const {
    allowNewlines = false,
    allowSpaces = true,
    maxLength = null,
    trim = true,
  } = options;

  let sanitized = input;

  // Trim si está habilitado
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Remover caracteres de control excepto newlines si están permitidos
  if (allowNewlines) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  }

  // Remover espacios múltiples si no están permitidos
  if (!allowSpaces) {
    sanitized = sanitized.replace(/\s+/g, '');
  } else {
    // Normalizar espacios múltiples a un solo espacio
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  // Limitar longitud si está especificado
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitiza un nombre (permite letras, espacios, guiones y apóstrofes)
 * @param {string} name - Nombre a sanitizar
 * @returns {string} - Nombre sanitizado
 */
export function sanitizeName(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return sanitizeString(name, {
    allowNewlines: false,
    allowSpaces: true,
    trim: true,
  })
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/g, '') // Solo letras, espacios, guiones y apóstrofes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitiza un teléfono (solo números y caracteres permitidos)
 * @param {string} phone - Teléfono a sanitizar
 * @returns {string} - Teléfono sanitizado
 */
export function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remover todo excepto números, +, espacios y guiones
  return phone
    .replace(/[^\d+\s\-]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Sanitiza un email
 * @param {string} email - Email a sanitizar
 * @returns {string} - Email sanitizado
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w.@+-]/g, ''); // Solo caracteres alfanuméricos, puntos, @, +, -
}

/**
 * Sanitiza texto largo (descripciones, notas, etc.)
 * @param {string} text - Texto a sanitizar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto sanitizado
 */
export function sanitizeText(text, maxLength = null) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return sanitizeString(text, {
    allowNewlines: true,
    allowSpaces: true,
    trim: true,
    maxLength,
  });
}

/**
 * Sanitiza un objeto completo aplicando sanitización según el tipo de campo
 * @param {object} data - Objeto a sanitizar
 * @param {object} schema - Schema que define cómo sanitizar cada campo
 * @returns {object} - Objeto sanitizado
 */
export function sanitizeObject(data, schema = {}) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    if (value === null || value === undefined) {
      continue;
    }

    // Si hay un schema específico para este campo, usarlo
    if (schema[key]) {
      const fieldType = schema[key];
      switch (fieldType) {
        case 'name':
          sanitized[key] = sanitizeName(value);
          break;
        case 'phone':
          sanitized[key] = sanitizePhone(value);
          break;
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'text':
          sanitized[key] = sanitizeText(value);
          break;
        case 'string':
          sanitized[key] = sanitizeString(value);
          break;
        default:
          if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
          }
      }
    } else if (typeof value === 'string') {
      // Si no hay schema específico pero es string, aplicar sanitización básica
      sanitized[key] = sanitizeString(value);
    }
  }

  return sanitized;
}

/**
 * Previene inyección SQL removiendo caracteres peligrosos
 * Nota: Knex.js ya usa prepared statements, pero esto es una capa adicional
 * @param {string} input - Input a sanitizar
 * @returns {string} - Input sanitizado
 */
export function sanitizeSQL(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remover caracteres peligrosos para SQL
  return input
    .replace(/['";\\]/g, '') // Remover comillas y punto y coma
    .replace(/--/g, '') // Remover comentarios SQL
    .replace(/\/\*/g, '') // Remover inicio de comentarios multilínea
    .replace(/\*\//g, ''); // Remover fin de comentarios multilínea
}

