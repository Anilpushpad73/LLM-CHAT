import mongoose, { Schema } from 'mongoose';
const MessageSchema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tokensUsed: {
        type: Number,
        default: 0
    },
    creditsDeducted: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
export default mongoose.model('Message', MessageSchema);
