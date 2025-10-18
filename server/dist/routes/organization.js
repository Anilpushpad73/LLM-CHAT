import express from 'express';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
router.get('/list', authenticate, async (req, res) => {
    try {
        const organizations = await Organization.find({
            'members.userId': req.userId
        }).populate('members.userId', 'username email');
        res.json({ organizations });
    }
    catch (error) {
        console.error('List organizations error:', error);
        res.status(500).json({ error: 'Server error fetching organizations' });
    }
});
router.get('/:orgId', authenticate, async (req, res) => {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findOne({
            _id: orgId,
            'members.userId': req.userId
        }).populate('members.userId', 'username email')
            .populate('invitations.invitedBy', 'username email');
        if (!organization) {
            res.status(404).json({ error: 'Organization not found' });
            return;
        }
        res.json({ organization });
    }
    catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({ error: 'Server error fetching organization' });
    }
});
router.post('/create', authenticate, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            res.status(400).json({ error: 'Organization name is required' });
            return;
        }
        const organization = new Organization({
            name: name.trim(),
            members: [{
                    userId: req.userId,
                    role: 'admin',
                    joinedAt: new Date()
                }]
        });
        await organization.save();
        const user = await User.findById(req.userId);
        if (user) {
            user.activeOrganizationId = organization._id;
            await user.save();
        }
        res.status(201).json({ organization });
    }
    catch (error) {
        console.error('Create organization error:', error);
        res.status(500).json({ error: 'Server error creating organization' });
    }
});
router.put('/:orgId/rename', authenticate, async (req, res) => {
    try {
        const { orgId } = req.params;
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            res.status(400).json({ error: 'Organization name is required' });
            return;
        }
        const organization = await Organization.findOne({
            _id: orgId,
            'members': {
                $elemMatch: {
                    userId: req.userId,
                    role: 'admin'
                }
            }
        });
        if (!organization) {
            res.status(403).json({ error: 'Not authorized to rename this organization' });
            return;
        }
        organization.name = name.trim();
        await organization.save();
        res.json({ organization });
    }
    catch (error) {
        console.error('Rename organization error:', error);
        res.status(500).json({ error: 'Server error renaming organization' });
    }
});
router.post('/:orgId/invite', authenticate, async (req, res) => {
    try {
        const { orgId } = req.params;
        const { email } = req.body;
        if (!email || !email.trim()) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        const organization = await Organization.findOne({
            _id: orgId,
            'members.userId': req.userId
        });
        if (!organization) {
            res.status(404).json({ error: 'Organization not found' });
            return;
        }
        const existingInvitation = organization.invitations.find(inv => inv.email === email.trim().toLowerCase() && inv.status === 'pending');
        if (existingInvitation) {
            res.status(400).json({ error: 'Invitation already sent to this email' });
            return;
        }
        organization.invitations.push({
            email: email.trim().toLowerCase(),
            invitedBy: req.userId,
            invitedAt: new Date(),
            status: 'pending'
        });
        await organization.save();
        const populatedOrg = await Organization.findById(organization._id)
            .populate('invitations.invitedBy', 'username email');
        res.status(201).json({
            message: 'Invitation sent successfully',
            organization: populatedOrg
        });
    }
    catch (error) {
        console.error('Invite member error:', error);
        res.status(500).json({ error: 'Server error sending invitation' });
    }
});
router.put('/switch/:orgId', authenticate, async (req, res) => {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findOne({
            _id: orgId,
            'members.userId': req.userId
        });
        if (!organization) {
            res.status(404).json({ error: 'Organization not found or access denied' });
            return;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        user.activeOrganizationId = organization._id;
        await user.save();
        res.json({
            message: 'Active organization switched successfully',
            activeOrganizationId: organization._id
        });
    }
    catch (error) {
        console.error('Switch organization error:', error);
        res.status(500).json({ error: 'Server error switching organization' });
    }
});
export default router;
