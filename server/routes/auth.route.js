import { Router } from 'express';
import passport from 'passport';
import * as AuthController from '../controllers/auth.controller.js';

const router = Router();

router.get('/google', 
  passport.authenticate('google', {
    scope: ['profile'],
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/' 
  }),
  AuthController.googleCallback
);

router.get('/me', AuthController.getMe);

router.post('/logout', AuthController.logout);

export default router;