/**
 * Endpoint para manejar shortlinks
 * 
 * Redirige a wa.me con el slug del comercio
 * 
 * GET /api/shortlink?slug=monpatisserie
 * o
 * GET /monpatisserie (rewrite desde vercel.json)
 */

import { ClientService } from '../../../backend/src/services/clientService.js';
import { ShortlinkAnalyticsService } from '../../../backend/src/services/shortlinkAnalyticsService.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener slug desde query params o desde la URL path (rewrite)
    let slug = req.query.slug;
    
    // Si no hay slug en query, intentar extraerlo de la URL
    if (!slug && req.url) {
      // El rewrite de Vercel puede pasar el slug en la URL
      // Ejemplo: /monpatisserie -> /api/shortlink
      // En este caso, necesitamos extraerlo del path original
      const pathMatch = req.url.match(/^\/([a-z0-9-]+)/);
      if (pathMatch) {
        slug = pathMatch[1];
      }
    }

    if (!slug) {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    // Verificar que el cliente existe
    const client = await ClientService.getBySlug(slug);

    if (!client || client.status !== 'active') {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comercio no encontrado</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Comercio no encontrado</h1>
            <p>El link que intentaste usar no está disponible.</p>
          </body>
        </html>
      `);
    }

    // Registrar acceso en analytics (no bloqueante)
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      const referer = req.headers['referer'] || req.headers['referrer'] || null;
      
      await ShortlinkAnalyticsService.trackAccess(client.id, slug, client.business_id, {
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
        referer,
      });
    } catch (analyticsError) {
      // No fallar si hay error en analytics, solo loguear
      console.error('[Shortlink] Error tracking analytics:', analyticsError);
    }

    // Obtener número de WhatsApp desde variables de entorno
    const whatsappNumber = process.env.WHATSAPP_NUMBER; // Formato: 5491123456789 (sin +)
    
    if (!whatsappNumber) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error de configuración</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Error de configuración</h1>
            <p>El sistema no está configurado correctamente.</p>
          </body>
        </html>
      `);
    }

    // Crear URL de WhatsApp con el slug como mensaje inicial
    // El slug se enviará como primer mensaje para identificar el comercio
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(slug)}`;

    // Redirigir a WhatsApp
    return res.redirect(301, whatsappUrl);
  } catch (error) {
    console.error('[Shortlink] Error:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>Ocurrió un error al procesar tu solicitud.</p>
        </body>
      </html>
    `);
  }
}

