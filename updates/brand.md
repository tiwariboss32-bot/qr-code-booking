Here is a clean, comprehensive Product Requirement Document (PRD) tailored for an AI coding agent or developer. It outlines the exact file changes, logic, and implementation details needed to update your Vercel app.

---

# Product Requirement Document (PRD)

## Project: FoodDialer Upsell Integration & Feature Enhancements

**Target Application:** `qr-code-booking.vercel.app`

**Primary Objective:** Drive high-intent traffic to `[cubeonebiz.com/fooddialer/fooddialer.php](https://cubeonebiz.com/fooddialer/fooddialer.php)` through contextual placement, while introducing high-value features to boost retention.

---

## 1. Feature Specifications

### 1.1 Contextual Backlinks & Upsell Banners

* **Location A: Chef/Admin Dashboard Footer**
* **UI Component:** A fixed or sticky footer ribbon.
* **Copy:** *"Running a growing kitchen? Upgrade to **FoodDialer** to manage advanced meal subscriptions, automated delivery tracking, and full inventory logistics. [Explore Premium Features ➔]"*
* **Behavior:** Link must open `[https://www.cubeonebiz.com/fooddialer/fooddialer.php](https://www.cubeonebiz.com/fooddialer/fooddialer.php)` in a new browser tab (`target="_blank"`).


* **Location B: Bill Download Screen**
* **UI Component:** A clean text block situated directly beneath the "Download Bill" button.
* **Copy:** *"Powered by QR-Booking. For enterprise-grade catering and tiffin management systems, visit [FoodDialer.com](https://www.cubeonebiz.com/fooddialer/fooddialer.php)."*



### 1.2 "Call Waiter" & Table Mapping

* **Database/State Changes:** Ensure the client-side session captures the table ID from the URL string parameters (e.g., `?table=04`).
* **Customer UI:** Add a persistent floating action button (FAB) or top-header action labeled `"🔔 Call Waiter"`. Clicking it opens a modal with options: *"Request Water"*, *"Request Bill"*, or *"Need Assistance"*.
* **Chef/Admin UI:** Introduce a dedicated notifications panel or audio-visual alert banner at the top of the Chef Orders page showing: `⚠️ Table 04 requested [Assistance] - 2 mins ago`. Include a "Clear" button to dismiss the alert.

### 1.3 Live Order Status Tracker

* **Database/State Changes:** Add a string schema field `status` to the order object. Valid states: `["pending", "preparing", "ready"]`. Default state is `pending`.
* **Chef/Admin UI:** Replace basic order lists with status columns or add step-progression buttons to each active order card: `[Mark Preparing]` and `[Mark Ready]`.
* **Customer UI:** Upon order submission, redirect the user to a live order summary page containing a visual progression timeline reflecting the real-time database state.

---

## 2. Technical Implementation Architecture

The architecture maps out the state synchronization required between the Customer UI, the backend database, and the Chef Dashboard:

```
[ Customer Interface ] ──( Places Order / Calls Waiter )──> [ Central Database ]
         ▲                                                           │
         │ (Real-time Status Sync)                                   ▼
[ Progress Tracker View ] <──( Updates Order State )─────── [ Chef Dashboard ]

```

---

## 3. Step-by-Step Code Modification Instructions

Follow these step-by-step instructions to apply the changes to your project structure.

1. **Update Database Schemas & State Management:** Backend / Database Setup.
Modify your order schema file to include `tableNumber` (string), `status` (string, default: 'pending'), and create a brand-new collection/table for `waiterRequests` containing fields: `id`, `tableNumber`, `requestType`, `timestamp`, and `isCleared` (boolean).


2. **Inject Backlink Banners into Admin & Bill Views:** Frontend UI Layouts.
Locate your Chef Dashboard layout file and your Invoice/Bill component. Insert the promotional text and anchor HTML tags pointing to the FoodDialer URL. Ensure the links contain `rel="noopener noreferrer"` attributes to keep navigation secure.


3. **Implement the Table-Aware Waiter Call System:** Customer Menu & Admin Alert Feed.
Add a utility function to extract query parameters from the URL when the customer opens the app. Build the floating 'Call Waiter' button component. In the Chef dashboard codebase, write a data polling mechanism or websocket hook to instantly render incoming items from the `waiterRequests` queue.


4. **Build the Live Status Pipeline:** Full-Stack Integration.
Create a secure API route or state-mutation handler named `updateOrderStatus`. Wire this endpoint up to the step-progression buttons on the Chef screen. On the customer side, design the responsive progress-bar component that listens for data changes to that specific order ID.


---

## 4. Key Performance Indicators (KPIs) to Track

* **Click-Through Rate (CTR):** Number of restaurant admins clicking through to the FoodDialer landing page divided by total unique active dashboard sessions.
* **Conversion Assist:** Volume of premium signups arriving with a referrer header originating from your Vercel deployment URL.

---

> **Developer Note:** Ensure that the layout design for the upsell banners remains completely responsive. They must scale gracefully down to small mobile dimensions, as many kitchen managers monitor dashboards using mobile phones or compact 7-inch tablets.