import mongoose from 'mongoose';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { setOtp, getAndValidateOtp } from '../util/otpStore.js';
import { sendOtpEmail } from '../util/emailService.js';

const validRoles = ['Admin', 'Customer'];
const USERS_COLLECTION = 'users'; // same as User model collection name

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured. Add it to server/.env');
    }
    return jwt.sign({ id: String(id) }, secret, { expiresIn: '30d' });
};

function getErrorMessage(error) {
    const msg = error && error.message && typeof error.message === 'string' ? error.message.trim() : '';
    if (msg === 'next is not a function' || msg.toLowerCase().includes('next is not a function')) {
        return 'Server error. Restart the backend (Ctrl+C, then from server folder: npm run dev) and try again.';
    }
    if (msg) return msg;
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
        return 'Cannot connect to the database. Check MONGO_URI in server/.env and that MongoDB is reachable.';
    }
    if (error.name === 'MongoAuthenticationError') {
        return 'Database authentication failed. Check MONGO_URI username and password in server/.env';
    }
    return 'Server error. Please try again later.';
}

export const registerUser = async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body !== 'object') {
            return res.status(400).json({ message: 'Invalid request. Send JSON with name, email, password, role.' });
        }
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const trimmedRole = role?.trim();
        if (!validRoles.includes(trimmedRole)) {
            return res.status(400).json({ message: 'Please select a valid role (Admin or Customer)' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const db = mongoose.connection.db;
        if (!db) {
            return res.status(503).json({ message: 'Database not connected. Restart the backend.' });
        }
        const usersColl = db.collection(USERS_COLLECTION);

        const userExists = await usersColl.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doc = {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: trimmedRole
        };
        const result = await usersColl.insertOne(doc);
        const insertedId = result.insertedId;
        if (!insertedId) {
            return res.status(400).json({ message: 'Invalid user data' });
        }

        const token = generateToken(insertedId);
        return res.status(201).json({
            _id: String(insertedId),
            name: doc.name,
            email: doc.email,
            role: doc.role,
            token
        });
    } catch (error) {
        console.error('Register Error:', error);
        if (error.name === 'ValidationError' && error.errors) {
            const message = Object.values(error.errors).map(e => e.message).join(' ');
            return res.status(400).json({ message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        let message = getErrorMessage(error);
        if (/next\s*is\s*not\s*a\s*function/i.test(String(message))) {
            message = 'Server error. Restart the backend (Ctrl+C, then from the server folder run: npm run dev) and try again.';
        }
        return res.status(500).json({ message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ _id: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUserByAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body || {};
        if (!name?.trim() || !email?.trim() || !password || !role?.trim()) {
            return res.status(400).json({ message: 'Please fill all fields (name, email, password, role)' });
        }
        const trimmedRole = role.trim();
        if (!validRoles.includes(trimmedRole)) {
            return res.status(400).json({ message: 'Role must be Admin or Customer' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: trimmedRole
        });
        const userObj = newUser.toObject ? newUser.toObject() : newUser;
        delete userObj.password;
        return res.status(201).json(userObj);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'User already exists with this email' });
        res.status(500).json({ message: error.message || 'Failed to create user' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body !== 'object') {
            return res.status(400).json({ message: 'Invalid request. Send JSON with email and password.' });
        }
        const { email, password } = body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json({
            _id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login Error:', error);
        const message = getErrorMessage(error);
        return res.status(500).json({ message });
    }
};

export const loginVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body || {};
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }
        const result = getAndValidateOtp(email.trim().toLowerCase(), otp, 'login');
        if (!result.valid) {
            return res.status(400).json({ message: result.message || 'Invalid or expired OTP' });
        }
        const userId = result.data.userId;
        if (!userId) {
            return res.status(400).json({ message: 'Invalid OTP session' });
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const userObj = user.toObject ? user.toObject() : user;
        return res.json({
            _id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login verify OTP Error:', error);
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};

export const registerSendOtp = async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body !== 'object') {
            return res.status(400).json({ message: 'Invalid request. Send JSON with name, email, password, role.' });
        }
        const { name, email, password, role } = body;

        if (!name?.trim() || !email?.trim() || !password) {
            const msg = 'Please fill all fields (name, email, password).';
            return res.status(400).json({ message: msg });
        }
        const trimmedRole = (role && role.trim()) ? role.trim() : 'Customer';
        if (!validRoles.includes(trimmedRole)) {
            return res.status(400).json({ message: 'Invalid role.' });
        }
        if (trimmedRole !== 'Customer') {
            return res.status(400).json({ message: 'Registration is for customers only. Admin accounts are managed separately.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email. Use a different email or sign in.' });
        }

        const otp = setOtp(normalizedEmail, 'register', {
            name: name.trim(),
            password,
            role: trimmedRole
        });
        try {
            await sendOtpEmail(normalizedEmail, otp, 'Verify your email');
        } catch (emailErr) {
            console.error('Register send OTP – email failed:', emailErr);
            return res.status(503).json({ message: 'Could not send OTP email. Check server SMTP settings and logs.' });
        }

        return res.json({ message: 'OTP sent to your email. Enter it below to complete registration.', email: normalizedEmail });
    } catch (error) {
        console.error('Register send OTP Error:', error);
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};

export const registerVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body || {};
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }
        const result = getAndValidateOtp(email.trim().toLowerCase(), otp, 'register');
        if (!result.valid) {
            return res.status(400).json({ message: result.message || 'Invalid or expired OTP' });
        }
        const payload = result.data.payload;
        if (!payload || !payload.name || !payload.password || !payload.role) {
            return res.status(400).json({ message: 'Invalid OTP session. Please register again.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(payload.password, salt);
        const newUser = await User.create({
            name: payload.name,
            email: normalizedEmail,
            password: hashedPassword,
            role: payload.role
        });

        const token = generateToken(newUser._id);
        return res.status(201).json({
            _id: String(newUser._id),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token
        });
    } catch (error) {
        console.error('Register verify OTP Error:', error);
        if (error.code === 11000) return res.status(400).json({ message: 'User already exists with this email' });
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};
        if (!email?.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.json({ message: 'If an account exists with this email, you will receive an OTP.' });
        }
        const otp = setOtp(normalizedEmail, 'reset');
        await sendOtpEmail(normalizedEmail, otp, 'Reset password');
        return res.json({ message: 'OTP sent to your email. Check your inbox and enter the code below.', email: normalizedEmail });
    } catch (error) {
        console.error('Forgot password Error:', error);
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body || {};
        if (!email?.trim() || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        const result = getAndValidateOtp(email.trim().toLowerCase(), otp, 'reset');
        if (!result.valid) {
            return res.status(400).json({ message: result.message || 'Invalid or expired OTP' });
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        console.error('Reset password Error:', error);
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
