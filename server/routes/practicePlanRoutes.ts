// T033 Practice Plan routes skeleton
import { Router } from 'express';
import {
  createPracticePlan,
  getPracticePlan,
  patchPracticePlan,
  deletePracticePlan,
  addAccess,
  removeAccess,
} from '../controllers/practicePlanController';
import verifyJWT from '../middleware/verifyJWT';

const router = Router();
router.use(verifyJWT as any); // apply auth middleware

router.post('/', createPracticePlan);
router.get('/:id', getPracticePlan);
router.patch('/:id', patchPracticePlan);
router.delete('/:id', deletePracticePlan);
router.post('/:id/access', addAccess);
router.delete('/:id/access/:accessId', removeAccess);

export default router;
