import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
router.get('/list', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { type: 'global' },
                { userId: req.userId }
            ]
        }).sort({ createdAt: -1 });
        res.json({ notifications });
    }
    catch (error) {
        console.error('List notifications error:', error);
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
});
router.put('/:notificationId/read', authenticate, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findOneAndUpdate({
            _id: notificationId,
            $or: [
                { type: 'global' },
                { userId: req.userId }
            ]
        }, { read: true }, { new: true });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ notification });
    }
    catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Server error updating notification' });
    }
});
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.updateMany({
            $or: [
                { type: 'global' },
                { userId: req.userId }
            ],
            read: false
        }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Server error updating notifications' });
    }
});
export default router;
