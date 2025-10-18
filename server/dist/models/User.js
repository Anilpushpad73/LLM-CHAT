import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
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
        required: function () {
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
export default mongoose.model('User', UserSchema);
