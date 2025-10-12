import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  creditsDeducted?: number;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
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

export default mongoose.model<IMessage>('Message', MessageSchema);
