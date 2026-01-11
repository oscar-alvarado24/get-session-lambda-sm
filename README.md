# Get Session Lambda

Descripción
-----------
Get Session Lambda es una función AWS Lambda que devuelve la última sesión registrada de un paciente (por email). Recibe el email del paciente cifrado y responde con los datos de la última sesión; algunos campos sensibles se devuelven cifrados para proteger la información.

Arquitectura y flujo
--------------------
- La Lambda recibe un evento HTTP (API Gateway) con un body JSON: `{ "email": "<email_encriptado>" }`.
- Desencripta el email usando AES-256-GCM con una `SECRET_KEY` en Base64 (URL-safe output).
- Consulta DynamoDB (tabla configurada por `DYNAMO_TABLE_NAME`) para obtener la última sesión del paciente.
- Devuelve la sesión (campos sensibles cifrados) o un error con el código HTTP apropiado.

Requisitos
----------
- Node.js (>= 14.x recomendado)
- Dependencias instaladas vía `npm install` (revisa `package.json`).
- Variables de entorno obligatorias:
  - `SECRET_KEY`: clave simétrica en Base64 (32 bytes -> 256 bits). Usada para AES-256-GCM.
  - `DYNAMO_TABLE_NAME`: nombre de la tabla DynamoDB donde están las sesiones.
  - `AWS_REGION`: región AWS donde se ejecuta la Lambda (opcional, por defecto `us-east-1`).

Cómo generar `SECRET_KEY`
-------------------------
Genera una clave segura (una sola vez) y guárdala en un secret manager o Parameter Store. Ejemplo en Node.js:

```js
// Generar SECRET_KEY (ejecutar localmente una vez)
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log(secret);
```

IMPORTANTE: la clave debe ser la representación base64 de 32 bytes (256 bits).

Instalación
-----------
1. Clona o copia el proyecto.
2. Instala dependencias:

```bash
npm install
```

3. Empaqueta para Lambda (opcional): el repositorio contiene `get-session-lambda.zip` listo para subir, o crea uno con:

```bash
zip -r get-session-lambda.zip index.js node_modules src package.json
```

Uso (API)
---------
Endpoint: configurado a través de API Gateway que invoque la Lambda (POST). 

Request
- Método: POST
- Body: JSON

Ejemplo de petición:

```json
{
  "email": "<EMAIL_CIFRADO_URLSAFE>"
}
```

Respuestas comunes
- 200 OK: devuelve la última sesión (JSON). Algunos campos vienen cifrados (email, ip, country, latitude, longitude).
- 400 Bad Request: falta body, JSON inválido, o email no proporcionado.
- 404 Not Found: paciente no tiene sesiones registradas.
- 500 Internal Server Error: error interno de procesamiento.

Ejemplo de respuesta 200 (simplificada):

```json
{
  "email": "<cifrado>",
  "connectionTime": "2024-01-01T12:34:56Z",
  "ip": "<cifrado>",
  "city": "Ciudad Ejemplo",
  "timezone": "-03:00",
  "country": "<cifrado>",
  "coordinates": {
    "latitude": "<cifrado>",
    "longitude": "<cifrado>"
  }
}
```

Qué campos se cifran
--------------------
En la respuesta, los siguientes campos vienen cifrados con el mismo esquema URL-safe base64:
- `email`
- `ip`
- `country`
- `coordinates.latitude`
- `coordinates.longitude`

Ejemplo: cómo cifrar el email (compatible con `src/helpers/crypto.js`)
--------------------------------------------------------------------
Este snippet en Node.js muestra cómo cifrar un email para enviarlo a la Lambda. El algoritmo es AES-256-GCM con IV de 12 bytes; el formato final es: base64(url-safe) de [IV || CIPHERTEXT || AUTH_TAG].

```js
const crypto = require('crypto');
const SECRET_KEY = process.env.SECRET_KEY; // base64 de 32 bytes
const key = Buffer.from(SECRET_KEY, 'base64');

function encryptEmail(email) {
  const iv = crypto.randomBytes(12); // 12 bytes para GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(email, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, encrypted, authTag]).toString('base64');
  // URL-safe
  return combined.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Uso
// console.log(encryptEmail('user@example.com')) -> valor a usar en { "email": "..." }
```

Despliegue en AWS Lambda (pasos mínimos)
----------------------------------------
1. Crear una función Lambda (Node.js 14/16/18).
2. Subir `get-session-lambda.zip` o subir el código desde el repositorio.
3. Establecer variables de entorno en la configuración de la función: `SECRET_KEY`, `DYNAMO_TABLE_NAME`, `AWS_REGION`.
4. Configurar un trigger HTTP (API Gateway) que invoque la Lambda (POST).
5. Ajustar timeout (ej. 10s) y memoria según necesidad.
6. Probar con una petición POST usando el email cifrado.

Permisos IAM mínimos
--------------------
La función necesita permisos para:
- Leer la tabla DynamoDB (accion: `dynamodb:Query` sobre la tabla indicada).
- Escribir logs en CloudWatch (`logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`).

Ejemplo de policy (JSON) - ajustar Resource ARN:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:Query"],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

Manejo de errores y mensajes
----------------------------
El proyecto centraliza mensajes en `src/helpers/constants.js`. Los errores se manejan retornando objetos con `statusCode` y mensajes:
- `MSG_ERROR_EMAIL_MISSING` -> 400
- `SESSION_NOT_FOUND` -> 404
- `MSG_ERROR_PROCESSING` -> 500

Pruebas locales rápidas
-----------------------
Puedes simular la invocación localmente con Node.js creando un pequeño script que importe el handler y llame a `handler({ body: JSON.stringify({ email: '<cifrado>' }) }, {})`.

Licencia
--------
Este proyecto incluye el archivo `LICENSE` (MIT).

Troubleshooting (errores comunes)
--------------------------------
- "SECRET_KEY environment variable is required": no definiste `SECRET_KEY` o no está disponible para la Lambda.
- "SECRET_KEY must be a valid base64 string": la clave no es Base64 válido.
- "Datos muy cortos" o errores de desencriptado: el token enviado está corrupto o incompleto (se espera IV(12) + data + authTag(16)).

Archivos clave (referencia rápida)
---------------------------------
- `index.js` — handler principal.
- `src/helpers/crypto.js` — lógica de cifrado/descifrado (AES-256-GCM, salida URL-safe base64).
- `src/services/sessionService.js` — orquesta desencriptado, validación y formateo de respuesta.
- `src/repository/dynamoRepository.js` — consulta a DynamoDB.

Checklist pre-despliegue
------------------------
- [ ] `SECRET_KEY` generada y almacenada de forma segura.
- [ ] `DYNAMO_TABLE_NAME` configurado.
- [ ] IAM con permisos mínimos asignados a la Lambda.

Contacto
--------
Para dudas o soporte, abre un issue en el repositorio o contacta al equipo responsable del proyecto.
