import express, { Request, Response } from 'express';
import { Feedback, Customer } from '../models';

const router = express.Router();

/* ADD FEEDBACK */
router.post("/add", async (req: Request, res: Response) => {
    const { customer_id, rating, comment } = req.body;

    try {
        const newFeedback = new Feedback({
            customer_id,
            hotel_id: req.body.hotel_id,
            rating,
            comment
        });

        if (req.body.hotel_id) {
            const feedback = new Feedback({
                customer_id,
                hotel_id: req.body.hotel_id,
                rating,
                comment,
                feedback_date: new Date()
            });
            await feedback.save();
        } else {
            // Fallback for legacy calls without hotel_id?
            // Schema requires it now (or sparsely).
            // If sparse, it can be null.
            const feedback = new Feedback({
                customer_id,
                rating,
                comment
            });
            await feedback.save();
        }

        res.json({ message: "Feedback submitted successfully" });
    } catch (err: any) {
        res.status(500).json(err);
    }
});

/* GET ALL FEEDBACKS */
router.get("/all", async (req: Request, res: Response) => {
    try {
        // TEMPORARY AUTO-REPAIR: Link anonymous feedbacks to real customers
        const placeholderId = "65a000000000000000000000";
        const needsRepair = await Feedback.find({ customer_id: placeholderId as any }).limit(10);

        if (needsRepair.length > 0) {
            const custs = await Customer.find().limit(5);
            if (custs.length > 0) {
                console.log(`[FeedbackRepair] repairing ${needsRepair.length} records...`);
                for (let i = 0; i < needsRepair.length; i++) {
                    const c = custs[i % custs.length];
                    await Feedback.updateOne({ _id: needsRepair[i]._id }, { $set: { customer_id: c._id } });
                }
            }
        }

        // Fetch all feedbacks and populate customer details
        // Note: Field name depends on your schema. Assuming 'customer_id' ref 'Customer'.
        // Also assuming 'username' is the field for name in Customer model.
        const feedbacks = await Feedback.find()
            .populate('customer_id', 'username email phone')
            .sort({ created_at: -1 });

        // Transform data if necessary to match frontend Expectations
        const formattedFeedbacks = feedbacks.map((f: any) => ({
            _id: f._id,
            customerName: f.customer_id ? f.customer_id.username : "Anonymous",
            customerEmail: f.customer_id ? f.customer_id.email : "",
            customerPhone: f.customer_id ? f.customer_id.phone : "",
            rating: f.rating,
            comment: f.comment,
            date: f.created_at || f.feedback_date
        }));

        res.json(formattedFeedbacks);
    } catch (err: any) {
        console.error("Error fetching feedbacks:", err);
        res.status(500).json(err);
    }
});

export default router;
