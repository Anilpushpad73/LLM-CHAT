import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
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

export default mongoose.model<IChat>('Chat', ChatSchema);
