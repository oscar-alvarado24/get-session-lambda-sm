/**
 * Servicio de Session
 * Equivalente a SessionService.java
 */

const CONSTANTS = require('../helpers/constants');
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
        return await this.dynamoRepository.getSession(email);
    }
}

module.exports = SessionService;