import Order from '../models/Order.js';

const PHONE_REGEX = /^[6-9]\d{9}$/;

export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, deliveryOption, phone } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        if (!shippingAddress || typeof shippingAddress !== 'object') {
            return res.status(400).json({ message: 'Shipping address is required' });
        }
        const { fullName, phone: addrPhone, addressLine1, city, state, pincode } = shippingAddress;
        const usePhone = (phone && String(phone).trim()) || (addrPhone && String(addrPhone).trim());
        if (!fullName?.trim() || !usePhone || !addressLine1?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
            return res.status(400).json({ message: 'Please provide complete address and mobile number' });
        }
        const normalizedPhone = usePhone.trim().replace(/\s/g, '');
        if (!PHONE_REGEX.test(normalizedPhone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
        }
        if (!/^\d{6}$/.test(String(pincode).trim())) {
            return res.status(400).json({ message: 'Pincode must be 6 digits' });
        }
        const validItems = items.map((item) => ({
            product: item.productId || item._id,
            name: item.name,
            price: Number(item.price),
            quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
            weight: Number(item.weight) || 1,
            image: item.image || undefined
        }));
        let totalAmount = 0;
        validItems.forEach((i) => { totalAmount += i.price * (i.weight || 1) * i.quantity; });
        const deliveryCharge = deliveryOption === 'Express' ? 49 : 0;
        totalAmount += deliveryCharge;
        const order = await Order.create({
            user: req.user._id,
            items: validItems,
            shippingAddress: {
                fullName: shippingAddress.fullName.trim(),
                phone: normalizedPhone,
                addressLine1: shippingAddress.addressLine1.trim(),
                addressLine2: (shippingAddress.addressLine2 || '').trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode: String(shippingAddress.pincode).trim()
            },
            deliveryOption: deliveryOption === 'Express' ? 'Express' : 'Standard',
            totalAmount: Math.round(totalAmount * 100) / 100,
            status: 'Pending',
            paymentStatus: 'Pending'
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { user: req.user._id };
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const VALID_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only admin can update order status' });
        }
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        const { status } = req.body;
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Valid status required: Pending, Confirmed, Shipped, Delivered, Cancelled' });
        }
        order.status = status;
        await order.save();
        const updated = await Order.findById(order._id).populate('user', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
