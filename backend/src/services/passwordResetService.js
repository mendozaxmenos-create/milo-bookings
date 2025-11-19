import crypto from 'crypto';
import { BusinessUser } from '../../database/models/BusinessUser.js';
import { Business } from '../../database/models/Business.js';
import { activeBots } from '../index.js';

/**
 * Genera un token de recuperación de contraseña
 */
export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Envía el token de recuperación por WhatsApp
 */
export async function sendPasswordResetToken(businessId, phone) {
  try {
    // Buscar usuario
    const user = await BusinessUser.findByBusinessAndPhone(businessId, phone);
    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      return { success: true };
    }

    // Generar token
    const resetToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Válido por 1 hora

    // Guardar token en la base de datos
    await BusinessUser.setResetToken(user.id, resetToken, expiresAt.toISOString());

    // Obtener información del negocio
    const business = await Business.findById(businessId);
    if (!business) {
      console.error(`[PasswordReset] Negocio no encontrado: ${businessId}`);
      return { success: false, error: 'Business not found' };
    }

    // Obtener bot activo
    const bot = activeBots.get(businessId);
    if (!bot) {
      console.warn(`[PasswordReset] Bot no disponible para negocio ${businessId}`);
      // Aún así guardamos el token, el usuario puede usar el link directo
      return { success: true, token: resetToken };
    }

    // Formatear número de teléfono para WhatsApp
    let userPhone = phone.replace(/[\s\+]/g, '');
    if (!userPhone.includes('@')) {
      userPhone = `${userPhone}@c.us`;
    }

    // Crear mensaje con el token
    const resetMessage = `🔐 *Recuperación de Contraseña*

Hola! Has solicitado recuperar tu contraseña para ${business.name}.

Tu código de recuperación es:
*${resetToken}*

Este código expira en 1 hora.

Si no solicitaste este código, ignora este mensaje.

Para restablecer tu contraseña, usa este código en la página de recuperación.`;

    // Enviar mensaje
    await bot.sendMessage(userPhone, resetMessage);

    console.log(`[PasswordReset] ✅ Token enviado a ${phone} para negocio ${businessId}`);
    return { success: true, token: resetToken };
  } catch (error) {
    console.error(`[PasswordReset] Error enviando token a ${phone}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Resetea la contraseña usando el token
 */
export async function resetPasswordWithToken(token, newPassword) {
  try {
    // Buscar usuario por token
    const user = await BusinessUser.findByResetToken(token);
    if (!user) {
      return { success: false, error: 'Token inválido o expirado' };
    }

    // Actualizar contraseña y limpiar token
    await BusinessUser.update(user.id, { password: newPassword });
    await BusinessUser.clearResetToken(user.id);

    console.log(`[PasswordReset] ✅ Contraseña reseteada para usuario ${user.id}`);
    return { success: true, userId: user.id };
  } catch (error) {
    console.error(`[PasswordReset] Error reseteando contraseña:`, error);
    return { success: false, error: error.message };
  }
}

