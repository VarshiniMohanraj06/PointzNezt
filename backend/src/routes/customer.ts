import express, { Request, Response } from 'express';
import { Customer } from '../models';

const router = express.Router();

/* ADD CUSTOMER */
// Note: This seems redundant with auth/register but keeping for parity
router.post("/add", async (req: Request, res: Response) => {
    const { name, email, phone, points } = req.body;

    try {
        // Check if customer with this phone number already exists
        let customer = await Customer.findOne({ phone });

        if (customer) {
            // Update existing customer
            customer.username = name; // Update name in case it changed
            if (email) customer.email = email;

            // [FIX] Ensure customer has a PN-ID (for older records missing it)
            if (!customer.customer_id) {
                const year = new Date().getFullYear();
                const random = Math.floor(1000 + Math.random() * 9000);
                customer.customer_id = `PN-${year}-${random}`;
            }

            // [NOTE] We specifically DO NOT add points here anymore to avoid double counting
            // Points are added in /api/bill/create

            await customer.save();
            return res.json({ message: "Customer updated successfully", customer });
        }

        // Generate Customer ID: PN-YYYY-XXXX
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const customerId = `PN-${year}-${random}`;

        const newCustomer = new Customer({
            customer_id: customerId,
            username: name,
            email: email || undefined,
            phone,
            password: 'default',
            points: 0 // New customers start at 0, points added via bill
        });

        await newCustomer.save();
        res.json({ message: "Customer added successfully", customer: newCustomer });
    } catch (err: any) {
        console.error("Error handling customer:", err);
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
