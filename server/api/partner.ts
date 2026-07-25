import express from 'express';
import { requireAuth, requireRole } from './auth';
import { globalVectorStore } from '../engine';
import { globalStore } from '../store';

const router = express.Router();

router.get('/dashboard', requireAuth, requireRole(['partner']), (req: any, res) => {
  const user = globalStore.users.find(u => u.id === req.user.id);
  const docs = globalVectorStore.getDocuments().filter(d => d.institution === user?.organization);
  
  res.json({
    organization: user?.organization || "Organisation",
    documents_published: docs.length,
    pending_corrections: 0,
    impact_score: Math.round((user?.trust_level || 0) * 100)
  });
});

router.get('/documents', requireAuth, requireRole(['partner']), (req: any, res) => {
  const user = globalStore.users.find(u => u.id === req.user.id);
  const docs = globalVectorStore.getDocuments().filter(d => d.institution === user?.organization);
  res.json(docs);
});

router.get('/notifications', requireAuth, requireRole(['partner']), (req: any, res) => {
    res.json(globalStore.getNotifications(req.user.id));
});

export default router;
