import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { getUsers, assignField } from '../controllers/user.controller';
import { register } from '../controllers/auth.controller';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getUsers);
router.post('/', register);
router.patch('/:id/assign-field', assignField);

export default router;
