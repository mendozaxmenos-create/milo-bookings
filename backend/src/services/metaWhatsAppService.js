/**
 * Servicio para enviar mensajes usando Meta WhatsApp Business API
 */

export class MetaWhatsAppService {
  /**
   * Envía un mensaje de texto usando Meta WhatsApp Business API
   * 
   * @param {string} to - Número de teléfono del destinatario (formato: 5491123456789, sin +)
   * @param {string} text - Texto del mensaje
   * @returns {Promise<Object>} Respuesta de la API de Meta
   */
  static async sendMessage(to, text) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      const error = 'WhatsApp credentials not configured. Configure WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN';
      console.error(`[MetaWhatsApp] ${error}`);
      throw new Error(error);
    }

    // Normalizar número (eliminar + y espacios)
    const normalizedTo = to.replace(/[+\s]/g, '');

    try {
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedTo,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }

        const errorMessage = errorData.error?.message || errorText;
        console.error(`[MetaWhatsApp] Error enviando mensaje a ${normalizedTo}:`, errorMessage);
        
        throw new Error(`Failed to send message: ${errorMessage}`);
      }

      const result = await response.json();
      console.log(`[MetaWhatsApp] ✅ Mensaje enviado a ${normalizedTo}:`, result.messages?.[0]?.id);
      
      return result;
    } catch (error) {
      console.error(`[MetaWhatsApp] Error en sendMessage para ${normalizedTo}:`, error);
      throw error;
    }
  }

  /**
   * Envía un mensaje con plantilla (template)
   * 
   * @param {string} to - Número de teléfono del destinatario
   * @param {string} templateName - Nombre de la plantilla aprobada
   * @param {string} languageCode - Código de idioma (ej: 'es', 'en')
   * @param {Array} parameters - Parámetros de la plantilla (opcional)
   * @returns {Promise<Object>} Respuesta de la API de Meta
   */
  static async sendTemplateMessage(to, templateName, languageCode = 'es', parameters = []) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp credentials not configured');
    }

    const normalizedTo = to.replace(/[+\s]/g, '');

    try {
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      
      const body = {
        messaging_product: 'whatsapp',
        to: normalizedTo,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };

      // Agregar componentes si hay parámetros
      if (parameters.length > 0) {
        body.template.components = [
          {
            type: 'body',
            parameters: parameters.map(param => ({
              type: typeof param === 'string' ? 'text' : param.type || 'text',
              text: param.text || param,
            })),
          },
        ];
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send template message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[MetaWhatsApp] Error enviando plantilla a ${normalizedTo}:`, error);
      throw error;
    }
  }

  /**
   * Verifica que las credenciales estén configuradas
   * 
   * @returns {boolean} True si las credenciales están configuradas
   */
  static isConfigured() {
    return !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
  }

  /**
   * Obtiene información del número de teléfono configurado
   * 
   * @returns {Promise<Object>} Información del número
   */
  static async getPhoneNumberInfo() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp credentials not configured');
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}?access_token=${accessToken}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get phone number info: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[MetaWhatsApp] Error obteniendo información del número:', error);
      throw error;
    }
  }
}

