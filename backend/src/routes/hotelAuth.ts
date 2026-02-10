import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Hotel } from '../models';

const router = express.Router();

// ✅ HOTEL REGISTER
router.post("/hotel-register", async (req: Request, res: Response) => {
    // Expecting: fullName, age, gender, hotelType, email, phone, hotelName, address, password
    const {
        fullName,
        age,
        gender,
        hotelType,
        email,
        phone,
        hotelName,
        address,
        password
    } = req.body;

    try {
        // Check if hotel/email exists
        const existingHotel = await Hotel.findOne({ email });
        if (existingHotel) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newHotel = new Hotel({
            name: hotelName,
            owner_name: fullName,
            age: parseInt(age),
            gender,
            hotel_type: hotelType,
            email,
            phone,
            address,
            password: hashedPassword
        });

        await newHotel.save();
        res.json({ message: "Hotel registered successfully" });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// ✅ HOTEL LOGIN
router.post("/hotel-login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const hotel = await Hotel.findOne({ email });
        if (!hotel) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, hotel.password || '');
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        res.json({
            message: "Login successful",
            hotel: {
                id: hotel._id,
                name: hotel.name,
                owner: hotel.owner_name,
                email: hotel.email
            },
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
