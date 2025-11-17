import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { Business } from '../../database/models/Business.js';
import { MessageHandler } from './handlers/messageHandler.js';

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
    this.messageHandler = new MessageHandler(this, businessId);
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
      await this.messageHandler.handleMessage(msg);
    });

    await this.client.initialize();
    await this.messageHandler.initialize();
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

