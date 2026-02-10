import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
    email?: string;
    phone?: string;
    otp: string;
    createdAt: Date;
}

const OtpSchema: Schema = new Schema({
    email: { type: String, required: false },
    phone: { type: String, required: false },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Expires in 5 minutes (300 seconds)
});

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
