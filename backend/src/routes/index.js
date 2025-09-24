import { Router } from 'express';

import userRouter from './users.js';
import scanRouter from './scans.js';

const router = Router();

router.use('/users', userRouter);
router.use('/scans', scanRouter);

export default router;