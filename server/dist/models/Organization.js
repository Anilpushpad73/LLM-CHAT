import mongoose, { Schema } from 'mongoose';
const OrganizationSchema = new Schema({
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
export default mongoose.model('Organization', OrganizationSchema);
