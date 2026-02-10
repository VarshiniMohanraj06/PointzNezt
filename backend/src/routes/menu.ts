import express, { Request, Response } from 'express';
import { Menu } from '../models/Menu'; // Adjust path if needed
import { Hotel } from '../models';

const router = express.Router();
console.log("DEBUG: Menu Router Loaded");

// Get all menu items for a specific hotel
router.get("/:hotelId", async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const items = await Menu.find({ hotel_id: hotelId });
        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching menu items:", err);
        res.status(500).json({ error: "Failed to fetch menu items" });
    }
});

// Add a new menu item
router.post("/add", async (req: Request, res: Response) => {
    try {
        const { hotel_id, name, description, price, category } = req.body;

        if (!hotel_id) {
            console.warn("Menu Add Error: Missing hotel_id in request");
            return res.status(401).json({ error: "Unauthorized: Missing hotel session (hotel_id)" });
        }

        const allowedCategories = ['Starters', 'Main Course', 'Desserts & Beverages'];
        if (!allowedCategories.includes(category)) {
            console.warn(`Menu Add Error: Invalid category "${category}"`);
            return res.status(400).json({ error: `Invalid category. Allowed: ${allowedCategories.join(', ')}` });
        }

        const newItem = new Menu({
            hotel_id,
            name,
            description,
            price,
            category,
            is_available: true
        });

        await newItem.save();
        console.log(`✅ Menu item added: ${name} for hotel ${hotel_id}`);
        res.status(201).json({ message: "Item added successfully", item: newItem });
    } catch (err: any) {
        console.error("Error adding menu item:", err);

        // Handle MongoDB/Mongoose validation or ObjectId errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: "Validation failed", details: err.message });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ error: "Invalid hotel_id format" });
        }

        res.status(500).json({ error: "Failed to add menu item", details: err.message });
    }
});

// Update item (Pause/Unpause or Edit)
router.put("/update/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body; // Expecting { is_available: boolean } or other fields

        const updatedItem = await Menu.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json({ message: "Item updated", item: updatedItem });
    } catch (err) {
        console.error("Error updating menu item:", err);
        res.status(500).json({ error: "Failed to update item" });
    }
});

// Delete an item
router.delete("/delete/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedItem = await Menu.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error("Error deleting menu item:", err);
        res.status(500).json({ error: "Failed to delete item" });
    }
});

export default router;
