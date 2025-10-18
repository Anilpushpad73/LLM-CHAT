import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            credits: 1000
        });
        await user.save();
        const organization = new Organization({
            name: `${username}'s Organization`,
            members: [{
                    userId: user._id,
                    role: 'admin',
                    joinedAt: new Date()
                }]
        });
        await organization.save();
        user.activeOrganizationId = organization._id;
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                credits: user.credits,
                activeOrganizationId: user.activeOrganizationId
            }
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                credits: user.credits,
                activeOrganizationId: user.activeOrganizationId
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});
router.post('/google', async (req, res) => {
    try {
        const { googleId, email, username } = req.body;
        if (!googleId || !email || !username) {
            res.status(400).json({ error: 'Google authentication data required' });
            return;
        }
        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            user = new User({
                username,
                email,
                googleId,
                credits: 1000
            });
            await user.save();
            const organization = new Organization({
                name: `${username}'s Organization`,
                members: [{
                        userId: user._id,
                        role: 'admin',
                        joinedAt: new Date()
                    }]
            });
            await organization.save();
            user.activeOrganizationId = organization._id;
            await user.save();
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                credits: user.credits,
                activeOrganizationId: user.activeOrganizationId
            }
        });
    }
    catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Server error during Google authentication' });
    }
});
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                credits: user.credits,
                activeOrganizationId: user.activeOrganizationId
            }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
export default router;
