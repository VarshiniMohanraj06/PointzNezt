import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    customer_id: string;
    username: string;
    email: string;
    phone: string;
    password?: string;
    points: number;
    created_at: Date;
}

const CustomerSchema: Schema = new Schema({
    customer_id: { type: String, unique: true, sparse: true, default: null },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
});

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);

export interface IHotel extends Document {
    hotel_id: string;
    name: string; // Hotel Name
    owner_name: string;
    age: number;
    gender: string;
    email: string;
    phone: string;
    password?: string;
    hotel_type?: string;
    address?: string;
    created_at: Date;
}

const HotelSchema: Schema = new Schema({
    hotel_id: { type: String, unique: true, sparse: true, default: null },
    name: { type: String, required: true },
    owner_name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    hotel_type: { type: String },
    address: { type: String },
    created_at: { type: Date, default: Date.now },
});

export const Hotel = mongoose.model<IHotel>('Hotel', HotelSchema);

export interface IFeedback extends Document {
    customer_id: mongoose.Types.ObjectId;
    hotel_id: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    feedback_date: Date;
    created_at: Date;
}

const FeedbackSchema: Schema = new Schema({
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: false }, // Optional for legacy
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    feedback_date: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
});

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export interface IVisit extends Document {
    customer_id: mongoose.Types.ObjectId;
    hotel_id: mongoose.Types.ObjectId;
    visit_date: Date;
    amount_spent: number;
    rating?: number;
    points_earned: number;
    ordered_items?: Array<{
        menu_item_id: mongoose.Types.ObjectId;
        menu_item_name: string;
        quantity: number;
        price: number;
    }>;
    bill_breakdown?: {
        food: number;
        services: number;
        tax: number;
        total: number;
    };
    created_at: Date;
}

const VisitSchema: Schema = new Schema({
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    visit_date: { type: Date, required: true },
    amount_spent: { type: Number, required: true },
    rating: { type: Number },
    points_earned: { type: Number, default: 0 },
    ordered_items: [{
        menu_item_id: { type: Schema.Types.ObjectId, ref: 'Menu' },
        menu_item_name: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 }
    }],
    bill_breakdown: {
        food: { type: Number, default: 0 },
        services: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    created_at: { type: Date, default: Date.now },
});

export const Visit = mongoose.model<IVisit>('Visit', VisitSchema);

export * from './Otp';
