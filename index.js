/**
 * Lambda Handler
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const DynamoRepository = require('./src/repository/dynamoRepository');
const SessionService = require('./src/services/sessionService');
const CONSTANTS = require('./src/helpers/constants');
const NotFoundError = require('./src/exception/notFoundError');


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
        console.log('emailEncripted', input.email);
        const response = await sessionService.getSession(input.email);
        
        console.log('response', response); 

        if (response.success) {
            return {
                statusCode: 200,
                body: response.session
            };
        } else {
            return {
                statusCode: response.statusCode,
                body: response.message
            };
        }
    } catch (error) {
        console.error('Error procesando la solicitud', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: CONSTANTS.MSG_ERROR_PROCESSING })
        };
    }
};