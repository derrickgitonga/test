import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { 
  getFields, 
  createField, 
  getFieldById, 
  updateFieldStage, 
  addFieldUpdate, 
  getFieldUpdates 
} from '../controllers/field.controller';

const router = Router();

router.use(authenticate);

router.get('/', getFields);
router.post('/', requireAdmin, createField);
router.get('/:id', getFieldById);
router.patch('/:id/stage', updateFieldStage);
router.post('/:id/updates', addFieldUpdate);
router.get('/:id/updates', getFieldUpdates);

export default router;
