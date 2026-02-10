import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
    hotel_id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    is_available: boolean;
    image_url?: string;
    created_at: Date;
}

const MenuSchema: Schema = new Schema({
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true }, // Links to the Hotel Owner
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Starters', 'Main Course', 'Desserts & Beverages'] },
    is_available: { type: Boolean, default: true },
    image_url: { type: String },
    created_at: { type: Date, default: Date.now },
}, { collection: 'menu' });

export const Menu = mongoose.model<IMenuItem>('Menu', MenuSchema);
