import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
  loginVerifyOtp,
  registerSendOtp,
  registerVerifyOtp,
  forgotPassword,
  resetPassword,
  getUsers,
  createUserByAdmin
} from '../controllers/userController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

function safeMessage(raw) {
    const s = (raw && String(raw).trim()) || '';
    if (/next\s*is\s*not\s*a\s*function/i.test(s)) {
        return 'Server error. Restart the backend (Ctrl+C, then from the server folder run: npm run dev) and try again.';
    }
    return s || 'Server error. Please try again later.';
}

// Wrap async handlers – handle errors here and never call next(), so we never trigger "next is not a function".
function wrapAsync(fn) {
    return (req, res) => {
        Promise.resolve(fn(req, res)).catch((err) => {
            if (res.headersSent) return;
            const raw = (err && err.message) != null ? err.message : '';
            res.status(500).json({ message: safeMessage(raw) });
        });
    };
}

router.post('/register', wrapAsync(registerUser));
router.post('/register/send-otp', wrapAsync(registerSendOtp));
router.post('/register/verify-otp', wrapAsync(registerVerifyOtp));
router.post('/login', wrapAsync(loginUser));
router.post('/login/verify-otp', wrapAsync(loginVerifyOtp));
router.post('/forgot-password', wrapAsync(forgotPassword));
router.post('/reset-password', wrapAsync(resetPassword));
router.get('/', protect, isAdmin, wrapAsync(getUsers));
router.post('/', protect, isAdmin, wrapAsync(createUserByAdmin));

export default router;
