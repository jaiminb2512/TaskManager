import { Router } from 'express';
import { signUp } from '../controllers/authController';

const router = Router();

// POST /api/auth/signup
router.post('/signup', signUp);

export default router;

