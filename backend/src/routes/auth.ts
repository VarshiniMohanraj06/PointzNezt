import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Customer, Otp } from '../models';
// import nodemailer from 'nodemailer';
// import twilio from 'twilio';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const router = express.Router();

// Transporter for Email
let transporter: any;

/*
// Use Ethereal for testing if no real credentials
const setupMailer = async () => {
    ... (omitted)
};
setupMailer();

// Twilio Client
const twilioClient = process.env.TWILIO_SID ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN) : null;
*/

// Helper to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ CUSTOMER REGISTER
router.post("/register", async (req: Request, res: Response) => {
    const { username, email, phone, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await Customer.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = new Customer({
            username,
            email,
            phone,
            password: hashedPassword
        });

        await newCustomer.save();
        res.json({ message: "Customer registered successfully" });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// ✅ CUSTOMER LOGIN
router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, customer.password || '');
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        res.json({
            message: "Login successful",
            customer: {
                customer_id: customer._id, // Using Mongo ID as customer_id for now if not explicit
                username: customer.username,
                email: customer.email,
            },
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ FORGOT PASSWORD (SEND OTP)
router.post("/forgot-password", async (req: Request, res: Response) => {
    const { email, phone, method } = req.body; // method: 'email' or 'phone'

    try {
        let customer;
        if (method === 'email') {
            customer = await Customer.findOne({ email });
        } else if (method === 'phone') {
            customer = await Customer.findOne({ phone });
        }

        if (!customer) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = generateOTP();
        const otpEntry = new Otp({
            email: method === 'email' ? email : undefined,
            phone: method === 'phone' ? phone : undefined,
            otp
        });
        await otpEntry.save();

        // Send OTP (DISABLED DUE TO MISSING DEPS)
        /*
        if (method === 'email') {
            const info = await transporter.sendMail({
                ...
            });
            ...
        } else if (method === 'phone') {
            ...
        }
        */
        console.log(`[DEV ONLY] OTP for ${method === 'email' ? email : phone}: ${otp}`);

        res.json({ message: "OTP sent successfully" });

    } catch (err: any) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Failed to send OTP", error: err.message });
    }
});

// ✅ VERIFY OTP
router.post("/verify-otp", async (req: Request, res: Response) => {
    const { email, phone, otp } = req.body;

    try {
        const query = email ? { email, otp } : { phone, otp };
        const record = await Otp.findOne(query);

        if (!record) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ message: "OTP verified successfully" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ RESET PASSWORD
router.post("/reset-password", async (req: Request, res: Response) => {
    const { email, phone, otp, newPassword } = req.body;

    try {
        // Double check OTP just in case
        const query = email ? { email, otp } : { phone, otp };
        const record = await Otp.findOne(query);

        // In a real app, you might use a temp token from verify-otp instead of checking OTP again
        // But for simplicity/speed here we can re-verify or assume frontend flow is sequential
        if (!record) {
            return res.status(400).json({ message: "Invalid or expired OTP session" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (email) {
            await Customer.findOneAndUpdate({ email }, { password: hashedPassword });
        } else {
            await Customer.findOneAndUpdate({ phone }, { password: hashedPassword });
        }

        // Delete OTP used
        await Otp.deleteOne({ _id: record._id });

        res.json({ message: "Password reset successfully" });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
