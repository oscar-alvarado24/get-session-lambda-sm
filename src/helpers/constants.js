/**
 * Constantes de la aplicación
 */

const CONSTANTS = {
    ERROR_PREFIX: 'Error en',
    MSG_ERROR_PARAMS_NOT_VALID: 'Parámetros no válidos',
    MSG_ERROR_PROCESSING: 'Error procesando la solicitud',
    MSG_ERROR_EMAIL_MISSING: 'Falta parámetro email',
    SESSION: 'Session',
    SESSION_NOT_FOUND: 'Paciente no posee sesiones',
    GET_SESSION_FOR_EMAIL:'Get lastest session for patient with email: %s',
    DYNAMO_TABLE_NAME_ENVIROMET_NOT_FOUND: 'DYNAMO_TABLE_NAME environment variable is required',
    DYNAMO_REPOSITORY_INITIALIZED: 'Initializing DynamoRepository with table: %s',
    BASE_64: 'base64',
    UTF_8: 'utf8',
};

module.exports = CONSTANTS;