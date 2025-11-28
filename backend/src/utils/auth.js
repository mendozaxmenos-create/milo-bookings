import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.warn('JWT verification failed:', error.message);
    return null;
  }
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('[Auth] No token provided for:', req.path);
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('[Auth] Invalid or expired token for:', req.path);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Si el usuario es super admin y hay un header X-Business-Id,
  // usar ese business_id para permitir ver el panel de otro negocio
  if (decoded.is_system_user && decoded.role === 'super_admin' && req.headers['x-business-id']) {
    const targetBusinessId = req.headers['x-business-id'];
    console.log('[Auth] Super admin viewing business:', {
      path: req.path,
      user_id: decoded.user_id,
      original_business_id: decoded.business_id,
      target_business_id: targetBusinessId,
      role: decoded.role,
    });
    // Crear un objeto user con el business_id del header
    req.user = {
      ...decoded,
      business_id: targetBusinessId,
    };
  } else {
    console.log('[Auth] Authenticated user:', {
      path: req.path,
      user_id: decoded.user_id,
      business_id: decoded.business_id,
      role: decoded.role,
      is_system_user: decoded.is_system_user,
    });
    req.user = decoded;
  }

  next();
}

/**
 * Middleware para requerir autenticación de super admin
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.is_system_user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }

  next();
}

