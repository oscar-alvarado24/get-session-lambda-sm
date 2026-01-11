/**
 * Session model
 * Represents a patient session with details like email, connection time, IP address, city, timezone, country, and coordinates.
 */

class Session {
    constructor(email, connectionTime, ip, city, timezone, country, coordinates) {
        // Validaciones en el constructor
        if (!email) throw new Error('Email is required');
        if (!connectionTime) throw new Error('Connection time is required');
        if (!ip) throw new Error('IP is required');
        if (!coordinates) throw new Error('Coordinates are required');

        this.email = email;
        this.connectionTime = connectionTime;
        this.ip = ip;
        this.city = city || '';
        this.timezone = timezone || '';
        this.country = country || '';
        this.latitude = coordinates.latitude || 0;
        this.longitude = coordinates.longitude || 0;
    }

    /**
     * Create a sesion from DynamoDB item
     * @param {Object} dynamoItem - Item obtained from DynamoDB
     * @returns {Session} - Session instance
     * @throws {Error} If the required fields are not present in the dynamoItem
     */
    static fromDynamoItem(dynamoItem) {
        // Validate that the item exists
        if (!dynamoItem) {
            throw new Error('DynamoDB item is null or undefined');
        }

        // Validate required fields
        const requiredFields = ['id', 'connection_time', 'ip'];
        const missingFields = requiredFields.filter(field => !dynamoItem[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields in DynamoDB item: ${missingFields.join(', ')}`);
        }

        // Create instance with default values for optional fields
        return new Session(
            dynamoItem.id,
            dynamoItem.connection_time,
            dynamoItem.ip,
            dynamoItem.city || '',
            dynamoItem.timezone || '',
            dynamoItem.country || '',
            {
                latitude: dynamoItem.latitude ?? 0,
                longitude: dynamoItem.longitude ?? 0
            }
        );
    }

    /**
     * Convert the session to a plain object
     * @returns {Object} - Plain object
     */
    toJSON() {
        return {
            email: this.email,
            connectionTime: this.connectionTime,
            ip: this.ip,
            city: this.city,
            timezone: this.timezone,
            country: this.country,
            coordinates: {
                latitude: this.latitude,
                longitude: this.longitude
            }
        };
    }
}

module.exports = Session;