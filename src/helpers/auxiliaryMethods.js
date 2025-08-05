/**
 * Métodos auxiliares
 */

const CONSTANTS = require('./constants');

/**
 * Formatea un mensaje con parámetros
 * @param {string} template - Template del mensaje con %s
 * @param {string} value - Valor a reemplazar
 * @returns {string} - Mensaje formateado
 */
function formatMessage(template, value) {
    return template.replace('%s', value);
}

/**
 * Maneja errores de manera consistente
 * @param {string} operation - Nombre de la operación
 * @param {Error} error - Error ocurrido
 * @returns {Error} - Error formateado
 */
function handleError(operation, error) {
    const prefix = CONSTANTS.ERROR_PREFIX;
    let messageOfError= error.message;
    if (messageOfError.startsWith(prefix)) {
        const colonIndex = messageOfError.indexOf(':');
        if (colonIndex !== -1) {
            messageOfError = messageOfError.substring(colonIndex + 1).trim();
        }
    }
    
    const errorMessage = CONSTANTS.ERROR_PREFIX + ` ${operation}: ${messageOfError}`;
    
    console.error(errorMessage);
    if (error.stack) {
        console.error('Stack trace:', error.stack);
    }
    return new Error(errorMessage);
}

 /**
 * Validate input data
 * @param {string} email - patient email to validate
 * @returns {Object} - validation result
 */
function validateInput(email) {
    const errors = [];
    console.log('iniciando validación de entrada');
    // Verificar que email sea string antes de usar trim()
    if (!email || typeof email !== 'string' || email.trim() === '') {
        errors.push('Email es requerido');
    }
        
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}


module.exports = {
    formatMessage,
    handleError,
    validateInput
};