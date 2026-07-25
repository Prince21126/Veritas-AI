import express from 'express';
import { requireAuth, requireRole } from './auth';
import { globalVectorStore } from '../engine';
import { collector } from './knowledge';
import { globalStore, User, Source } from '../store';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// -- STATS --
router.get('/dashboard', requireAuth, requireRole(['admin']), (req, res) => {
  const storeStats = globalVectorStore.getStats();
  res.json({
    total_documents: storeStats.total_documents,
    total_chunks: storeStats.total_chunks,
    active_sources: globalStore.sources.filter(s => s.status === 'active').length,
    total_sources: globalStore.sources.length,
    active_partners: globalStore.users.filter(u => u.role === 'partner').length,
    history_count: globalStore.history.length
  });
});

// -- DOCUMENTS --
router.get('/documents', requireAuth, requireRole(['admin']), (req, res) => {
  res.json(globalVectorStore.getDocuments());
});
router.delete('/documents/:id', requireAuth, requireRole(['admin']), (req, res) => {
  globalVectorStore.deleteDocument(req.params.id);
  res.json({ success: true });
});

// -- SOURCES --
router.get('/sources', requireAuth, requireRole(['admin']), (req, res) => {
  res.json(globalStore.sources);
});
router.post('/sources', requireAuth, requireRole(['admin']), (req, res) => {
  const newSource: Source = {
    id: `source-${uuidv4()}`,
    ...req.body,
    documents_collected: 0,
    status: 'active'
  };
  globalStore.addSource(newSource);
  res.json(newSource);
});
router.put('/sources/:id', requireAuth, requireRole(['admin']), (req, res) => {
  globalStore.updateSource(req.params.id, req.body);
  res.json({ success: true });
});
router.delete('/sources/:id', requireAuth, requireRole(['admin']), (req, res) => {
  globalStore.deleteSource(req.params.id);
  res.json({ success: true });
});

// -- PARTNERS --
router.get('/partners', requireAuth, requireRole(['admin']), (req, res) => {
  const partners = globalStore.users.filter(u => u.role === 'partner');
  res.json(partners);
});
router.post('/partners', requireAuth, requireRole(['admin']), (req, res) => {
  const newPartner: User = {
    id: `partner-${uuidv4()}`,
    role: 'partner',
    ...req.body
  };
  globalStore.addUser(newPartner);
  res.json(newPartner);
});
router.put('/partners/:id', requireAuth, requireRole(['admin']), (req, res) => {
  globalStore.updateUser(req.params.id, req.body);
  res.json({ success: true });
});
router.delete('/partners/:id', requireAuth, requireRole(['admin']), (req, res) => {
  globalStore.deleteUser(req.params.id);
  res.json({ success: true });
});

// -- HISTORY --
router.get('/history', requireAuth, requireRole(['admin']), (req, res) => {
  res.json(globalStore.history);
});

// -- COLLECTOR --
router.get('/collector', requireAuth, requireRole(['admin']), (req, res) => {
  res.json({
    status: collector.status,
    interval_ms: collector.intervalMs,
    last_run: collector.lastRun,
    documents_indexed_today: collector.docsIndexedToday,
    errors_today: collector.errorsToday,
    adapters: globalStore.sources.filter(s => s.status === 'active').map(s => s.name)
  });
});
router.post('/collector/start', requireAuth, requireRole(['admin']), (req, res) => {
  collector.start(collector.intervalMs);
  res.json({ success: true });
});
router.post('/collector/stop', requireAuth, requireRole(['admin']), (req, res) => {
  collector.stop();
  res.json({ success: true });
});
router.post('/collector/force', requireAuth, requireRole(['admin']), async (req, res) => {
  await collector.collect();
  res.json({ success: true });
});

export default router;
