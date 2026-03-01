const fetch = require('node-fetch');

async function verifyFix() {
    const testPhone = "8888888888";

    try {
        console.log("Step 1: Ensure customer exists (should generate PN-ID and set points to 0)");
        let res = await fetch("http://localhost:7000/api/customer/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Verify User", phone: testPhone })
        });
        let customerResult = await res.json();
        console.log("Customer result:", customerResult.message, "ID:", customerResult.customer.customer_id);

        const customerId = customerResult.customer.customer_id;
        const initialPoints = customerResult.customer.points;

        console.log("\nStep 2: Create Bill (should add 2100 points for 210 spent at 10pts/unit)");
        res = await fetch("http://localhost:7000/api/bill/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_id: customerId,
                bill_details: { food: 210, total: 210 },
                points_earned: 2100
            })
        });
        let billResult = await res.json();
        console.log("Bill result:", billResult.message, "Points added:", billResult.points_added);

        console.log("\nStep 3: Check final points in customer record");
        res = await fetch("http://localhost:7000/api/customer/all");
        let allCustomers = await res.json();
        let customer = allCustomers.find(c => c.phone === testPhone);

        console.log("Final Customer Points:", customer.points);

        if (customer.points === 2100) {
            console.log("\n✅ SUCCESS: Points calculated correctly and bill generated!");
        } else {
            console.log("\n❌ FAILURE: Points mismatch. Expected 2100, got", customer.points);
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

verifyFix();
