import Router from 'express';
import { createTriage, getAllTriage, updateTriage } from '../triage/controller/triage.controller.js';
const router = Router();

router.post('/create', createTriage);
router.get('/triages', getAllTriage);
router.put('/updateTriage', updateTriage);

export default router;