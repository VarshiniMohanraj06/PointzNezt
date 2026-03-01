const fetch = require('node-fetch');

async function verifyDeduplication() {
    const testCustomer = {
        name: "Test User",
        phone: "9999999999",
        points: 50
    };

    try {
        console.log("Adding customer first time...");
        let response = await fetch("http://localhost:7000/api/customer/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testCustomer)
        });
        let result = await response.json();
        console.log("First response:", result.message);

        console.log("Adding customer second time with more points...");
        response = await fetch("http://localhost:7000/api/customer/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...testCustomer, points: 30 })
        });
        result = await response.json();
        console.log("Second response:", result.message);
        console.log("Final points:", result.customer.points);

        if (result.message === "Customer updated successfully" && result.customer.points === 80) {
            console.log("✅ Backend Deduplication Verified!");
        } else {
            console.log("❌ Deduplication check failed.");
        }

    } catch (err) {
        console.error("Error:", err.message);
        console.log("Note: Make sure the server is running on port 7000.");
    }
}

verifyDeduplication();
