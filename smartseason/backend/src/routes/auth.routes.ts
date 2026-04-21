import { Router } from 'express';
import { login, register, signup, resetPassword } from '../controllers/auth.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/reset-password', resetPassword);
router.post('/register', authenticate, requireAdmin, register);

export default router;
