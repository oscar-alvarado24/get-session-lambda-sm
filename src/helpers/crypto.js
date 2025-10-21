const crypto = require('crypto');
const CONSTANTS = require('./constants');

class CryptoService {
  #secretKey;
  #algorithm = 'aes-256-gcm';

  constructor() {
    this.#secretKey = Buffer.from(process.env.SECRET_KEY, CONSTANTS.BASE_64);
    
    if (this.#secretKey.length !== 32) {
      throw new Error('La clave debe ser base64 de 32 bytes (256 bits)');
    }
  }

  async encrypt(data) {
    const iv = crypto.randomBytes(12);
    
    const cipher = crypto.createCipheriv(this.#algorithm, this.#secretKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data, CONSTANTS.UTF_8),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, encrypted, authTag]).toString(CONSTANTS.BASE_64);
  }

  async decrypt(encryptedData) {
     try {
      const combined = Buffer.from(encryptedData, CONSTANTS.BASE_64);
      
      const iv = combined.subarray(0, 12);
      const authTag = combined.subarray(combined.length - 16);
      const encrypted = combined.subarray(12, combined.length - 16);
      
      const decipher = crypto.createDecipheriv(this.#algorithm, this.#secretKey, iv);
      
      decipher.setAuthTag(authTag);
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString(CONSTANTS.UTF_8);
    } catch (error) {
      console.error('Error en descifrado:', error.message);
      throw new Error(`Error descifrando datos: ${error.message}`);
    }
  }
}

module.exports = CryptoService;