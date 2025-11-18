import express from 'express';
import { BusinessUser } from '../../database/models/BusinessUser.js';
import { generateToken } from '../../utils/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { business_id, phone, password } = req.body;

    if (!business_id || !phone || !password) {
      return res.status(400).json({ error: 'business_id, phone, and password are required' });
    }

    const user = await BusinessUser.findByBusinessAndPhone(business_id, phone);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await BusinessUser.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      user_id: user.id,
      business_id: user.business_id,
      phone: user.phone,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        business_id: user.business_id,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register (solo para desarrollo, en producción debería ser por invitación)
router.post('/register', async (req, res) => {
  try {
    const { business_id, phone, password, role } = req.body;

    if (!business_id || !phone || !password) {
      return res.status(400).json({ error: 'business_id, phone, and password are required' });
    }

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
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

