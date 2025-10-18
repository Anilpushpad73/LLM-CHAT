import mongoose, { Schema } from 'mongoose';
const ChatSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'New Chat'
    }
}, {
    timestamps: true
});
export default mongoose.model('Chat', ChatSchema);
