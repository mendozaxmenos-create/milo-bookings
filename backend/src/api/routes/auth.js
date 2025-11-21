import express from 'express';
import rateLimit from 'express-rate-limit';
import { BusinessUser } from '../../../database/models/BusinessUser.js';
import { SystemUser } from '../../../database/models/SystemUser.js';
import { generateToken } from '../../utils/auth.js';
import { validateLogin, validateRegister, validatePasswordResetRequest, validatePasswordReset } from '../../utils/validators.js';
import { sendPasswordResetToken, sendSystemUserPasswordResetToken, resetPasswordWithToken } from '../../services/passwordResetService.js';
import { authLogger } from '../../utils/logger.js';

const router = express.Router();

// Rate limiting para login (más estricto)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: { error: 'Demasiados intentos de login. Por favor intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// Rate limiting para password reset (muy estricto)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 intentos por hora por IP
  message: { error: 'Demasiados intentos de recuperación de contraseña. Por favor intenta de nuevo en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 registros por hora por IP
  message: { error: 'Demasiados intentos de registro. Por favor intenta de nuevo en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login (con rate limiting)
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    authLogger.debug('Login attempt', {
      hasEmail: !!req.body.email,
      hasBusinessId: !!req.body.business_id,
      hasPhone: !!req.body.phone,
      ip: req.ip || req.connection.remoteAddress,
    });
    
    const { error, value } = validateLogin(req.body);
    if (error) {
      authLogger.warn('Login validation failed', {
        error: error.details[0].message,
        ip: req.ip || req.connection.remoteAddress,
      });
      return res.status(400).json({ error: error.details[0].message });
    }

    const { business_id, phone, password, email } = value;

    // Intentar login como super admin primero (si viene email)
    if (email) {
      const systemUser = await SystemUser.findByEmail(email);
      if (systemUser && systemUser.is_active) {
        const isValid = await SystemUser.verifyPassword(systemUser, password);
        if (isValid) {
          const token = generateToken({
            user_id: systemUser.id,
            business_id: null,
            email: systemUser.email,
            role: 'super_admin',
            is_system_user: true,
          });

          return res.json({
            token,
            user: {
              id: systemUser.id,
              business_id: null,
              email: systemUser.email,
              name: systemUser.name,
              role: systemUser.role,
              is_system_user: true,
            },
          });
        }
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Login como business user
    if (!business_id || !phone) {
      authLogger.warn('Missing business_id or phone for business user login', {
        ip: req.ip || req.connection.remoteAddress,
      });
      return res.status(400).json({ error: 'business_id and phone are required for business users' });
    }

    console.log(`[Auth] 🔍 Buscando usuario de negocio...`);
    console.log(`[Auth] Business ID: "${business_id}"`);
    console.log(`[Auth] Phone: "${phone}"`);
    console.log(`[Auth] Phone length: ${phone?.length || 0}`);
    console.log(`[Auth] Password length: ${password?.length || 0}`);
    
    authLogger.debug('Looking for business user', { business_id, phone });
    const user = await BusinessUser.findByBusinessAndPhone(business_id, phone);
    
    if (!user) {
      console.log(`[Auth] ❌ Usuario no encontrado`);
      console.log(`[Auth] Intentó buscar con business_id: "${business_id}" y phone: "${phone}"`);
      
      // Buscar todos los usuarios del negocio para dar sugerencias
      try {
        const allUsers = await BusinessUser.listByBusiness(business_id);
        if (allUsers && allUsers.length > 0) {
          console.log(`[Auth] 💡 Usuarios encontrados para este negocio:`);
          allUsers.forEach(user => {
            console.log(`[Auth]   - User ID: ${user.id}, Phone: "${user.phone}", Role: ${user.role}`);
          });
          const firstUser = allUsers[0];
          console.log(`[Auth] 💡 SUGERENCIA: Intenta usar el teléfono "${firstUser.phone}"`);
        }
      } catch (err) {
        console.log(`[Auth] Error al buscar usuarios del negocio:`, err.message);
      }
      
      // Intentar con diferentes formatos de teléfono
      const phoneVariants = [
        phone,
        phone?.replace(/\s+/g, ''),
        phone?.startsWith('+') ? phone : `+${phone}`,
        phone?.startsWith('+') ? phone.substring(1) : phone,
      ].filter(Boolean);
      
      console.log(`[Auth] Variantes de teléfono intentadas:`, phoneVariants);
      
      // Intentar buscar con cada variante
      for (const phoneVariant of phoneVariants) {
        if (phoneVariant !== phone) {
          const altUser = await BusinessUser.findByBusinessAndPhone(business_id, phoneVariant);
          if (altUser) {
            console.log(`[Auth] ⚠️ Usuario encontrado con variante de teléfono: "${phoneVariant}"`);
            console.log(`[Auth] 💡 SUGERENCIA: Usar teléfono "${altUser.phone}" para login`);
            break;
          }
        }
      }
      
      authLogger.warn('Business user not found', { business_id, phone, ip: req.ip || req.connection.remoteAddress });
      return res.status(401).json({ error: 'Invalid credentials', details: 'User not found. Please check business_id and phone number. The phone number must match exactly the one used when creating the business.' });
    }

    console.log(`[Auth] ✅ Usuario encontrado: ${user.id}`);
    console.log(`[Auth] Usuario phone en BD: "${user.phone}"`);
    console.log(`[Auth] Usuario business_id en BD: "${user.business_id}"`);
    
    authLogger.debug('Business user found, verifying password');
    const isValid = await BusinessUser.verifyPassword(user, password);
    
    if (!isValid) {
      console.log(`[Auth] ❌ Contraseña incorrecta`);
      console.log(`[Auth] Contraseña recibida length: ${password?.length || 0}`);
      authLogger.warn('Invalid password for business user', {
        business_id,
        phone,
        userId: user.id,
        ip: req.ip || req.connection.remoteAddress,
      });
      return res.status(401).json({ error: 'Invalid credentials', details: 'Password is incorrect. Default password is "changeme123".' });
    }
    
    console.log(`[Auth] ✅ Contraseña válida!`);

    authLogger.info('Login successful', {
      userId: user.id,
      businessId: user.business_id,
      role: user.role,
      ip: req.ip || req.connection.remoteAddress,
    });

    const token = generateToken({
      user_id: user.id,
      business_id: user.business_id,
      phone: user.phone,
      role: user.role,
      is_system_user: false,
    });

    res.json({
      token,
      user: {
        id: user.id,
        business_id: user.business_id,
        phone: user.phone,
        role: user.role,
        is_system_user: false,
      },
    });
    } catch (error) {
      authLogger.error('Login error', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ip: req.ip || req.connection.remoteAddress,
      });
      // Pasar el error al error handler de Express
      next(error);
    }
});

// Register (solo para desarrollo, en producción debería ser por invitación)
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { error, value } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { business_id, phone, password, role } = value;

    // Verificar si el usuario ya existe
    const existing = await BusinessUser.findByBusinessAndPhone(business_id, phone);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = await BusinessUser.create({
      business_id,
      phone,
      password,
      role: role || 'staff',
    });

    const token = generateToken({
      user_id: user.id,
      business_id: user.business_id,
      phone: user.phone,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        business_id: user.business_id,
        phone: user.phone,
        role: user.role,
      },
    });
    } catch (error) {
      authLogger.error('Register error', {
        error: error.message,
        stack: error.stack,
        ip: req.ip || req.connection.remoteAddress,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Solicitar recuperación de contraseña (con rate limiting estricto)
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { error, value } = validatePasswordResetRequest(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, business_id, phone } = value;

    // Si viene email, es para super admin
    if (email) {
      const result = await sendSystemUserPasswordResetToken(email);
      
      // En producción, el token debería enviarse por email
      // Por ahora, retornamos el token para mostrarlo en el frontend (solo en desarrollo)
      if (result.success && result.token) {
        return res.json({
          message: 'Código de recuperación generado. En producción, esto debería enviarse por email.',
          success: true,
          token: result.token, // Solo en desarrollo/MVP
          isSystemUser: true,
        });
      }

      // Por seguridad, siempre devolvemos éxito (no revelamos si el usuario existe)
      return res.json({
        message: 'Si el usuario existe, recibirás un código de recuperación',
        success: true,
        isSystemUser: true,
      });
    }

    // Si viene business_id y phone, es para business user
    if (business_id && phone) {
      const result = await sendPasswordResetToken(business_id, phone);

      // Por seguridad, siempre devolvemos éxito (no revelamos si el usuario existe)
      return res.json({
        message: 'Si el usuario existe, recibirás un código de recuperación por WhatsApp',
        success: true,
        isSystemUser: false,
      });
    }

    return res.status(400).json({ error: 'email o (business_id + phone) requerido' });
    } catch (error) {
      authLogger.error('Forgot password error', {
        error: error.message,
        stack: error.stack,
        ip: req.ip || req.connection.remoteAddress,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Resetear contraseña con token (con rate limiting estricto)
router.post('/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { error, value } = validatePasswordReset(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token, password } = value;

    // Resetear contraseña
    const result = await resetPasswordWithToken(token, password);

    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Token inválido o expirado' });
    }

    res.json({
      message: 'Contraseña restablecida exitosamente',
      success: true,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

