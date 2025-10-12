import mongoose, { Schema, Document } from 'mongoose';

export interface IMember {
  userId: mongoose.Types.ObjectId;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface IOrganization extends Document {
  name: string;
  members: IMember[];
  invitations: Array<{
    email: string;
    invitedBy: mongoose.Types.ObjectId;
    invitedAt: Date;
    status: 'pending' | 'accepted';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  invitations: [{
    email: {
      type: String,
      required: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
