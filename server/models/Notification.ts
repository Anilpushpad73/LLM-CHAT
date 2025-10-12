import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  type: 'global' | 'user';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['global', 'user'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
