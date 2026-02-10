import express, { Request, Response } from 'express';
import { Customer, Visit, Hotel } from '../models';

const router = express.Router();

// POST /api/bill/create
router.post('/create', async (req: Request, res: Response): Promise<void> => {
    try {
        const { customer_id, hotel_id, bill_details, points_earned } = req.body;

        if (!customer_id || !bill_details) {
            res.status(400).json({ error: 'Missing required fields: customer_id or bill_details' });
            return;
        }

        // Find customer to get MongoDB _id
        const customer = await Customer.findOne({ customer_id: customer_id });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }

        // Find Default Hotel or Use Provided
        let finalHotelId = hotel_id;

        console.log(`[Bill] Received hotel_id: ${hotel_id}`);

        if (!finalHotelId) {
            console.log('[Bill] No hotel_id provided. Looking for default...');
            // Fallback: Find the first hotel in DB or create a dummy one
            const defaultHotel = await Hotel.findOne();
            if (defaultHotel) {
                console.log(`[Bill] Found existing default hotel: ${defaultHotel._id}`);
                finalHotelId = defaultHotel._id;
            } else {
                console.log('[Bill] No hotels found. Creating specific Admin Hotel...');
                // If absolutely no hotel exists, create a default one (Migration/Safe Mode)
                try {
                    const newHotel = await Hotel.create({
                        name: "Default Hotel",
                        owner_name: "Admin",
                        age: 30,
                        gender: "N/A",
                        email: "admin@hotel.com",
                        phone: "0000000000",
                        password: "admin",
                        address: "Default Address"
                    });
                    finalHotelId = newHotel._id;
                    console.log(`[Bill] Created new default hotel: ${newHotel._id}`);
                } catch (createErr) {
                    // Fallback if create fails (e.g. unique email constraint if findOne failed for some reason?)
                    console.error('[Bill] Error creating default hotel:', createErr);
                    // Try to find one again just in case valid one exists now
                    const existing = await Hotel.findOne();
                    if (existing) finalHotelId = existing._id;
                }
            }
        }

        const { food, services, tax, total } = bill_details;

        // Create Visit (Bill)
        const visit = new Visit({
            customer_id: customer._id,
            hotel_id: finalHotelId,
            visit_date: new Date(),
            amount_spent: total,
            points_earned: points_earned || 0,
            bill_breakdown: {
                food: food || 0,
                services: services || 0,
                tax: tax || 0,
                total: total || 0
            }
        });

        await visit.save();

        // Update customer points
        customer.points += (points_earned || 0);
        await customer.save();

        res.status(201).json({
            message: 'Bill generated successfully',
            visit_id: visit._id,
            total_amount: total,
            points_added: points_earned
        });

    } catch (err: any) {
        console.error('Error creating bill:', err);
        res.status(500).json({ error: err.message || 'Internal server error', details: err });
    }
});

export default router;
