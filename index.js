/**
 * Lambda Handler
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const DynamoRepository = require('./src/repository/dynamoRepository');
const SessionService = require('./src/services/sessionService');
const CONSTANTS = require('./src/helpers/constants');
const NotFoundError = require('./src/exception/notFoundError');
const { validateInput } = require('./src/helpers/auxiliaryMethods');

const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
});
const dynamoRepository = new DynamoRepository(dynamoClient);
const sessionService = new SessionService(dynamoRepository);
exports.handler = async (event, context) => {
    try {
        // Extraer el cuerpo del evento de API Gateway
        const body = event.body;
        console.log('Raw event body:', body);

        // Parsear el cuerpo JSON
        const input = JSON.parse(body);

        const inputValidation = validateInput(input.email);

        // Validar parámetros
        if (inputValidation.isValid) {

            const session = await sessionService.getSession(input.email);

            return {
                statusCode: 200,
                body: session.toJSON()
            };
        }

        const errorMessage = inputValidation.isValid
            ? CONSTANTS.MSG_ERROR_PARAMS_NOT_VALID
            : inputValidation.errors.join(', ');
        return {
            statusCode: 400,
            body: JSON.stringify({ error: errorMessage })
        };

    } catch (error) {
        if (error instanceof NotFoundError) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Paciente no posee sesiones' })
            };
        } else {
            console.error('Error procesando la solicitud', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: CONSTANTS.MSG_ERROR_PROCESSING })
            };
        }
    }
};