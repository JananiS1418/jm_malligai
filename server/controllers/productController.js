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
    const { name, nameTamil, category, price, status, weightOptions } = req.body;
    const body = {
        name: (name && name.trim()) || undefined,
        nameTamil: (nameTamil && nameTamil.trim()) || undefined,
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
            nameTamil: body.nameTamil || undefined,
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
        if (body.nameTamil !== undefined) update.nameTamil = body.nameTamil;
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

/**
 * Match product names from bill (English or Tamil).
 * POST /api/products/match-by-names
 * Body: { names: string[] }
 * Returns: { matched: { requested: string, product: Product }[], notFound: string[] }
 */
export const matchProductsByNames = async (req, res) => {
    try {
        const names = req.body.names;
        if (!Array.isArray(names)) {
            return res.status(400).json({ message: 'Body must include names array' });
        }
        const trimmed = names.map((n) => (n && String(n).trim())).filter(Boolean);
        if (trimmed.length === 0) {
            return res.json({ matched: [], notFound: [] });
        }

        const products = await Product.find({ status: 'Active' }).lean();

        function normalizeForMatch(str) {
            if (!str || typeof str !== 'string') return '';
            return str
                .replace(/\s*\d+[\d.,]*\s*$/g, '')
                .replace(/^\s*\d+[\d.,]*\s*/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        /** Normalize Tamil for OCR confusions (common misread characters). */
        function normalizeTamil(str) {
            if (!str || typeof str !== 'string') return '';
            let s = str.trim();
            const map = {
                '\u0BB7': '\u0B9A',
                '\u0B99': '\u0B9E',
                '\u0BA9': '\u0BA3',
                '\u0BB1': '\u0BB0',
                '\u0B9C': '\u0B9A',
                '\u0B9F': '\u0B9E',
                '\u0BA4': '\u0BA4',
                '\u0BA8': '\u0BA9',
                '\u0B95': '\u0B95',
                '\u0B86': '\u0B85',
                '\u0B88': '\u0B87',
                '\u0B8A': '\u0B89',
                '\u0B8E': '\u0B8F',
                '\u0B90': '\u0B8F',
                '\u0B92': '\u0B93',
                '\u0B94': '\u0B93',
            };
            for (const [from, to] of Object.entries(map)) {
                s = s.split(from).join(to);
            }
            // Remove punctuation/zero-widths that OCR often inserts
            s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');
            s = s.replace(/[.,'"“”‘’`~!@#$%^&*()\-_=+\[\]{};:|\\/?<>]/g, ' ');
            return s.replace(/\s+/g, ' ').trim();
        }

        function hasTamil(str) {
            return /[\u0B80-\u0BFF]/.test(str || '');
        }

        function levenshtein(a, b) {
            if (a === b) return 0;
            const al = a.length, bl = b.length;
            if (al === 0) return bl;
            if (bl === 0) return al;
            const dp = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
            for (let i = 0; i <= al; i++) dp[i][0] = i;
            for (let j = 0; j <= bl; j++) dp[0][j] = j;
            for (let i = 1; i <= al; i++) {
                for (let j = 1; j <= bl; j++) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1,
                        dp[i - 1][j - 1] + cost
                    );
                }
            }
            return dp[al][bl];
        }

        /** Normalize for matching: trim, collapse spaces, remove trailing/leading numbers and kg/g. */
        function normalizeInput(str) {
            if (!str || typeof str !== 'string') return '';
            return str
                .replace(/\s+/g, ' ')
                .replace(/\s*\d+[\d.,]*\s*(kg|g|gm|gms)?\s*$/gi, '')
                .replace(/^\s*\d+[\d.,]*\s*/g, '')
                .trim();
        }

        function findMatch(inputName) {
            const raw = (inputName || '').trim().replace(/\s+/g, ' ').trim();
            if (!raw) return null;
            const inputNorm = normalizeInput(raw);
            const inputClean = normalizeForMatch(raw);
            const inputLower = (inputNorm || raw).toLowerCase();
            const inputCleanLower = inputClean.toLowerCase();
            const inputTrim = raw.trim();
            const inputNormTa = normalizeTamil(raw);
            const inputCleanNormTa = normalizeTamil(inputClean);
            const inputIsTamil = hasTamil(raw) || hasTamil(inputNormTa);

            for (const p of products) {
                const nameEn = (p.name || '').toLowerCase().trim();
                const nameTa = (p.nameTamil || '').trim();
                const nameTaNorm = normalizeTamil(nameTa);
                const nameIsTamil = hasTamil(nameTa) || hasTamil(nameTaNorm);

                let matchEnglish = nameEn && (
                    nameEn === inputLower ||
                    nameEn === inputCleanLower ||
                    nameEn.includes(inputLower) ||
                    inputLower.includes(nameEn) ||
                    nameEn.includes(inputCleanLower) ||
                    inputCleanLower.includes(nameEn)
                );

                // Fuzzy English for OCR typos (e.g. Orion→Onion, Tomata→Tomato) – allow 1–2 char edit distance
                let fuzzyEnglish = false;
                if (!matchEnglish && nameEn && inputLower.length >= 2 && inputLower.length <= 30) {
                    const d = levenshtein(nameEn, inputLower);
                    const maxLen = Math.max(nameEn.length, inputLower.length);
                    if (maxLen <= 6 && d <= 2) fuzzyEnglish = true;
                    else if (d <= 2 || (maxLen >= 4 && (d / maxLen) <= 0.4)) fuzzyEnglish = true;
                }
                // Word match: "Onion" matches "Small Onion", "Tomato" matches "Tomato"
                const productWords = nameEn.split(/\s+/).filter(Boolean);
                const inputWords = inputLower.split(/\s+/).filter(Boolean);
                const wordMatch = productWords.some((w) => w === inputLower || inputLower === w) ||
                    (inputWords.length === 1 && productWords.some((w) => w === inputWords[0] || w.includes(inputWords[0]) || inputWords[0].includes(w)));
                if (wordMatch && !matchEnglish) matchEnglish = true;

                const matchTamil = nameTa && (
                    nameTa === inputTrim ||
                    nameTa === inputClean ||
                    nameTa.includes(inputTrim) ||
                    inputTrim.includes(nameTa) ||
                    nameTa.includes(inputClean) ||
                    inputClean.includes(nameTa) ||
                    nameTaNorm.includes(inputNormTa) ||
                    inputNormTa.includes(nameTaNorm) ||
                    nameTaNorm.includes(inputCleanNormTa) ||
                    inputCleanNormTa.includes(nameTaNorm)
                );

                let fuzzyTamil = false;
                if (!matchTamil && inputIsTamil && nameIsTamil && inputCleanNormTa.length >= 3 && nameTaNorm.length >= 3) {
                    const d = levenshtein(inputCleanNormTa, nameTaNorm);
                    const maxLen = Math.max(inputCleanNormTa.length, nameTaNorm.length);
                    fuzzyTamil = d <= 2 || (maxLen >= 6 && (d / maxLen) <= 0.3);
                }

                if (matchEnglish || matchTamil || fuzzyEnglish) return p;
                if (fuzzyTamil) return p;
            }
            return null;
        }

        const matched = [];
        const notFound = [];
        const usedIds = new Set();

        for (const requested of trimmed) {
            const product = findMatch(requested);
            if (product && !usedIds.has(product._id.toString())) {
                matched.push({ requested, product });
                usedIds.add(product._id.toString());
            } else if (!product) {
                notFound.push(requested);
            }
        }

        res.json({ matched, notFound });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
