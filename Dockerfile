# Dockerfile para Milo Bookings
FROM node:18-slim

# Instalar dependencias del sistema necesarias para Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependencias
RUN npm install --legacy-peer-deps
RUN cd backend && npm install

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p backend/data backend/data/whatsapp-sessions

# Ejecutar migraciones
RUN cd backend && npm run db:migrate || true

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV SESSION_STORAGE_TYPE=local
ENV SESSION_STORAGE_PATH=/app/backend/data/whatsapp-sessions

# Comando de inicio
CMD ["node", "backend/src/index.js"]

