import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  credits: number;
  activeOrganizationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  credits: {
    type: Number,
    default: 1000
  },
  activeOrganizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
