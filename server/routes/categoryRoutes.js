import express from 'express';
const router = express.Router();
import { getCategories, addCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

router.get('/', getCategories);
router.post('/', protect, isAdmin, addCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;
