import express from 'express';
import { createOrder, getMyOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.put('/:id/status', isAdmin, updateOrderStatus);
router.get('/:id', getOrderById);

export default router;
