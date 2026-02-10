<script>

    // Global Data
    let customers = [];
    let feedbacks = [];

    // Navigation Elements
    const navItems = document.querySelectorAll(".nav-item");
    const pageContents = document.querySelectorAll(".page-content");
    const pageTitle = document.getElementById("page-title");
    const actionCards = document.querySelectorAll(".action-card");

    // Navigation Logic
    function switchPage(pageId) {
        navItems.forEach((item) => {
            if (item.getAttribute("data-page") === pageId) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        pageContents.forEach((page) => {
        page.classList.remove("active");
    if (page.id === `${pageId}-page`) {
        page.classList.add("active");

    const titleMap = {
        dashboard: "Hotel Owner Dashboard",
    "add-customer": "Add New Customer",
    "customer-management": "Customer Management",
    "loyalty-program": "Loyalty Program",
    "feedback-ratings": "Feedback & Ratings",
    "revenue-reports": "Revenue Reports",
                };
    if (pageTitle) pageTitle.textContent = titleMap[pageId];

    if (pageId === "customer-management") {
        loadCustomers();
                }
            }
        });
    }

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            const pageId = item.getAttribute("data-page");
            if (pageId) switchPage(pageId);
        });
    });

    actionCards.forEach((card) => {
        card.addEventListener("click", () => {
            const pageId = card.getAttribute("data-page");
            if (pageId) switchPage(pageId);
        });
    });

    // Bill Calculation Logic
    const foodInput = document.getElementById("food-beverages");
    const servicesInput = document.getElementById("other-services");
    const taxInput = document.getElementById("tax");
    const totalAmountSpan = document.getElementById("total-amount");
    const pointsEarnedDiv = document.getElementById("points-earned");
    let calculatedPoints = 0;

    function calculateTotal() {
        if (!foodInput || !servicesInput || !taxInput) return;

    const food = parseFloat(foodInput.value) || 0;
    const services = parseFloat(servicesInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;

    const total = food + services + tax;
    if (totalAmountSpan)
    totalAmountSpan.textContent = `$${total.toFixed(2)}`;

    calculatedPoints = Math.floor(total * 10);
    if (pointsEarnedDiv)
    pointsEarnedDiv.textContent = `${calculatedPoints} points`;
    }

    [foodInput, servicesInput, taxInput].forEach((input) => {
        if (input) input.addEventListener("input", calculateTotal);
    });

    // Customer Form Submission
    const customerForm = document.getElementById("customer-form");
    if (customerForm) {
        customerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("customer-name").value;
            const phone = document.getElementById("customer-phone").value;
            const email = document.getElementById("customer-email").value;

            try {
                const response = await fetch("http://localhost:3000/api/customer/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        points: calculatedPoints,
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Customer added successfully!");
                    customerForm.reset();
                    calculateTotal();
                    loadCustomers();
                } else {
                    alert("Error adding customer: " + (result.message || result.error || "Unknown error"));
                }
            } catch (err) {
                console.error(err);
                alert("Failed to connect to server.");
            }
        });
    }

    // Load Customers (API)
    async function loadCustomers() {
        const tableBody = document.getElementById("customers-table-body");
    const emptyState = document.getElementById("no-customers-message");
    const countDisplay = document.getElementById("total-customers-count");

    try {
            const response = await fetch("http://localhost:3000/api/customer/all");
    customers = await response.json();

    if (tableBody) {
                 if (Array.isArray(customers) && customers.length > 0) {
                    if (emptyState) emptyState.style.display = "none";
    tableBody.innerHTML = "";
                    customers.forEach((customer) => {
                        const row = document.createElement("tr");
    const displayId = customer.customer_id || (customer._id ? customer._id.substring(0, 8).toUpperCase() : 'N/A');
    row.innerHTML = `
    <td>#${displayId}</td>
    <td>${customer.username}</td>
    <td>${customer.email}</td>
    <td>${customer.phone}</td>
    <td><span class="badge badge-success">${customer.points || 0} pts</span></td>
    <td>
        <button class="btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
    </td>
    `;
    tableBody.appendChild(row);
                    });
    if (countDisplay) countDisplay.textContent = customers.length.toString();
                } else {
        tableBody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    if (countDisplay) countDisplay.textContent = "0";
                }
            }
    populateCustomerDropdown();
        } catch (err) {
        console.error(err);
        }
    }

    // Load Feedbacks (API)
    async function loadFeedbacks() {
        try {
            const res = await fetch('http://localhost:3000/api/feedback/all');
    feedbacks = await res.json();
    renderFeedbacks();
        } catch (err) {
        console.error('Error fetching feedbacks:', err);
        }
    }

    // Render Feedbacks
    function renderFeedbacks() {
        const container = document.getElementById('feedback-container');
    const noFeedbackMsg = document.getElementById('no-feedback-message');
    const filterElement = document.getElementById('feedback-filter');
    const filterValue = filterElement ? filterElement.value : 'all';

    if (!container) return;

    let filteredFeedbacks = feedbacks;
    if (filterValue !== 'all') {
            const rating = parseInt(filterValue);
            filteredFeedbacks = feedbacks.filter(f => Math.floor(f.rating) === rating);
        }

    if (filteredFeedbacks.length === 0) {
        container.innerHTML = '';
    if (noFeedbackMsg) noFeedbackMsg.style.display = 'block';
    return;
        }

    if (noFeedbackMsg) noFeedbackMsg.style.display = 'none';
    container.innerHTML = '';

        filteredFeedbacks.forEach(feedback => {
            const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';

    let starsHtml = '';
    const fullStars = Math.floor(feedback.rating);
    const hasHalfStar = feedback.rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
    if (hasHalfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - Math.ceil(feedback.rating);
    for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="far fa-star"></i>';

    const dateObj = new Date(feedback.feedback_date || feedback.date);
    const dateStr = dateObj.toLocaleDateString();

    feedbackItem.innerHTML = `
    <div class="feedback-customer">
        <div class="feedback-avatar">${(feedback.customerName || 'A').charAt(0)}</div>
        <div class="feedback-info">
            <div class="feedback-name">${feedback.customerName || 'Anonymous'}</div>
            <div class="feedback-comment">${feedback.comment}</div>
            <div style="font-size: 0.8rem; color: #999; margin-top: 2px;">${dateStr}</div>
        </div>
    </div>
    <div class="feedback-rating">
        ${starsHtml}
        <span>${feedback.rating}</span>
    </div>
    `;
    container.appendChild(feedbackItem);
        });
    }

    function populateCustomerDropdown() {
        const select = document.getElementById('feedback-customer-select');
    if (select) {
        select.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(c => {
                const option = document.createElement('option');
    option.value = c.id;
    option.textContent = `${c.username} (${c.email})`;
    select.appendChild(option);
            });
        }
    }

    // Add Feedback Modal
    const addFeedbackBtn = document.getElementById('add-feedback-btn');
    if (addFeedbackBtn) {
        addFeedbackBtn.addEventListener('click', () => {
            let modal = document.getElementById('add-feedback-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'add-feedback-modal';
                modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000;';
                modal.innerHTML = `
                    <div style="background:white;padding:2rem;border-radius:8px;width:90%;max-width:500px;">
                        <h3 style="margin-bottom:1rem; color: #333;">Add Feedback</h3>
                        <form id="add-feedback-form">
                            <div class="form-group">
                                <label style="display:block;margin-bottom:5px;">Customer</label>
                                <select id="feedback-customer-select" class="form-control" required style="width:100%;padding:10px;margin-bottom:15px;"></select>
                            </div>
                            <div class="form-group">
                                <label style="display:block;margin-bottom:5px;">Rating</label>
                                <select id="feedback-rating-select" class="form-control" required style="width:100%;padding:10px;margin-bottom:15px;">
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block;margin-bottom:5px;">Comment</label>
                                <textarea id="feedback-comment-text" class="form-control" rows="3" required style="width:100%;padding:10px;margin-bottom:15px;"></textarea>
                            </div>
                            <div style="display:flex;justify-content:flex-end;gap:10px;">
                                <button type="button" class="btn" style="background:#ccc;" onclick="document.getElementById('add-feedback-modal').style.display='none'">Cancel</button>
                                <button type="submit" class="btn btn-primary" style="background:#e67e22;color:white;border:none;padding:10px 20px;border-radius:4px;">Submit</button>
                            </div>
                        </form>
                    </div>
                `;
                document.body.appendChild(modal);

                const form = document.getElementById('add-feedback-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const customerId = document.getElementById('feedback-customer-select').value;
                        const rating = document.getElementById('feedback-rating-select').value;
                        const comment = document.getElementById('feedback-comment-text').value;

                        try {
                            const res = await fetch('http://localhost:3000/api/feedback/add', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ customer_id: customerId, rating, comment })
                            });
                            if (res.ok) {
                                alert('Feedback added!');
                                modal.style.display = 'none';
                                loadFeedbacks();
                                form.reset();
                            } else {
                                alert('Failed to add feedback');
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    });
                }
            }
            populateCustomerDropdown();
            modal.style.display = 'flex';
        });
    }

    const feedbackFilter = document.getElementById('feedback-filter');
    if (feedbackFilter) {
        feedbackFilter.addEventListener('change', renderFeedbacks);
    }

    // Loyalty Program Logic
    let loyaltyRanges = [
    {min: 0, max: 100, pointsPerDollar: 10, bonus: 0 },
    {min: 101, max: 500, pointsPerDollar: 12, bonus: 50 },
    {min: 501, max: 1000, pointsPerDollar: 15, bonus: 100 },
    {min: 1001, max: null, pointsPerDollar: 20, bonus: 200 },
    ];

    function renderLoyaltyRanges() {
        const tableBody = document.getElementById("range-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";

        loyaltyRanges.forEach((range, index) => {
            const row = document.createElement("tr");
    row.innerHTML = `
    <td>
        <div style="display: flex; align-items: center; gap: 5px;">
            <input type="number" class="form-control range-input min-input" value="${range.min}" min="0" placeholder="Min" data-index="${index}" style="width: 80px; padding: 5px;">
                <span>-</span>
                <input type="number" class="form-control range-input max-input" value="${range.max !== null ? range.max : ""}" min="1" placeholder="Max" data-index="${index}" style="width: 80px; padding: 5px;">
        </div>
    </td>
    <td>
        <input type="number" class="form-control range-input points-input" value="${range.pointsPerDollar}" min="1" placeholder="Pts" data-index="${index}" style="width: 80px; padding: 5px;">
    </td>
    <td>
        <input type="number" class="form-control range-input bonus-input" value="${range.bonus}" min="0" placeholder="Bonus" data-index="${index}" style="width: 80px; padding: 5px;">
    </td>
    <td style="text-align: right;">
        <button class="btn-icon delete" onclick="removeRange(${index})" title="Remove Range">
            <i class="fas fa-trash"></i>
        </button>
    </td>
    `;
    tableBody.appendChild(row);
        });
    }

    window.removeRange = function (index) {
        if (loyaltyRanges.length > 1) {
        loyaltyRanges.splice(index, 1);
    renderLoyaltyRanges();
        } else {
        alert("You need at least one range in the loyalty program.");
        }
    };

    const addRangeBtn = document.querySelector(".section-header button.btn-success");
    if (addRangeBtn) {
        addRangeBtn.addEventListener("click", () => {
            loyaltyRanges.push({
                min: (loyaltyRanges[loyaltyRanges.length - 1].max || 0) + 1,
                max: null,
                pointsPerDollar: 10,
                bonus: 0,
            });
            renderLoyaltyRanges();
        });
    }

    const applyRangesBtn = document.getElementById("apply-ranges-btn");
    if (applyRangesBtn) {
        applyRangesBtn.addEventListener("click", () => {
            const newRanges = [];
            let isValid = true;

            for (let i = 0; i < loyaltyRanges.length; i++) {
                const minInput = document.querySelector(`.min-input[data-index="${i}"]`);
                const maxInput = document.querySelector(`.max-input[data-index="${i}"]`);
                const pointsInput = document.querySelector(`.points-input[data-index="${i}"]`);
                const bonusInput = document.querySelector(`.bonus-input[data-index="${i}"]`);

                if (!minInput || !maxInput || !pointsInput || !bonusInput) continue;

                const min = parseFloat(minInput.value) || 0;
                const max = maxInput.value ? parseFloat(maxInput.value) : null;
                const pointsPerDollar = parseFloat(pointsInput.value) || 10;
                const bonus = parseFloat(bonusInput.value) || 0;

                if (max !== null && max <= min) {
                    alert(`Range ${i + 1}: Maximum must be greater than minimum.`);
                    isValid = false;
                    break;
                }

                newRanges.push({ min, max, pointsPerDollar, bonus });
            }

            if (isValid) {
                loyaltyRanges = newRanges;
                alert("Loyalty program ranges applied successfully!");
            }
        });
    }

    const resetRangesBtn = document.getElementById("reset-ranges-btn");
    if (resetRangesBtn) {
        resetRangesBtn.addEventListener("click", () => {
            if (confirm("Reset ranges to default?")) {
                loyaltyRanges = [
                    { min: 0, max: 100, pointsPerDollar: 10, bonus: 0 },
                    { min: 101, max: 500, pointsPerDollar: 12, bonus: 50 },
                    { min: 501, max: 1000, pointsPerDollar: 15, bonus: 100 },
                    { min: 1001, max: null, pointsPerDollar: 20, bonus: 200 },
                ];
                renderLoyaltyRanges();
            }
        });
    }

    // Initialization
    loadCustomers();
    loadFeedbacks();
    renderLoyaltyRanges();
</script>
