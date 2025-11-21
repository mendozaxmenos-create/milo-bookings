import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { MessageHandler } from './handlers/messageHandler.js';
import { SessionStorage } from '../services/sessionStorage.js';
import { saveQRCode, deleteQRCode } from '../services/qrStorage.js';

export class BookingBot {
  constructor(businessId, whatsappNumber) {
    this.businessId = businessId;
    this.whatsappNumber = whatsappNumber;
    this.sessionStorage = new SessionStorage(businessId);
    
    // Configuración de Puppeteer para entornos cloud (optimizada para memoria)
    const puppeteerOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-features=TranslateUI',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--password-store=basic',
        '--use-mock-keychain',
        // NO usar --single-process en Render ya que puede causar problemas
        // '--single-process', 
        '--memory-pressure-off',
      ],
    };
    
    // Usar ejecutable de Chromium del sistema si está disponible (para Docker/cloud)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    // Usar LocalAuth con path personalizado para sesiones persistentes
    const authStrategy = new LocalAuth({
      clientId: `business-${businessId}`,
      dataPath: this.sessionStorage.getLocalAuthPath(),
    });

    this.client = new Client({
      authStrategy,
      puppeteer: puppeteerOptions,
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51.html',
      },
    });
    
    this.messageHandler = new MessageHandler(this, businessId);
  }

  async initialize() {
    console.log(`🚀 [Bot ${this.businessId}] Starting initialization...`);
    console.log(`🚀 [Bot ${this.businessId}] WhatsApp number: ${this.whatsappNumber}`);
    console.log(`🚀 [Bot ${this.businessId}] Session path: ${this.sessionStorage.getLocalAuthPath()}`);
    
    // Setup de eventos
    this.client.on('qr', (qr) => {
      console.log(`\n📱 [Bot ${this.businessId}] ==========================================`);
      console.log(`📱 [Bot ${this.businessId}] 🔔 QR CODE GENERATED!`);
      console.log(`📱 [Bot ${this.businessId}] Timestamp: ${new Date().toISOString()}`);
      console.log(`📱 [Bot ${this.businessId}] QR length: ${qr.length} characters`);
      console.log(`📱 [Bot ${this.businessId}] QR preview: ${qr.substring(0, 50)}...`);
      console.log(`📱 [Bot ${this.businessId}] Escanea este código QR con WhatsApp para conectar el bot`);
      console.log(`📱 [Bot ${this.businessId}] ==========================================\n`);
      
      // Eliminar QR anterior si existe (por si acaso)
      deleteQRCode(this.businessId);
      
      // Guardar QR code nuevo para acceso via API
      saveQRCode(this.businessId, qr);
      console.log(`💾 [Bot ${this.businessId}] ✅ QR code guardado en storage`);
      console.log(`💾 [Bot ${this.businessId}] QR expira en ~5 minutos`);
      
      // En producción, también podemos enviar el QR a un webhook o almacenarlo
      if (process.env.QR_WEBHOOK_URL) {
        this.sendQRToWebhook(qr);
      }
      
      // Mostrar QR en consola (útil para desarrollo)
      if (process.env.NODE_ENV !== 'production' || process.env.SHOW_QR === 'true') {
        qrcode.generate(qr, { small: true });
      }
    });

    this.client.on('ready', async () => {
      console.log(`✅ [Bot ${this.businessId}] ==========================================`);
      console.log(`✅ [Bot ${this.businessId}] Bot ready and authenticated!`);
      console.log(`✅ [Bot ${this.businessId}] Bot is NOW ready to receive messages!`);
      console.log(`✅ [Bot ${this.businessId}] Client info:`, {
        wid: this.client.info?.wid,
        pushname: this.client.info?.pushname,
        platform: this.client.info?.platform,
      });
      console.log(`✅ [Bot ${this.businessId}] Message handlers are active!`);
      console.log(`✅ [Bot ${this.businessId}] ==========================================`);
      
      // Asegurar que el message handler esté inicializado
      try {
        await this.messageHandler.initialize();
        console.log(`✅ [Bot ${this.businessId}] Message handler initialized in ready event`);
      } catch (err) {
        console.error(`❌ [Bot ${this.businessId}] Error initializing message handler in ready:`, err);
      }
      
      // Limpiar QR cuando el bot está listo
      deleteQRCode(this.businessId);
      console.log(`🗑️ [Bot ${this.businessId}] QR code deleted (bot ready)`);
    });

    this.client.on('authenticated', () => {
      console.log(`🔐 [Bot ${this.businessId}] Bot authenticated successfully!`);
      console.log(`🔐 [Bot ${this.businessId}] Session saved, waiting for ready event...`);
    });

    this.client.on('auth_failure', (msg) => {
      console.error(`❌ [Bot ${this.businessId}] Auth failure:`, msg);
      console.error(`❌ [Bot ${this.businessId}] Error details:`, JSON.stringify(msg, null, 2));
    });

    this.client.on('disconnected', (reason) => {
      console.log(`⚠️ [Bot ${this.businessId}] Bot disconnected. Reason:`, reason);
      console.log(`⚠️ [Bot ${this.businessId}] Disconnection details:`, JSON.stringify(reason, null, 2));
    });

    this.client.on('loading_screen', (percent, message) => {
      console.log(`⏳ [Bot ${this.businessId}] Loading: ${percent}% - ${message}`);
    });

    this.client.on('change_state', (state) => {
      console.log(`🔄 [Bot ${this.businessId}] State changed to: ${state}`);
    });

    this.client.on('message', async (msg) => {
      console.log(`📨 [Bot ${this.businessId}] ==========================================`);
      console.log(`📨 [Bot ${this.businessId}] 🔔 MESSAGE EVENT FIRED!`);
      console.log(`📨 [Bot ${this.businessId}] Timestamp: ${new Date().toISOString()}`);
      console.log(`📨 [Bot ${this.businessId}] From: ${msg.from}`);
      console.log(`📨 [Bot ${this.businessId}] Body: "${msg.body?.substring(0, 100) || '(empty)'}"`);
      console.log(`📨 [Bot ${this.businessId}] Body length: ${msg.body?.length || 0}`);
      console.log(`📨 [Bot ${this.businessId}] Type: ${msg.type}`);
      console.log(`📨 [Bot ${this.businessId}] Is from me: ${msg.fromMe}`);
      console.log(`📨 [Bot ${this.businessId}] Is status: ${msg.isStatus}`);
      console.log(`📨 [Bot ${this.businessId}] Is group: ${msg.from?.includes('@g.us') || false}`);
      console.log(`📨 [Bot ${this.businessId}] Message ID: ${msg.id?.id || 'N/A'}`);
      
      // Verificar si el bot está listo
      try {
        const clientInfo = this.client.info;
        if (!clientInfo) {
          console.warn(`⚠️ [Bot ${this.businessId}] ⚠️ WARNING: Client info not available!`);
          console.warn(`⚠️ [Bot ${this.businessId}] Bot may not be ready to process messages!`);
          console.warn(`⚠️ [Bot ${this.businessId}] This message will still be processed, but may fail.`);
        } else {
          console.log(`✅ [Bot ${this.businessId}] Bot is ready! Client info available.`);
          console.log(`✅ [Bot ${this.businessId}] Client pushname: ${clientInfo.pushname || 'N/A'}`);
        }
      } catch (err) {
        console.warn(`⚠️ [Bot ${this.businessId}] WARNING: Could not check client info:`, err.message);
        console.warn(`⚠️ [Bot ${this.businessId}] Error stack:`, err.stack);
      }
      
      // Verificar que messageHandler existe
      if (!this.messageHandler) {
        console.error(`❌ [Bot ${this.businessId}] ❌ CRITICAL: messageHandler is not initialized!`);
        console.error(`❌ [Bot ${this.businessId}] Cannot process message without messageHandler!`);
        return;
      }
      console.log(`✅ [Bot ${this.businessId}] Message handler exists, proceeding...`);
      
      try {
        console.log(`🔄 [Bot ${this.businessId}] Calling messageHandler.handleMessage()...`);
        const handleResult = await this.messageHandler.handleMessage(msg);
        console.log(`✅ [Bot ${this.businessId}] Message handled successfully!`);
        console.log(`✅ [Bot ${this.businessId}] Handle result:`, handleResult ? 'has result' : 'no result');
        if (handleResult) {
          console.log(`✅ [Bot ${this.businessId}] Handle result type:`, typeof handleResult);
        }
      } catch (error) {
        console.error(`❌ [Bot ${this.businessId}] ==========================================`);
        console.error(`❌ [Bot ${this.businessId}] ERROR handling message:`);
        console.error(`❌ [Bot ${this.businessId}] Error name:`, error?.name);
        console.error(`❌ [Bot ${this.businessId}] Error message:`, error?.message);
        console.error(`❌ [Bot ${this.businessId}] Error stack:`, error?.stack);
        console.error(`❌ [Bot ${this.businessId}] ==========================================`);
        
        // Intentar responder con un mensaje de error
        try {
          console.log(`🔄 [Bot ${this.businessId}] Attempting to send error message to user...`);
          const errorReply = await msg.reply('⚠️ Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo.');
          console.log(`✅ [Bot ${this.businessId}] Error message sent successfully`);
          console.log(`✅ [Bot ${this.businessId}] Error reply ID:`, errorReply?.id?.id || 'N/A');
        } catch (replyError) {
          console.error(`❌ [Bot ${this.businessId}] ❌❌❌ CRITICAL: Error sending error message:`, replyError);
          console.error(`❌ [Bot ${this.businessId}] Reply error name:`, replyError?.name);
          console.error(`❌ [Bot ${this.businessId}] Reply error message:`, replyError?.message);
          console.error(`❌ [Bot ${this.businessId}] Reply error stack:`, replyError?.stack);
        }
      }
      console.log(`📨 [Bot ${this.businessId}] ==========================================`);
    });

    // Inicializar de forma ASÍNCRONA y NO BLOQUEANTE
    // Esto permite que el bot esté "listo" inmediatamente mientras se inicializa en segundo plano
    console.log(`⚡ [Bot ${this.businessId}] Iniciando cliente en segundo plano (no bloqueante)...`);
    
    // Inicializar el cliente de forma completamente asíncrona (sin await)
    this.client.initialize().then(() => {
      console.log(`✅ [Bot ${this.businessId}] Client initialized successfully (background)`);
    }).catch((err) => {
      console.error(`❌ [Bot ${this.businessId}] Error durante initialize (background):`, err.message);
      // No lanzar el error, el bot puede seguir intentando
    });
    
    // Inicializar message handler también de forma asíncrona
    this.messageHandler.initialize().then(() => {
      console.log(`✅ [Bot ${this.businessId}] Message handler initialized successfully (background)`);
    }).catch((err) => {
      console.error(`❌ [Bot ${this.businessId}] Error inicializando message handler:`, err.message);
    });
    
    // Verificar estado inicial rápidamente (sin esperar mucho)
    setTimeout(async () => {
      try {
        const clientInfo = this.client.info;
        if (clientInfo) {
          console.log(`✅ [Bot ${this.businessId}] Bot ya está autenticado (verificación rápida)`);
          deleteQRCode(this.businessId);
        }
      } catch (err) {
        // Ignorar errores en verificación rápida
      }
    }, 2000); // Solo 2 segundos
    
    // Verificación periódica más larga (para casos donde tarda más en autenticarse)
    setTimeout(async () => {
      try {
        const clientInfo = this.client.info;
        if (clientInfo) {
          console.log(`✅ [Bot ${this.businessId}] [CHECK] Bot autenticado (verificación periódica)`);
          deleteQRCode(this.businessId);
        } else {
          console.log(`⏳ [Bot ${this.businessId}] [CHECK] Bot aún no autenticado`);
        }
      } catch (err) {
        // Ignorar errores
      }
    }, 15000); // 15 segundos
    
    // Retornar inmediatamente - el bot se está inicializando en segundo plano
    console.log(`✅ [Bot ${this.businessId}] Bot disponible inmediatamente (inicialización en segundo plano)`);
    
    // No esperar nada - retornar inmediatamente
    return;
    
    // El código de abajo NO se ejecutará debido al return
    // Se dejó comentado para referencia
    /* Código antiguo que esperaba la inicialización:
    try {
      await this.client.initialize();
      await this.messageHandler.initialize();
      ...
    } catch (error) {
      ...
    }
    */
      console.error(`❌ [Bot ${this.businessId}] Error during initialization:`, error);
      console.error(`❌ [Bot ${this.businessId}] Error message:`, error.message);
      console.error(`❌ [Bot ${this.businessId}] Error stack:`, error.stack);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.destroy();
      }
    } catch (error) {
      console.error(`Error desconectando bot para ${this.businessId}:`, error);
    }
  }

  /**
   * Elimina la sesión guardada para forzar nueva autenticación
   */
  async clearSession() {
    try {
      // Desconectar primero
      await this.disconnect();
      
      // Eliminar directorio de sesión
      const sessionPath = this.sessionStorage.getLocalAuthPath();
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        await fs.rm(sessionPath, { recursive: true, force: true });
        console.log(`🗑️ Sesión eliminada para negocio ${this.businessId}`);
      } catch (err) {
        // Si el directorio no existe, está bien
        if (err.code !== 'ENOENT') {
          console.warn(`Advertencia al eliminar sesión: ${err.message}`);
        }
      }
    } catch (error) {
      console.error(`Error eliminando sesión para ${this.businessId}:`, error);
    }
  }

  async sendMessage(to, message) {
    try {
      return await this.client.sendMessage(to, message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.client.destroy();
  }

  async sendQRToWebhook(qr) {
    try {
      const response = await fetch(process.env.QR_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: this.businessId,
          qr: qr,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        console.error(`Failed to send QR to webhook: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error sending QR to webhook: ${error.message}`);
    }
  }
}

