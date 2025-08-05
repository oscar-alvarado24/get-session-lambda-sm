/**
 * Session model
 * Represents a patient session with details like email, connection time, IP address, city, timezone, country, and coordinates.
 */

class Session {
    constructor(email, connectionTime, ip, city, timezone, country, coordinates) {
        this.email = email;
        this.connectionTime = connectionTime;
        this.ip = ip;
        this.city = city;
        this.timezone = timezone;
        this.country = country;
        this.latitude = coordinates.latitude;
        this.longitude = coordinates.longitude;
    }

    /**
     * Crea una sesión desde un item de DynamoDB
     * @param {Object} dynamoItem - Item de DynamoDB
     * @returns {Session} - Instancia de Session
     */
    static fromDynamoItem(dynamoItem) {
        return new Session(
            dynamoItem.id,
            dynamoItem.connection_time,
            dynamoItem.ip,
            dynamoItem.city,
            dynamoItem.timezone,
            dynamoItem.country,
            {
                latitude: dynamoItem.latitude,
                longitude: dynamoItem.longitude
            }
        );
    }

    /**
     * Convierte la sesión a objeto plano
     * @returns {Object} - Objeto plano
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