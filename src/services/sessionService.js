/**
 * Servicio de Session
 * Equivalente a SessionService.java
 */

const CONSTANTS = require('../helpers/constants');
const { formatMessage, handleError } = require('../helpers/auxiliaryMethods');
const Session = require('../model/session');

class SessionService {
    constructor(dynamoRepository) {
        this.dynamoRepository = dynamoRepository;
    }

    /**
     * Guarda una sesión completa
     * @param {string} email - Email del usuario
     * @param {string} ip - Dirección IP
     * @returns {Promise<Session>} - Mensaje de resultado
     */
    async getSession(email) {
        try {
            return await this.dynamoRepository.getSession(email);
        } catch (error) {
            console.error(`ERROR: ${error.constructor.name} - ${error.message}`);
            console.error('Stack trace: ', error.stack);
            throw handleError(CONSTANTS.GET_SESSION_SERVICE_METHOD, error);
        }
    }
}

module.exports = SessionService;