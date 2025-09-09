/**
 * Repository for handling DynamoDB operations related to sessions.
 */

const { DynamoDBDocumentClient, QueryCommand, } = require('@aws-sdk/lib-dynamodb');
const Session = require('../model/session');
const { handleError, formatMessage } = require('../helpers/auxiliaryMethods');
const CONSTANTS = require('../helpers/constants');
const NotFoundError  = require('../exception/notFoundError');
class DynamoRepository {
    constructor(dynamoClient) {
        this.docClient = DynamoDBDocumentClient.from(dynamoClient);
        this.tableName = process.env.DYNAMO_TABLE_NAME;

        if (!this.tableName) {
            throw new Error(CONSTANTS.DYNAMO_TABLE_NAME_ENVIROMET_NOT_FOUND);
        }

        console.log(formatMessage(CONSTANTS.DYNAMO_REPOSITORY_INITIALIZED, this.tableName));
    }

    /**
     * Get a last session by id
     * @param {string} sessionId - ID session (email)
     * @returns {Promise<Session>} - session find
     */
    async getSession(sessionId) {
        try {
            const session = await this.getLastestSession(sessionId);
            if (!session) {
                throw new NotFoundError(CONSTANTS.SESSION);
            }
            return Session.fromDynamoItem(session);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            } else {
                throw handleError(CONSTANTS.GET_SESSION_REPOSITORY, error);
            }
        }
    }

    /**
     * Get the last session for a patient
     * @param {string} sessionId - ID session (email)
     * @returns {Promise<Object|null>} - Session object or null if not found
     */
    async getLastestSession(sessionId) {
        try {
            console.log(formatMessage(CONSTANTS.GET_SESSION_FOR_EMAIL, sessionId));

            const params = {
                TableName: this.tableName,
                KeyConditionExpression: 'id = :pk',
                ExpressionAttributeValues: {
                    ':pk': sessionId
                },
                ScanIndexForward: false,
                Limit: 1
            };

            const result = await this.docClient.send(new QueryCommand(params));
            return result.Items && result.Items.length > 0 ? result.Items[0] : null;
        } catch (error) {
            console.error(CONSTANTS.ERROR_PREFIX + ` ${error.constructor.name}: ${error.message}`);
            throw new Error(error.message);
        }
    }

}

module.exports = DynamoRepository;