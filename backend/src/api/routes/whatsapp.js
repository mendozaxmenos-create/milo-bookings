/**
 * Rutas para WhatsApp usando Meta WhatsApp Business API
 * 
 * Este endpoint maneja:
 * - Verificación del webhook de Meta
 * - Recepción de mensajes entrantes
 * - Procesamiento de mensajes con el bot
 */

import express from 'express';
import { BotService } from '../../services/botService.js';
import { SessionService } from '../../services/sessionService.js';
import { ClientService } from '../../services/clientService.js';
import { MetaWhatsAppService } from '../../services/metaWhatsAppService.js';

const router = express.Router();

// Middleware para parsear JSON
router.use(express.json());

/**
 * GET /api/whatsapp/webhook
 * Verificación del webhook por Meta
 */
router.get('/webhook', async (req, res) => {
  try {
    const mode = req.query['hub.mode'] || req.query['hub_mode'];
    const token = req.query['hub.verify_token'] || req.query['hub_verify_token'];
    const challenge = req.query['hub.challenge'] || req.query['hub_challenge'];

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    console.log('[Webhook] Verificación recibida:', { 
      mode, 
      token: token?.substring(0, 10) + '...', 
      challenge: challenge?.substring(0, 20) 
    });

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Webhook] ✅ Webhook verificado correctamente');
      return res.status(200).send(challenge);
    } else {
      console.warn('[Webhook] ❌ Verificación fallida:', { 
        modeMatch: mode === 'subscribe', 
        tokenMatch: token === verifyToken,
        hasVerifyToken: !!verifyToken
      });
      return res.status(403).send('Forbidden');
    }
  } catch (error) {
    console.error('[Webhook] Error en verificación:', error);
    return res.status(500).send('Internal Server Error');
  }
});

/**
 * POST /api/whatsapp/webhook
 * Recibe mensajes entrantes de Meta
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Responder inmediatamente a Meta (dentro de 20 segundos)
    res.status(200).json({ success: true });

    // Verificar que es una notificación de WhatsApp Business
    if (body.object !== 'whatsapp_business_account') {
      console.log('[Webhook] No es una notificación de WhatsApp Business');
      return;
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      console.log('[Webhook] No hay cambios en la notificación');
      return;
    }

    // Procesar mensajes entrantes
    if (value.messages) {
      for (const message of value.messages) {
        await processIncomingMessage(message, value.metadata);
      }
    }

    // Procesar estados de mensajes (delivered, read, etc.)
    if (value.statuses) {
      for (const status of value.statuses) {
        console.log('[Webhook] Status update:', {
          id: status.id,
          status: status.status,
          timestamp: status.timestamp
        });
        // Aquí puedes manejar estados si es necesario
      }
    }

  } catch (error) {
    console.error('[Webhook] Error procesando webhook:', error);
    // Ya respondimos 200, así que solo logueamos el error
  }
});

/**
 * Procesa un mensaje entrante
 */
async function processIncomingMessage(message, metadata) {
  try {
    const from = message.from; // Número del usuario (formato: 5491123456789)
    const messageText = message.text?.body || '';
    const messageId = message.id;

    console.log(`[Webhook] 📩 Mensaje recibido de ${from}: "${messageText}"`);

    // Detectar slug del comercio desde el mensaje
    // El slug puede venir en el primer mensaje cuando el usuario hace clic en el shortlink
    let clientSlug = null;
    
    // Intentar extraer el slug del mensaje
    // Si el mensaje es solo el slug (ej: "monpatisserie"), ese es el comercio
    const slugMatch = messageText.trim().match(/^([a-z0-9-]+)$/i);
    if (slugMatch) {
      clientSlug = slugMatch[1].toLowerCase();
    }

    // Obtener o crear sesión
    let session;
    if (clientSlug) {
      // Si hay slug, crear/actualizar sesión con ese comercio
      session = await SessionService.getOrCreateSession(from, clientSlug);
    } else {
      // Si no hay slug, buscar sesión activa
      session = await SessionService.getActiveSession(from);
      
      if (!session) {
        // No hay sesión activa y no hay slug, preguntar al usuario
        await MetaWhatsAppService.sendMessage(
          from,
          '👋 ¡Hola! ¿Con qué comercio querés continuar? Por favor, envía el nombre o usa el link que te compartieron.'
        );
        return;
      }
      
      clientSlug = session.client_slug;
    }

    // Obtener configuración del comercio
    const client = await ClientService.getBySlug(clientSlug);
    if (!client || client.status !== 'active') {
      await MetaWhatsAppService.sendMessage(
        from,
        '❌ Lo siento, ese comercio no está disponible en este momento.'
      );
      return;
    }

    // Procesar mensaje con el bot
    await BotService.processMessage({
      userPhone: from,
      messageText,
      clientSlug,
      session,
      client,
      messageId,
    });

  } catch (error) {
    console.error('[Webhook] Error procesando mensaje:', error);
    
    // No intentar enviar mensaje de error si:
    // 1. El número no está en la lista de destinatarios (modo de prueba)
    // 2. El token de acceso expiró
    // 3. Cualquier error relacionado con la API de Meta
    const errorMessage = error.message || '';
    const shouldSkipErrorResponse = 
      errorMessage.includes('Recipient phone number not in allowed list') ||
      errorMessage.includes('Session has expired') ||
      errorMessage.includes('Error validating access token') ||
      errorMessage.includes('OAuthException');
    
    if (shouldSkipErrorResponse) {
      if (errorMessage.includes('Recipient phone number not in allowed list')) {
        console.warn('[Webhook] ⚠️  Número no está en la lista de destinatarios permitidos (modo de prueba).');
        console.warn('[Webhook] 💡 En producción, todos los números pueden recibir mensajes automáticamente.');
        console.warn('[Webhook] 📝 Para desarrollo, agrega el número en Meta: https://developers.facebook.com/apps/');
      } else if (errorMessage.includes('Session has expired') || errorMessage.includes('Error validating access token')) {
        console.error('[Webhook] ❌ Token de acceso expirado. Genera uno nuevo en Meta for Developers.');
        console.error('[Webhook] 💡 Para producción, configura un token de larga duración.');
      }
      return; // No intentar enviar mensaje de error
    }
    
    // Para otros errores, intentar enviar mensaje de error al usuario
    try {
      await MetaWhatsAppService.sendMessage(
        message.from,
        '❌ Ocurrió un error. Por favor, intenta de nuevo más tarde.'
      );
    } catch (sendError) {
      console.error('[Webhook] Error enviando mensaje de error:', sendError);
    }
  }
}

export default router;

