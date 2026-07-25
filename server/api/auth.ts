import express from 'express';
import jwt from 'jsonwebtoken';
import { globalStore, User } from '../store';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'veritas-super-secret-key-for-mvp';

export const generateToken = (user: User) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = globalStore.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ detail: "Email ou mot de passe incorrect" });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ detail: "Compte suspendu" });
  }

  const token = generateToken(user);
  
  // Omit password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    token,
    user: userWithoutPassword
  });
});

export const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Non autorisé" });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ detail: "Token invalide" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Accès refusé" });
    }
    next();
  };
};

export default router;
