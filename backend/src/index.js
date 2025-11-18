import dotenv from 'dotenv';
import app from './api/server.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Milo Bookings Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

