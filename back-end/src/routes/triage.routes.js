import Router from 'express';
import { createTriage, getTriage, getAllTriage, updateTriage, updateTriageLevel } from '../triage/controller/triage.controller.js';
const router = Router();

router.post('/', createTriage);
router.get('/', getTriage);
router.get('/triages', getAllTriage);
router.post('/updateTriage', updateTriage);
router.post('/updateTriageLevel', updateTriageLevel);

export default router;