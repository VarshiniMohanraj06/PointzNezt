import express, { Request, Response } from 'express';
import { Customer } from '../models';

const router = express.Router();

/* ADD CUSTOMER */
// Note: This seems redundant with auth/register but keeping for parity
router.post("/add", async (req: Request, res: Response) => {
    const { name, email, phone, points } = req.body;

    try {
        // Generate Customer ID: PN-YYYY-XXXX
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const customerId = `PN-${year}-${random}`;

        const newCustomer = new Customer({
            customer_id: customerId,
            username: name, // Mapping name to username
            email,
            phone,
            password: 'default', // Legacy behavior
            points: points || 0
        });

        await newCustomer.save();
        res.json({ message: "Customer added successfully", customer: newCustomer });
    } catch (err: any) {
        console.error("Error adding customer:", err);
        res.status(500).json({ error: err.message || "Internal Server Error", details: err });
    }
});

/* GET ALL CUSTOMERS */
router.get("/all", async (req: Request, res: Response) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err: any) {
        res.status(500).json(err);
    }
});

export default router;
