import express, { Request, Response } from 'express';
import { Hotel } from '../models';

const router = express.Router();

// Get all hotels (ID and Name only for dropdown)
router.get("/", async (req: Request, res: Response) => {
    try {
        const hotels = await Hotel.find({}, 'name _id');
        res.status(200).json(hotels);
    } catch (err) {
        console.error("Error fetching hotels:", err);
        res.status(500).json({ error: "Failed to fetch hotels" });
    }
});

export default router;
