import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

function parseWeightOptions(val) {
    if (!val) return undefined;
    try {
        const arr = typeof val === 'string' ? JSON.parse(val) : val;
        if (!Array.isArray(arr)) return undefined;
        return arr.map((o) => ({
            weight: Number(o.weight),
            label: String(o.label || ''),
            available: Boolean(o.available)
        })).filter((o) => !isNaN(o.weight) && o.label);
    } catch {
        return undefined;
    }
}

function buildProductBody(req) {
    const { name, category, price, status, weightOptions } = req.body;
    const body = {
        name: (name && name.trim()) || undefined,
        category: (category && category.trim()) || undefined,
        price: price !== undefined && price !== '' ? Number(price) : undefined,
        status: status || undefined,
    };
    if (req.file && req.file.filename) {
        body.image = '/uploads/' + req.file.filename;
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim()) {
        body.image = req.body.image.trim();
    }
    const wo = parseWeightOptions(weightOptions);
    if (wo !== undefined) body.weightOptions = wo;
    return body;
}

export const addProduct = async (req, res) => {
    try {
        const body = buildProductBody(req);
        if (!body.name || !body.category || body.price == null || body.price === '' || isNaN(body.price)) {
            return res.status(400).json({ message: 'Name, category and price are required' });
        }
        const product = await Product.create({
            name: body.name,
            category: body.category,
            price: body.price,
            status: body.status || 'Active',
            image: body.image || undefined,
            weightOptions: body.weightOptions || [],
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const body = buildProductBody(req);
        const update = {};
        if (body.name !== undefined) update.name = body.name;
        if (body.category !== undefined) update.category = body.category;
        if (body.price !== undefined) update.price = body.price;
        if (body.status !== undefined) update.status = body.status;
        if (body.image !== undefined) update.image = body.image;
        if (body.weightOptions !== undefined) update.weightOptions = body.weightOptions;

        const product = await Product.findByIdAndUpdate(id, update, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
