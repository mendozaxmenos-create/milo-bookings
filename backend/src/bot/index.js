import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { MessageHandler } from './handlers/messageHandler.js';
import { SessionStorage } from '../services/sessionStorage.js';
import { saveQRCode } from '../services/qrStorage.js';

export class BookingBot {
  constructor(businessId, whatsappNumber) {
    this.businessId = businessId;
    this.whatsappNumber = whatsappNumber;
    this.sessionStorage = new SessionStorage(businessId);
    
    // Configuración de Puppeteer para entornos cloud
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
    // Setup de eventos
    this.client.on('qr', (qr) => {
      console.log(`\n📱 QR Code for business ${this.businessId}:`);
      console.log(`   Escanea este código QR con WhatsApp para conectar el bot\n`);
      
      // Guardar QR code para acceso via API
      saveQRCode(this.businessId, qr);
      
      // En producción, también podemos enviar el QR a un webhook o almacenarlo
      if (process.env.QR_WEBHOOK_URL) {
        this.sendQRToWebhook(qr);
      }
      
      // Mostrar QR en consola (útil para desarrollo)
      if (process.env.NODE_ENV !== 'production' || process.env.SHOW_QR === 'true') {
        qrcode.generate(qr, { small: true });
      }
    });

    this.client.on('ready', () => {
      console.log(`Bot ready for business ${this.businessId}`);
    });

    this.client.on('authenticated', () => {
      console.log(`Bot authenticated for business ${this.businessId}`);
    });

    this.client.on('auth_failure', (msg) => {
      console.error(`Auth failure for business ${this.businessId}:`, msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log(`Bot disconnected for business ${this.businessId}:`, reason);
    });

    this.client.on('message', async (msg) => {
      console.log(`[Bot] Message received from ${msg.from}: "${msg.body?.substring(0, 50)}"`);
      try {
        await this.messageHandler.handleMessage(msg);
      } catch (error) {
        console.error(`[Bot] Error handling message:`, error);
      }
    });

    await this.client.initialize();
    await this.messageHandler.initialize();
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

