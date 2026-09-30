/**
 * Convierte los errores de validación de class-validator (NestJS) en un string legible.
 *
 * NestJS ValidationPipe devuelve errores con esta estructura:
 * ```json
 * {
 *   "statusCode": 400,
 *   "message": [
 *     { "property": "valor", "constraints": { "isNumber": "valor debe ser un número" } }
 *   ],
 *   "error": "Bad Request"
 * }
 * ```
 *
 * @param messages - Array de ValidationError objects o un string plano
 * @returns String formateado para mostrar al usuario
 */
export const formatValidationErrors = (messages: any): string => {
  if (!messages) return 'Error desconocido';

  // Si ya es un string, devolverlo directamente
  if (typeof messages === 'string') return messages;

  // Si es un array de ValidationError objects (NestJS class-validator)
  if (Array.isArray(messages)) {
    let result = '';
    messages.forEach((element: any) => {
      if (element.constraints) {
        const constraints = Object.values(element.constraints).join(', ');
        result += `${element.property}: ${constraints}\n`;
      } else if (typeof element === 'string') {
        result += `${element}\n`;
      }
    });
    return result.trim() || 'Error de validación';
  }

  // Si es un objeto con message interno
  if (messages.message) {
    return formatValidationErrors(messages.message);
  }

  return String(messages);
};
