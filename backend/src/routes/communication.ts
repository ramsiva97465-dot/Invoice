import { Router } from 'express';
import { sendCommunication } from '../controllers/communicationController';

const router = Router();

// POST /api/v1/communication/send
router.post('/send', sendCommunication);

export default router;
