import Address from '../models/Address.js';

const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addAddress = async (req, res) => {
    try {
        const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;
        if (!fullName?.trim() || !phone?.trim() || !addressLine1?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
            return res.status(400).json({ message: 'Please fill all required fields (name, phone, address, city, state, pincode)' });
        }
        const normalizedPhone = phone.trim().replace(/\s/g, '');
        if (!PHONE_REGEX.test(normalizedPhone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
        }
        const pincodeClean = String(pincode).trim();
        if (!/^\d{6}$/.test(pincodeClean)) {
            return res.status(400).json({ message: 'Pincode must be 6 digits' });
        }
        const count = await Address.countDocuments({ user: req.user._id });
        if (count >= 5) {
            return res.status(400).json({ message: 'You can add up to 5 addresses' });
        }
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const address = await Address.create({
            user: req.user._id,
            fullName: fullName.trim(),
            phone: normalizedPhone,
            addressLine1: addressLine1.trim(),
            addressLine2: (addressLine2 || '').trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincodeClean,
            isDefault: !!isDefault
        });
        res.status(201).json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
        if (!address) return res.status(404).json({ message: 'Address not found' });
        const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;
        if (fullName !== undefined) address.fullName = fullName.trim();
        if (phone !== undefined) {
            const normalizedPhone = String(phone).trim().replace(/\s/g, '');
            if (!PHONE_REGEX.test(normalizedPhone)) {
                return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
            }
            address.phone = normalizedPhone;
        }
        if (addressLine1 !== undefined) address.addressLine1 = addressLine1.trim();
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
        if (city !== undefined) address.city = city.trim();
        if (state !== undefined) address.state = state.trim();
        if (pincode !== undefined) {
            const pincodeClean = String(pincode).trim();
            if (!/^\d{6}$/.test(pincodeClean)) {
                return res.status(400).json({ message: 'Pincode must be 6 digits' });
            }
            address.pincode = pincodeClean;
        }
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
            address.isDefault = true;
        }
        await address.save();
        res.json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!address) return res.status(404).json({ message: 'Address not found' });
        res.json({ message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
