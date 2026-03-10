import express from 'express';
const router = express.Router();
import { getProducts, addProduct, updateProduct, deleteProduct, matchProductsByNames } from '../controllers/productController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';

const withUpload = (req, res, next) => {
    uploadProductImage(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message || 'Invalid file' });
        next();
    });
};

router.get('/', getProducts);
router.post('/match-by-names', matchProductsByNames);
router.post('/', protect, isAdmin, withUpload, addProduct);
router.put('/:id', protect, isAdmin, withUpload, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
