const Session = require('../model/session');
const CryptoService = require('../helpers/crypto');
const { validateInput } = require('../helpers/auxiliaryMethods');
const CONSTANTS = require('../helpers/constants');
const NotFoundError = require('../exception/notFoundError');


class SessionService {
    constructor(dynamoRepository) {
        this.dynamoRepository = dynamoRepository;
        this.cryptoService = new CryptoService();
    }

    /**
     * Guarda una sesión completa
     * @param {string} email - Email del usuario
     * @param {string} ip - Dirección IP
     * @returns {Promise<Session>} - Mensaje de resultado
     */
    async getSession(emailEncripted) {
        try {
            console.log(`email encriptado recibido ${emailEncripted}`);
            if (!emailEncripted) {
                return {
                    success: false,
                    statusCode: 400,
                    message: CONSTANTS.MSG_ERROR_EMAIL_MISSING
                }
            }
            const email = await this.cryptoService.decrypt(emailEncripted);
            console.log('email', email);
            const emailValidation = validateInput(email);
            if (emailValidation.isValid) {
                const session = await this.dynamoRepository.getSession(email);
                console.log('session', session);
                const response = {
                    success: true,
                    session: {
                        email: await this.cryptoService.encrypt(session.email),
                        connectionTime: session.connectionTime,
                        ip: await this.cryptoService.encrypt(session.ip.toString()),
                        city: session.city,
                        timezone: session.timezone,
                        country: await this.cryptoService.encrypt(session.country),
                        latitude: await this.cryptoService.encrypt(session.latitude.toString()),
                        longitude: await this.cryptoService.encrypt(session.longitude.toString())
                    }
                }
                console.log('response', response);
                return response
            } else {
                return {
                    success: false,
                    message: emailValidation.errors,
                    statusCode: 400
                }
            }
        }
        catch (error) {
            if (error instanceof NotFoundError) {
                return {
                    success: false,
                    message: error.message,
                    statusCode: 404
                };
            } else {
                console.error(error.message);
                return {
                    success: false,
                    message: CONSTANTS.MSG_ERROR_PROCESSING,
                    statusCode: 500
                };
            }
        }
    }
}

module.exports = SessionService;