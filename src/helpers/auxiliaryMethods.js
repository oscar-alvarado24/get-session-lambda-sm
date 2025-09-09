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
    validateInput
};