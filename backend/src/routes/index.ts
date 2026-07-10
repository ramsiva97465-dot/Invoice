import { Router } from 'express';

const router = Router();

// Mount feature routes here as they are built:
// import invoiceRoutes from './invoices';
// router.use('/invoices', invoiceRoutes);
//
import communicationRoutes from './communication';
import paymentRoutes from './payment';

router.use('/communication', communicationRoutes);
router.use('/payments', paymentRoutes);

export default router;
