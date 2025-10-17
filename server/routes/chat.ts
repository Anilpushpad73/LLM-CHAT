import express, { Response } from 'express';
import axios from 'axios';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AuthRequest, authenticate } from '../middleware/auth.js';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ✅ Gemini API endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.activeOrganizationId) {
      res.status(400).json({ error: 'No active organization' });
      return;
    }

    const chat = new Chat({
      userId: user._id,
      organizationId: user.activeOrganizationId,
      title: 'New Chat'
    });

    await chat.save();
    res.status(201).json({ chat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Server error creating chat' });
  }
});

router.get('/list', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.activeOrganizationId) {
      res.status(400).json({ error: 'No active organization' });
      return;
    }

    const chats = await Chat.find({
      userId: user._id,
      organizationId: user.activeOrganizationId
    }).sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('List chats error:', error);
    res.status(500).json({ error: 'Server error fetching chats' });
  }
});

router.get('/:chatId/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.userId
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});
router.put('/:chatId/title', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { title },
      { new: true }
    );

    res.json({ message: "Chat title updated", chat: updatedChat });
  } catch (err) {
    res.status(500).json({ error: "Failed to update title" });
  }
});

router.post('/:chatId/message', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const creditsRequired = 10;
    if (user.credits < creditsRequired) {
      res.status(403).json({ error: 'Insufficient credits' });
      return;
    }

    const chat = await Chat.findOne({ _id: chatId, userId: req.userId });
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    // Save user message
    const userMessage = new Message({
      chatId,
      role: 'user',
      content
    });
    await userMessage.save();

    // Get last 10 messages for context
    const previousMessages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(10);

    const conversationHistory = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let assistantContent = '';
    let tokensUsed = 0;

    try {
      const geminiApiKey = process.env.GOOGLE_API_KEY;
      if (!geminiApiKey) {
        assistantContent = `This is a simulated response. Please configure your GOOGLE_API_KEY in the .env file.`;
        tokensUsed = 50;
      } else {
        // ✅ Send request to Gemini API
        const messages = conversationHistory
          .map(m => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n");

        const prompt = `${messages}\nUSER: ${content}\nASSISTANT:`;

        const response = await axios.post(
          `${GEMINI_API_URL}?key=${geminiApiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          {
            headers: { "Content-Type": "application/json" }
          }
        );

        assistantContent =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response received from Gemini.";
        tokensUsed = 200; // Gemini doesn’t return token usage yet
      }
    
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Gemini API Axios Error:", error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error("Gemini SDK Error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      assistantContent = 'I apologize, but I encountered an error processing your request. Please try again.';
      tokensUsed = 50;
    }


    // Save assistant message
    const assistantMessage = new Message({
      chatId,
      role: 'assistant',
      content: assistantContent,
      tokensUsed,
      creditsDeducted: creditsRequired
    });
    await assistantMessage.save();

    // Deduct credits
    user.credits -= creditsRequired;
    await user.save();

    // Rename chat if still default
    if (chat.title === 'New Chat' && content.length > 0) {
      chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
      await chat.save();
    }

    res.json({
      userMessage,
      assistantMessage,
      remainingCredits: user.credits
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
});

router.delete('/:chatId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOneAndDelete({
      _id: chatId,
      userId: req.userId
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    await Message.deleteMany({ chatId });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Server error deleting chat' });
  }
});

export default router;

