import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import db from '../../database/index.js';
import { Business } from '../../database/models/Business.js';

export class BookingBot {
  constructor(businessId, whatsappNumber) {
    this.businessId = businessId;
    this.whatsappNumber = whatsappNumber;
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: `business-${businessId}`,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
  }

  async initialize() {
    // Setup de eventos
    this.client.on('qr', (qr) => {
      console.log(`QR Code for business ${this.businessId}:`);
      qrcode.generate(qr, { small: true });
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
      await this.handleMessage(msg);
    });

    await this.client.initialize();
  }

  async handleMessage(msg) {
    try {
      const from = msg.from;
      const body = msg.body.toLowerCase().trim();

      // Detectar negocio por número
      const business = await Business.findByWhatsAppNumber(this.whatsappNumber);
      if (!business) {
        console.error(`Business not found for WhatsApp number: ${this.whatsappNumber}`);
        return;
      }

      // Lógica básica de respuesta
      if (body === 'hola' || body === 'hi' || body === 'hello') {
        await msg.reply(`¡Hola! Bienvenido a ${business.name}. ¿En qué puedo ayudarte?`);
      } else {
        await msg.reply('Gracias por tu mensaje. Estamos trabajando en mejorar el bot.');
      }
    } catch (error) {
      console.error('Error handling message:', error);
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
}

