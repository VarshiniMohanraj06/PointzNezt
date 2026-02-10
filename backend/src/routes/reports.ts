import express, { Request, Response } from 'express';
import { Visit } from '../models';

const router = express.Router();

// GET /api/reports/revenue
router.get('/revenue', async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Current Month Revenue
        const currentMonthVisits = await Visit.find({
            visit_date: { $gte: startOfCurrentMonth }
        });
        const currentRevenue = currentMonthVisits.reduce((sum, v) => sum + (v.amount_spent || 0), 0);

        // 2. Last Month Revenue (for Growth)
        const lastMonthVisits = await Visit.find({
            visit_date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const lastRevenue = lastMonthVisits.reduce((sum, v) => sum + (v.amount_spent || 0), 0);

        let growthPercentage = 0;
        if (lastRevenue > 0) {
            growthPercentage = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        } else if (currentRevenue > 0) {
            growthPercentage = 100; // 100% growth if started from 0
        }

        // 3. Loyalty Impact
        // Fetch all visits to determine repeat customers
        // Ideally this should be an aggregation for scalability, but JS logic is fine for now
        const allVisits = await Visit.find();
        const customerVisits: { [key: string]: number } = {};

        allVisits.forEach(v => {
            const cid = v.customer_id.toString();
            customerVisits[cid] = (customerVisits[cid] || 0) + 1;
        });

        // Calculate revenue from customers with > 1 visit
        let loyaltyRevenue = 0;
        let totalAllTimeRevenue = 0; // Or should this be monthly? User screenshot implies "of revenue" generally. 
        // Let's stick to Current Month Loyalty Impact for consistency with Left Card? 
        // Or aggregate all time? "Loyalty Program Impact" usually implies overall.
        // Let's calculate percentage of *Current Month* revenue that comes from Loyalty Members (Repeat Customers)

        currentMonthVisits.forEach(v => {
            const cid = v.customer_id.toString();
            if (customerVisits[cid] > 1) { // They are a repeat customer/loyalty member
                loyaltyRevenue += (v.amount_spent || 0);
            }
        });

        let loyaltyImpactPercentage = 0;
        if (currentRevenue > 0) {
            loyaltyImpactPercentage = (loyaltyRevenue / currentRevenue) * 100;
        }

        res.json({
            currentRevenue,
            lastRevenue,
            growthPercentage: Math.round(growthPercentage),
            loyaltyImpactPercentage: Math.round(loyaltyImpactPercentage)
        });

    } catch (err: any) {
        console.error("Error fetching revenue reports:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/reports/export
router.get('/export', async (req: Request, res: Response) => {
    try {
        const visits = await Visit.find().populate('customer_id', 'username email');

        // Manual CSV generation
        const headers = ['Date', 'Customer Name', 'Email', 'Amount ($)', 'Points Earned', 'Food', 'Service', 'Tax'];
        const rows = visits.map((v: any) => {
            const date = v.visit_date ? new Date(v.visit_date).toLocaleDateString() : 'N/A';
            const name = v.customer_id ? v.customer_id.username : 'Unknown';
            const email = v.customer_id ? v.customer_id.email : 'Unknown';
            const amount = v.amount_spent;
            const points = v.points_earned;

            // Handle breakdown if exists
            const food = v.bill_breakdown?.food || 0;
            const service = v.bill_breakdown?.services || 0;
            const tax = v.bill_breakdown?.tax || 0;

            return `${date},"${name}","${email}",${amount},${points},${food},${service},${tax}`;
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.csv');
        res.status(200).send(csvContent);

    } catch (err: any) {
        console.error("Error exporting report:", err);
        res.status(500).send("Error generating report");
    }
});

// GET /api/reports/spend-analyzer?month=2026-02
router.get('/spend-analyzer', async (req: Request, res: Response) => {
    try {
        const monthParam = req.query.month as string;

        // Parse month or default to current month
        let targetDate: Date;
        if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
            const [year, month] = monthParam.split('-').map(Number);
            targetDate = new Date(year, month - 1, 1);
        } else {
            targetDate = new Date();
            targetDate.setDate(1);
        }

        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

        // Query visits for the selected month with ordered items
        const visits = await Visit.find({
            visit_date: { $gte: startOfMonth, $lte: endOfMonth },
            ordered_items: { $exists: true, $ne: [] }
        }).populate('customer_id', 'username email');

        // Aggregate menu item sales data
        interface ItemStats {
            itemId: string;
            itemName: string;
            totalQuantity: number;
            totalRevenue: number;
            customerPurchases: Map<string, { customerId: string; customerName: string; quantity: number; totalSpent: number }>;
        }

        const itemStatsMap = new Map<string, ItemStats>();

        visits.forEach((visit: any) => {
            if (!visit.ordered_items || visit.ordered_items.length === 0) return;

            visit.ordered_items.forEach((item: any) => {
                const itemId = item.menu_item_id?.toString() || item.menu_item_name;
                const itemName = item.menu_item_name || 'Unknown Item';
                const quantity = item.quantity || 1;
                const price = item.price || 0;
                const revenue = quantity * price;

                if (!itemStatsMap.has(itemId)) {
                    itemStatsMap.set(itemId, {
                        itemId,
                        itemName,
                        totalQuantity: 0,
                        totalRevenue: 0,
                        customerPurchases: new Map()
                    });
                }

                const stats = itemStatsMap.get(itemId)!;
                stats.totalQuantity += quantity;
                stats.totalRevenue += revenue;

                // Track customer purchases
                const customerId = visit.customer_id?._id?.toString() || 'unknown';
                const customerName = visit.customer_id?.username || 'Unknown';

                if (!stats.customerPurchases.has(customerId)) {
                    stats.customerPurchases.set(customerId, {
                        customerId,
                        customerName,
                        quantity: 0,
                        totalSpent: 0
                    });
                }

                const customerStats = stats.customerPurchases.get(customerId)!;
                customerStats.quantity += quantity;
                customerStats.totalSpent += revenue;
            });
        });

        // Convert to array and sort by quantity (fast-moving items)
        const fastMovingItems = Array.from(itemStatsMap.values())
            .map(stats => ({
                itemId: stats.itemId,
                itemName: stats.itemName,
                totalQuantity: stats.totalQuantity,
                totalRevenue: Math.round(stats.totalRevenue),
                topCustomers: Array.from(stats.customerPurchases.values())
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5) // Top 5 customers per item
                    .map(c => ({
                        customerId: c.customerId,
                        customerName: c.customerName,
                        quantity: c.quantity,
                        totalSpent: Math.round(c.totalSpent)
                    }))
            }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 10); // Top 10 fast-moving items

        const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

        res.json({
            month: monthStr,
            fastMovingItems
        });

    } catch (err: any) {
        console.error("Error fetching spend analyzer data:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

export default router;
