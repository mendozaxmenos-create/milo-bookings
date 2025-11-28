import express from 'express';
import { Business } from '../../../database/models/Business.js';
import { BusinessUser } from '../../../database/models/BusinessUser.js';
import { SystemConfig } from '../../../database/models/SystemConfig.js';
import { authenticateToken, requireSuperAdmin } from '../../utils/auth.js';
import { validateBusiness } from '../../utils/validators.js';
import { activeBots } from '../../index.js';
import { getQRCode } from '../../services/qrStorage.js';
import { BookingBot } from '../../bot/index.js';

const router = express.Router();

// Todas las rutas requieren autenticación y ser super admin
router.use(authenticateToken);
router.use(requireSuperAdmin);

/**
 * GET /api/admin/businesses
 * Listar todos los negocios
 */
router.get('/businesses', async (req, res) => {
  try {
    console.log('[Admin] Listando todos los negocios (incluyendo inactivos)');
    const businesses = await Business.list(1000, 0, true); // Incluir inactivos para super admin
    console.log(`[Admin] ✅ Encontrados ${businesses.length} negocios en la base de datos`);
    
    if (businesses.length === 0) {
      console.warn('[Admin] ⚠️ No se encontraron negocios en la base de datos');
      // Retornar array vacío explícitamente
      return res.json({ data: [] });
    }
    
    console.log('[Admin] Negocios encontrados:', businesses.map(b => ({ 
      id: b.id, 
      name: b.name, 
      is_active: b.is_active,
      whatsapp_number: b.whatsapp_number 
    })));
    
    // Agregar información de estado del bot para cada negocio
    console.log(`[Admin] 📊 Verificando estado de ${businesses.length} negocios...`);
    console.log(`[Admin] 📊 Bots activos en memoria: ${activeBots.size}`);
    console.log(`[Admin] 📊 IDs de bots activos:`, Array.from(activeBots.keys()));
    
    const businessesWithStatus = await Promise.all(
      businesses.map(async (business) => {
        try {
          const bot = activeBots.get(business.id);
          const qrData = getQRCode(business.id);
          
          console.log(`[Admin] 🔍 Negocio ${business.id}: bot=${!!bot}, qr=${!!qrData}`);
          
          let botStatus = 'not_initialized';
          if (bot) {
            try {
              // Verificar múltiples formas de determinar si el bot está autenticado
              const clientInfo = bot.client?.info;
              const clientState = bot.client?.info?.wid; // Estado del cliente
              const isAuthenticated = bot.client?.state === 'CONNECTED' || 
                                     bot.client?.state === 'OPENING' ||
                                     (clientInfo && clientInfo.wid);
              
              console.log(`[Admin] 🔍 Negocio ${business.id}: clientInfo=${!!clientInfo}, clientState=${bot.client?.state}, isAuthenticated=${!!isAuthenticated}`);
              
              if (clientInfo || isAuthenticated) {
                botStatus = 'authenticated';
                console.log(`[Admin] ✅ Negocio ${business.id}: Estado = authenticated`);
              } else if (qrData) {
                botStatus = 'waiting_qr';
                console.log(`[Admin] ⏳ Negocio ${business.id}: Estado = waiting_qr`);
              } else {
                // Si el bot existe pero no está autenticado y no hay QR, verificar si está en proceso de inicialización
                const isInitializing = bot.client && 
                                      bot.client.state !== 'DISCONNECTED' && 
                                      bot.client.state !== 'CLOSED';
                botStatus = isInitializing ? 'initializing' : 'waiting_qr';
                console.log(`[Admin] 🔄 Negocio ${business.id}: Estado = ${botStatus} (client state: ${bot.client?.state})`);
              }
            } catch (err) {
              console.warn(`[Admin] ⚠️ Error verificando estado del bot ${business.id}:`, err.message);
              botStatus = 'error';
            }
          } else if (qrData) {
            botStatus = 'waiting_qr';
            console.log(`[Admin] ⏳ Negocio ${business.id}: Estado = waiting_qr (sin bot en memoria)`);
          } else {
            console.log(`[Admin] ❌ Negocio ${business.id}: Estado = not_initialized`);
          }
          
          return {
            ...business,
            bot_status: botStatus,
            has_qr: !!qrData,
          };
        } catch (error) {
          console.error(`[Admin] Error procesando negocio ${business.id}:`, error);
          // Retornar negocio sin estado de bot si hay error
          return {
            ...business,
            bot_status: 'error',
            has_qr: false,
          };
        }
      })
    );
    
    console.log(`[Admin] ✅ Retornando ${businessesWithStatus.length} negocios con estado de bot`);
    console.log(`[Admin] IDs de negocios retornados:`, businessesWithStatus.map(b => b.id));
    res.json({ data: businessesWithStatus });
  } catch (error) {
    console.error('[Admin] ❌ Error listing businesses:', error);
    console.error('[Admin] Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/admin/businesses
 * Crear un nuevo negocio
 */
router.post('/businesses', async (req, res) => {
  try {
    console.log('[Admin] POST /businesses - Creando nuevo negocio');
    console.log('[Admin] Datos recibidos:', {
      name: req.body.name,
      whatsapp_number: req.body.whatsapp_number,
      owner_phone: req.body.owner_phone,
      is_active: req.body.is_active,
      plan_type: req.body.plan_type,
    });
    
    const { error, value } = validateBusiness(req.body);
    if (error) {
      console.error('[Admin] Error validando datos:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    console.log('[Admin] Datos validados, creando negocio...');
    const business = await Business.create(value);
    console.log('[Admin] ✅ Negocio creado en la base de datos:', {
      id: business.id,
      name: business.name,
      whatsapp_number: business.whatsapp_number,
      is_active: business.is_active,
    });
    
    // Verificar que se guardó correctamente
    const verifyBusiness = await Business.findById(business.id);
    if (!verifyBusiness) {
      console.error('[Admin] ❌ ERROR: Negocio no se encontró después de crearlo');
      throw new Error('Business was not saved correctly');
    }
    console.log('[Admin] ✅ Negocio verificado en la base de datos');
    
    // Crear usuario owner por defecto (no bloquea si falla)
    if (value.owner_phone) {
      console.log('[Admin] Creando usuario owner por defecto...');
      BusinessUser.create({
        business_id: business.id,
        phone: value.owner_phone,
        password: 'changeme123', // Contraseña temporal, debería cambiarse
        role: 'owner',
      }).then(() => {
        console.log('[Admin] ✅ Usuario owner creado correctamente');
      }).catch(err => {
        console.warn('[Admin] ⚠️ Error creating default owner user:', err.message);
      });
    }
    
    // Inicializar bot en segundo plano (no bloquea la respuesta)
    // El bot se inicializará automáticamente al arrancar el servidor o se puede inicializar manualmente
    if (business.whatsapp_number) {
      console.log('[Admin] Inicializando bot en segundo plano...');
      // Inicializar bot de forma asíncrona (no bloqueante)
      (async () => {
        try {
          const bot = new BookingBot(business.id, business.whatsapp_number);
          await bot.initialize();
          activeBots.set(business.id, bot);
          console.log(`[Admin] ✅ Bot inicializado para nuevo negocio: ${business.name} (${business.id})`);
        } catch (err) {
          console.error(`[Admin] ❌ Error inicializando bot para ${business.name}:`, err.message);
          // No falla la creación del negocio si el bot falla
        }
      })();
    }
    
    // Responder inmediatamente después de crear el negocio
    console.log('[Admin] ✅ Respondiendo con negocio creado');
    res.status(201).json({ data: business });
  } catch (error) {
    console.error('[Admin] ❌ Error creating business:', error);
    console.error('[Admin] Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * GET /api/admin/businesses/:id
 * Obtener un negocio específico
 */
router.get('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Agregar información del bot
    const bot = activeBots.get(business.id);
    const qrData = getQRCode(business.id);
    
    let botStatus = 'not_initialized';
    let botInfo = null;
    
    if (bot) {
      try {
        const clientInfo = bot.client?.info;
        if (clientInfo) {
          botStatus = 'authenticated';
          botInfo = {
            wid: clientInfo.wid?.user,
            pushname: clientInfo.pushname,
            platform: clientInfo.platform,
          };
        } else if (qrData) {
          botStatus = 'waiting_qr';
        } else {
          botStatus = 'initializing';
        }
      } catch {
        botStatus = 'error';
      }
    } else if (qrData) {
      botStatus = 'waiting_qr';
    }
    
    res.json({
      data: {
        ...business,
        bot_status: botStatus,
        bot_info: botInfo,
        has_qr: !!qrData,
        qr: qrData?.qr || null,
      },
    });
  } catch (error) {
    console.error('Error getting business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/businesses/:id
 * Actualizar un negocio
 */
router.put('/businesses/:id', async (req, res) => {
  try {
    console.log(`[Admin] PUT /businesses/${req.params.id} - Actualizando negocio`);
    console.log(`[Admin] Datos recibidos:`, {
      whatsapp_number: req.body.whatsapp_number,
      name: req.body.name,
      phone: req.body.phone,
      plan_type: req.body.plan_type,
    });
    
    // Validar datos primero
    const { error, value } = validateBusiness(req.body, true);
    if (error) {
      console.error(`[Admin] Error validando datos:`, error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Obtener negocio actual para comparar
    const currentBusiness = await Business.findById(req.params.id);
    if (!currentBusiness) {
      console.log(`[Admin] ❌ Negocio ${req.params.id} no encontrado`);
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Verificar si se está actualizando el whatsapp_number
    const isUpdatingWhatsApp = value.whatsapp_number !== undefined;
    const whatsappChanged = isUpdatingWhatsApp && value.whatsapp_number !== currentBusiness.whatsapp_number;
    
    console.log(`[Admin] Verificación de cambio de WhatsApp:`, {
      isUpdatingWhatsApp,
      currentNumber: currentBusiness.whatsapp_number,
      newNumber: value.whatsapp_number,
      whatsappChanged,
    });
    
    console.log(`[Admin] Negocio actual:`, {
      id: currentBusiness.id,
      name: currentBusiness.name,
      current_whatsapp_number: currentBusiness.whatsapp_number,
      new_whatsapp_number: req.body.whatsapp_number,
    });

    console.log(`[Admin] Datos validados, actualizando negocio...`);
    const business = await Business.update(req.params.id, value);
    
    if (!business) {
      console.error(`[Admin] ❌ Error: Business.update retornó null`);
      return res.status(404).json({ error: 'Business not found' });
    }
    
    console.log(`[Admin] ✅ Negocio actualizado:`, {
      id: business.id,
      name: business.name,
      whatsapp_number: business.whatsapp_number,
    });
    
    // Si cambió el whatsapp_number, reinicializar bot en segundo plano
    if (whatsappChanged) {
      console.log(`[Admin] 🔄 Número de WhatsApp cambió: ${currentBusiness.whatsapp_number} -> ${value.whatsapp_number}`);
      const existingBot = activeBots.get(business.id);
      if (existingBot) {
        console.log(`[Admin] Desconectando bot existente para ${business.name}...`);
        try {
          await existingBot.clearSession(); // Limpiar sesión para forzar nueva autenticación
        } catch (err) {
          console.warn(`[Admin] Error limpiando sesión:`, err.message);
        }
        try {
          await existingBot.disconnect();
        } catch (err) {
          console.warn(`[Admin] Error desconectando bot:`, err.message);
        }
        activeBots.delete(business.id);
      }
      
      // Inicializar bot en segundo plano (no bloquea la respuesta)
      // Usar el número del business actualizado (después de Business.update) para asegurar que es el correcto
      const newWhatsAppNumber = business.whatsapp_number || value.whatsapp_number;
      console.log(`[Admin] ==========================================`);
      console.log(`[Admin] 🔄 INICIANDO REINICIALIZACIÓN DEL BOT`);
      console.log(`[Admin] Negocio: ${business.name} (${business.id})`);
      console.log(`[Admin] Número viejo: ${currentBusiness.whatsapp_number}`);
      console.log(`[Admin] Número nuevo (del body): ${value.whatsapp_number}`);
      console.log(`[Admin] Número nuevo (del business actualizado): ${business.whatsapp_number}`);
      console.log(`[Admin] Usando número: ${newWhatsAppNumber}`);
      console.log(`[Admin] ==========================================`);
      
      // Agregar bot a activeBots ANTES de inicializar (como en index.js)
      const bot = new BookingBot(business.id, newWhatsAppNumber);
      activeBots.set(business.id, bot);
      console.log(`[Admin] ✅ Bot agregado a activeBots antes de inicializar`);
      
      // Inicializar en segundo plano (no bloquea la respuesta)
      (async () => {
        try {
          console.log(`[Admin] Inicializando bot con nuevo número ${newWhatsAppNumber} para ${business.name}...`);
          await bot.initialize();
          console.log(`[Admin] ✅ Bot reinicializado correctamente para ${business.name}`);
          console.log(`[Admin] Bot debería generar QR en unos segundos...`);
        } catch (err) {
          console.error(`[Admin] ❌ Error reinicializando bot para ${business.name}:`, err.message);
          console.error(`[Admin] Error name:`, err.name);
          console.error(`[Admin] Error stack:`, err.stack);
        }
      })();
    } else if (isUpdatingWhatsApp && !whatsappChanged) {
      console.log(`[Admin] ℹ️ Número de WhatsApp no cambió (${value.whatsapp_number}), no es necesario reinicializar el bot`);
    }
    
    console.log(`[Admin] ✅ Retornando negocio actualizado`);
    res.json({ data: business });
  } catch (error) {
    console.error(`[Admin] ❌ Error updating business:`, error);
    console.error(`[Admin] Error message:`, error.message);
    console.error(`[Admin] Error stack:`, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * DELETE /api/admin/businesses/:id
 * Desactivar un negocio (soft delete)
 */
router.delete('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Desactivar negocio
    await Business.update(req.params.id, { is_active: false });
    
    // Desconectar bot
    const bot = activeBots.get(req.params.id);
    if (bot) {
      await bot.disconnect();
      activeBots.delete(req.params.id);
    }
    
    res.json({ message: 'Business deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/businesses/:id/activate
 * Reactivar un negocio
 */
router.post('/businesses/:id/activate', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    await Business.update(req.params.id, { is_active: true });
    
    // Reinicializar bot si tiene whatsapp_number
    if (business.whatsapp_number && !activeBots.has(req.params.id)) {
      try {
        const bot = new BookingBot(business.id, business.whatsapp_number);
        await bot.initialize();
        activeBots.set(business.id, bot);
      } catch (err) {
        console.error(`Error reinicializando bot para ${business.name}:`, err);
      }
    }
    
    res.json({ message: 'Business activated successfully' });
  } catch (error) {
    console.error('Error activating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/businesses/:id/qr
 * Obtener QR code del bot de un negocio
 */
router.get('/businesses/:id/qr', async (req, res) => {
  try {
    const businessId = req.params.id;
    console.log(`[QR] ==========================================`);
    console.log(`[QR] Solicitud de QR para negocio ${businessId}`);
    console.log(`[QR] Timestamp: ${new Date().toISOString()}`);
    
    // Verificar si el negocio existe
    const business = await Business.findById(businessId);
    if (!business) {
      console.log(`[QR] ❌ Negocio ${businessId} no encontrado en la base de datos`);
      return res.status(404).json({ error: 'Business not found' });
    }
    console.log(`[QR] ✅ Negocio encontrado: ${business.name}`);
    console.log(`[QR] WhatsApp number: ${business.whatsapp_number || 'NO CONFIGURADO'}`);
    console.log(`[QR] Is active: ${business.is_active}`);
    
    const qrData = getQRCode(businessId);
    const bot = activeBots.get(businessId);
    
    console.log(`[QR] QR data disponible: ${!!qrData}`);
    console.log(`[QR] Bot activo en memoria: ${!!bot}`);
    console.log(`[QR] Total de bots activos: ${activeBots.size}`);
    console.log(`[QR] IDs de bots activos:`, Array.from(activeBots.keys()));
    
    if (!qrData) {
      // Verificar si el bot está autenticado
      if (bot) {
        try {
          console.log(`[QR] Verificando estado del bot...`);
          const clientInfo = bot.client?.info;
          console.log(`[QR] Client info disponible: ${!!clientInfo}`);
          if (clientInfo) {
            console.log(`[QR] ✅ Bot ${businessId} ya está autenticado`);
            console.log(`[QR] Client info:`, {
              wid: clientInfo.wid,
              pushname: clientInfo.pushname,
              platform: clientInfo.platform,
            });
            return res.json({
              data: {
                qr: null,
                status: 'authenticated',
                message: 'Bot ya está conectado a WhatsApp',
              },
            });
          } else {
            console.log(`[QR] ⏳ Bot existe pero no está autenticado aún`);
          }
        } catch (err) {
          console.log(`[QR] ⚠️ Error verificando estado del bot: ${err.message}`);
          console.log(`[QR] Error stack:`, err.stack);
        }
      } else {
        console.log(`[QR] ⚠️ No hay bot activo para este negocio`);
        console.log(`[QR] Esto puede significar que el bot no se inicializó o se desconectó`);
      }
      
      // NO devolver 404, devolver 200 con status 'not_available'
      // Esto evita que el frontend trate esto como un error
      console.log(`[QR] ❌ No hay QR disponible para negocio ${businessId}`);
      console.log(`[QR] ==========================================`);
      return res.json({
        data: {
          qr: null,
          status: 'not_available',
          message: 'El QR code no está disponible. El bot puede estar ya autenticado o no estar inicializado. Intenta hacer clic en "Reconectar Bot" para generar un nuevo QR.',
        },
      });
    }
    
    console.log(`[QR] ✅ QR encontrado para negocio ${businessId}`);
    console.log(`[QR] QR timestamp: ${qrData.timestamp}`);
    console.log(`[QR] QR expires at: ${qrData.expiresAt}`);
    console.log(`[QR] ==========================================`);
    res.json({
      data: {
        qr: qrData.qr,
        timestamp: qrData.timestamp,
        expiresAt: qrData.expiresAt,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error(`[QR] ❌ Error getting QR code:`, error);
    console.error(`[QR] Error message:`, error.message);
    console.error(`[QR] Error stack:`, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/admin/businesses/:id/reconnect-bot
 * Forzar reconexión del bot de un negocio
 */
router.post('/businesses/:id/reconnect-bot', async (req, res) => {
  try {
    console.log(`[Reconnect] ==========================================`);
    console.log(`[Reconnect] Solicitud de reconexión para negocio ${req.params.id}`);
    
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      console.log(`[Reconnect] ❌ Negocio ${req.params.id} no encontrado`);
      return res.status(404).json({ error: 'Business not found' });
    }
    
    if (!business.whatsapp_number) {
      console.log(`[Reconnect] ❌ Negocio ${business.id} no tiene WhatsApp configurado`);
      return res.status(400).json({ error: 'Business does not have a WhatsApp number configured' });
    }
    
    // Eliminar QR anterior ANTES de reconectar
    const { deleteQRCode } = await import('../../services/qrStorage.js');
    console.log(`[Reconnect] Eliminando QR anterior para ${business.id}...`);
    deleteQRCode(business.id);
    console.log(`[Reconnect] ✅ QR anterior eliminado`);
    
    // Desconectar bot existente si hay uno y eliminar sesión guardada
    const existingBot = activeBots.get(req.params.id);
    if (existingBot) {
      try {
        console.log(`[Reconnect] Desconectando bot existente para ${business.id}...`);
        // Eliminar sesión guardada para forzar nueva autenticación y generar QR
        await existingBot.clearSession();
        console.log(`[Reconnect] ✅ Sesión del bot anterior limpiada`);
      } catch (disconnectErr) {
        console.warn(`[Reconnect] ⚠️ Error desconectando/limpiando bot existente:`, disconnectErr.message);
      }
      activeBots.delete(req.params.id);
      console.log(`[Reconnect] ✅ Bot anterior eliminado de activeBots`);
    } else {
      // Si no hay bot activo, crear uno temporal solo para limpiar la sesión
      try {
        console.log(`[Reconnect] No hay bot activo, limpiando sesión guardada directamente...`);
        const tempBot = new BookingBot(business.id, business.whatsapp_number);
        await tempBot.clearSession();
        console.log(`[Reconnect] ✅ Sesión guardada limpiada`);
      } catch (clearErr) {
        console.warn(`[Reconnect] ⚠️ Error limpiando sesión guardada:`, clearErr.message);
      }
    }
    
    // Esperar un poco para asegurar que la limpieza se completó
    console.log(`[Reconnect] Esperando 2 segundos para que la limpieza se complete...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reinicializar bot
    try {
      console.log(`[Reconnect] Creando nuevo bot para ${business.id}...`);
      // Crear nuevo bot e inicializar (sin sesión guardada, generará QR)
      const bot = new BookingBot(business.id, business.whatsapp_number);
      
      // Agregar bot a activeBots ANTES de inicializar
      activeBots.set(business.id, bot);
      console.log(`[Reconnect] ✅ Bot agregado a activeBots antes de inicializar`);
      
      // Inicializar en segundo plano para no bloquear la respuesta
      console.log(`[Reconnect] Inicializando bot en segundo plano...`);
      bot.initialize().then(() => {
        console.log(`[Reconnect] ✅ Bot inicializado correctamente para: ${business.name} (${business.id})`);
        console.log(`[Reconnect] 🔍 Esperando que se genere nuevo QR...`);
      }).catch(err => {
        console.error(`[Reconnect] ❌ Error inicializando bot después de reconectar:`, err.message);
        console.error(`[Reconnect] Error stack:`, err.stack);
        // No eliminar de activeBots, el bot puede seguir inicializándose en segundo plano
      });
      
      console.log(`[Reconnect] ✅ Proceso de reconexión iniciado`);
      console.log(`[Reconnect] ==========================================`);
      
      // Responder inmediatamente
      res.json({
        message: 'Bot reconectado exitosamente',
        note: 'La sesión guardada fue eliminada. El bot se está inicializando y generará un nuevo QR code en unos segundos. Haz clic en "Refrescar" en el modal de QR después de 5-10 segundos.',
      });
    } catch (err) {
      console.error('Error reconectando bot:', err);
      res.status(500).json({ error: 'Error al reconectar bot', details: err.message });
    }
  } catch (error) {
    console.error('Error in reconnect-bot endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/config/subscription-price
 * Obtener precio de suscripción
 */
router.get('/config/subscription-price', async (req, res) => {
  try {
    const price = await SystemConfig.get('subscription_price');
    res.json({ data: { price: price || '5000.00' } });
  } catch (error) {
    console.error('Error getting subscription price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/config/subscription-price
 * Actualizar precio de suscripción
 */
router.put('/config/subscription-price', async (req, res) => {
  try {
    const { price } = req.body;
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({ error: 'Precio inválido' });
    }
    
    await SystemConfig.set('subscription_price', price.toString(), 'Precio mensual de la suscripción en pesos argentinos');
    
    res.json({ data: { price } });
  } catch (error) {
    console.error('Error updating subscription price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/migrate-shortlinks-to-businesses
 * Migrar shortlinks sin business_id a businesses
 * Solo para super admin
 */
router.post('/migrate-shortlinks-to-businesses', async (req, res) => {
  try {
    if (!req.user.is_system_user || req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Only super admin can migrate' });
    }

    console.log('[Admin] Iniciando migración de shortlinks a businesses...');
    
    const db = (await import('../../../database/index.js')).default;
    const { Business } = await import('../../../database/models/Business.js');
    const { ClientService } = await import('../../services/clientService.js');
    
    // Obtener todos los shortlinks activos sin business_id
    const clientsWithoutBusiness = await db('clients')
      .where({ status: 'active' })
      .whereNull('business_id');
    
    console.log(`[Admin] Encontrados ${clientsWithoutBusiness.length} shortlinks sin business_id`);
    
    const results = [];
    
    for (const client of clientsWithoutBusiness) {
      try {
        // Crear business para este shortlink
        const business = await Business.create({
          name: client.name,
          phone: null,
          email: null,
          whatsapp_number: null,
          owner_phone: null,
          is_active: true,
          plan_type: 'basic',
          is_trial: false,
        });
        
        // Actualizar el shortlink con el business_id
        await ClientService.update(client.id, {
          business_id: business.id,
        });
        
        results.push({
          shortlink: client.slug,
          business_id: business.id,
          status: 'success',
        });
        
        console.log(`[Admin] ✅ Shortlink ${client.slug} migrado a business ${business.id}`);
      } catch (error) {
        console.error(`[Admin] ❌ Error migrando shortlink ${client.slug}:`, error.message);
        results.push({
          shortlink: client.slug,
          status: 'error',
          error: error.message,
        });
      }
    }
    
    res.json({
      message: `Migración completada: ${results.filter(r => r.status === 'success').length} exitosos, ${results.filter(r => r.status === 'error').length} errores`,
      results,
    });
  } catch (error) {
    console.error('[Admin] Error en migración:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;

