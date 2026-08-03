# Tech Lead Context & Execution Plan: Cars24 Server-Driven UI (SDUI) Mobile System

> **Role & Persona:** Act as a Senior Mobile Tech Lead at Cars24. You are architecting a highly scalable, production-ready Server-Driven UI (SDUI) system that eliminates full app release cycles for UI/feature updates on mobile (Android/iOS/React Native).

---

## 1. Assignment Core Goals & Deliverables

1. **Target UI Screen:** Replicate the high-complexity **Cars24 App Home/Landing Screen** completely via SDUI JSON payloads.
2. **Static vs SDUI Benchmark:** Build both a static (hardcoded) version and an SDUI version to measure performance overhead (`PERF.md`).
3. **Generalization & Extension:** Support custom widgets, layouts, unknown component fallbacks, and action handling to achieve high payload-driven coverage (`COVERAGE.md`).
4. **Required Repo Documentation:**
   - `README.md` (Architecture, Schema design rationale, Versioning strategy, Trade-offs)
   - `PERF.md` (TTR, TTI, Full page time, JSON parse vs View build, Scroll perf/jank analysis)
   - `COVERAGE.md` (Widget coverage breakdown, JSON-only vs Native code requirements)
   - `AI_WORKFLOW.md` (AI prompts, rejected outputs, AI failure stories, verification strategies)

---

## 2. Screenshot Analysis & Widget Inventory

Based on the attached screenshots of the Cars24 Home Screen, our SDUI system must support and render the following **8 distinct, highly dynamic section types**:

### Section 1: Header & Sticky Top Bar
* **Location Bar:** Dropdown for selecting city (`Gurgaon` / `Sector 18, Gurugram`) with location icon and avatar.
* **Global Search Bar:** Dynamic placeholder text that cycles depending on context (e.g., *"Search Buy used car"*, *"Search Mahindra cars"*, *"Search Honda cars"*, *"Search FASTag"*).
* **Category Icon Rail (Horizontal Scrollable Chips):**
  * Top Category Row: Icons for `All`, `Buy used car`, `Sell car`, `Loans`, `Challan`, `Car check`, `Insurance`.

### Section 2: Promotional Banner / Category Grid ("Buy car")
* **Header Tag:** `Buy car` with a highlighted offer badge (`Up to ₹80,000 off`).
* **Horizontal Rail Cards:**
  * Dark blue rounded cards (`All used cars`, `Budget used cars`, `Premium used cars`, `New cars`, `New bikes`).

### Section 3: Value-Prop Services Grid ("Sell your car")
* **Grid Section Title:** `Sell your car`
* **Horizontal / Grid Cards:** Dark green rounded cards (`Sell your car`, `Check car valuation`, `Scrap your car`, `Exchange car`).

### Section 4: Circular Service Options ("Get loans")
* **Grid Section Title:** `Get loans`
* **Circular Hero Badges Rail:** Circular background badges with monetary images (`Used car loan`, `Loan against car`, `Personal loan`, `Credit score check`).

### Section 5: Verification & Utility Cards ("Car check services")
* **Grid Section Title:** `Car check services`
* **2x3 Metric Card Grid:** Light cream cards (`New car PDI`, `Used car check`, `Vehicle history`, `Check challan`, `Check car insurance`, `Odometer tampering`).

### Section 6: Product Horizontal Rail ("Used cars you'll love")
* **Section Header:** Title (`Used cars you'll love`) + Action Button (`View all`).
* **Car Listing Cards (Horizontal Scroll):**
  * **Image & Stock Tag:** Image preview + Badge (`Cars24 Owned stock`).
  * **Car Specs:** Year, Make, Model (e.g., `2021 Nissan MAGNITE XV MT`), Kilometers (`49,270 km`), Fuel (`Petrol`), Transmission (`Manual`), Registration State (`HR31`).
  * **Pricing & EMI:** Price (`₹3.86 lakh`), Monthly EMI (`EMI ₹6,819/m*`).
  * **Badges:** `Zero Worry Max`, `Lifetime warranty`.
  * **Interactions:** Wishlist Heart Toggle.

### Section 7: Personal Vehicle Management Hub ("Manage your vehicle")
* **Vehicle Status Hero Unit:**
  * Header: `Manage your vehicle` + `+ Add vehicle`.
  * Vehicle Identification: Registration tag (`HR 26 DY 1610`) on top of a 3D car render with carousel arrows (`<` / `>`).
  * **Metric Action Chips (Horizontal Carousel):**
    * *Insurance Card:* Status badge (`Due` / `Expired 98 days ago`), Expiry Date (`28 Apr, 2026`), Action CTA (`Renew →`).
    * *FASTag Card:* Balance (`₹1657`), Refresh button, Action CTA (`Recharge →`).
    * *Challan Card:* Due amount (`₹0`), Action CTA (`Check →`).
  * **Primary CTA:** White block button (`Manage this vehicle`).
* **Quick Utility Grid ("Check for other vehicles"):**
  * White rounded grid cards (`Pay challan`, `Recharge FASTag`, `Get insurance`, `Cash against car`, `Road side assistance`, `Get warranty`).

### Section 8: Location / Offline Showrooms ("2 showrooms in your city")
* **Header:** `2 showrooms in your city`
* **Showroom Cards:** Image background, stock count tag (`50+ cars`), Location Name (`Udyog Vihar`, `Sector 18, Gurugram`), Distance (`2.4 km from Cyber Hub`), Status (`Closed - Opens at 10:00 AM`), Dual Action Buttons (`Call us now` outline, `View showroom` filled).

---

## 3. System Architecture & Technical Requirements

### A. Core SDUI Engine Architecture
JSON Payload ──> SDUI Parser ──> Component Registry ──> Native View Builder ──> UI Renderer
│
├──> Fallback Renderer (Unknown Component)
└──> Action Handler Dispatcher (Navigation/State)

1. **Component Registry:**
   * Maps server string identifiers (`header_bar`, `category_rail`, `promo_grid`, `product_card_rail`, `vehicle_manager_hub`, `showroom_card`) to native view models/composables.
2. **Action Dispatcher Engine:**
   * Taps, navigation intents, bottom sheet triggers, and internal state modifications must be completely data-driven via JSON.
   * Example Actions: `OPEN_URL`, `NAVIGATE_TO_SCREEN`, `TRIGGER_BOTTOM_SHEET`, `TOGGLE_WISHLIST`, `UPDATE_FILTER_STATE`.
3. **Unknown Component Fallback Strategy:**
   * If an unknown or corrupted component type is received (e.g., `"type": "unsupported_v2_banner"`), the engine **must not crash**.
   * It should log an error telemetry event and render an empty container, a subtle placeholder, or degrade gracefully by hiding the section completely.

---

## 4. Proposed Schema Specification (JSON Blueprint)

```json
{
  "page_id": "home_screen",
  "version": "1.0.0",
  "sections": [
    {
      "id": "header_section",
      "type": "HEADER_BAR",
      "props": {
        "location": {
          "label": "Gurgaon",
          "action": { "type": "OPEN_LOCATION_PICKER" }
        },
        "search_bar": {
          "placeholder": "Search Buy used car",
          "action": { "type": "NAVIGATE_SEARCH" }
        }
      }
    },
    {
      "id": "vehicle_management_section",
      "type": "VEHICLE_MANAGER",
      "props": {
        "title": "Manage your vehicle",
        "vehicle_number": "HR 26 DY 1610",
        "car_image_url": "[https://cdn.cars24.com/assets/ford_ecosport.png](https://cdn.cars24.com/assets/ford_ecosport.png)",
        "cards": [
          {
            "type": "INSURANCE",
            "status": "EXPIRED",
            "title": "Insurance Due",
            "sub_text": "Expired 98 days ago",
            "date": "28 Apr, 2026",
            "cta_text": "Renew",
            "action": { "type": "OPEN_BOTTOM_SHEET", "target": "insurance_renewal_sheet" }
          },
          {
            "type": "FASTAG",
            "title": "FASTag",
            "balance": "₹1657",
            "cta_text": "Recharge",
            "action": { "type": "NAVIGATE", "route": "fastag_recharge" }
          }
        ],
        "primary_cta": {
          "label": "Manage this vehicle",
          "action": { "type": "NAVIGATE", "route": "vehicle_details" }
        }
      }
    },
    {
      "id": "unknown_test_section",
      "type": "EXPERIMENTAL_FUTURE_WIDGET",
      "props": { "data": "dummy" }
    }
  ]
}

5. Execution Checklist for Claude Code
When writing code and documentation, strictly follow this step-by-step roadmap:

[ ] Step 1: Setup Architecture & Schema Engine

Implement the JSON parser and Component Registry mapping server component strings to native views.

Implement the Action Handler to execute payloads (navigations, bottom sheets, chip toggles).

Implement a rock-solid FallbackComponent to gracefully catch unknown widget types.

[ ] Step 2: Replicate Cars24 UI Components

Build all 8 widget sections extracted from the screenshots.

Ensure horizontal scrolling carousels and grid views run smoothly.

[ ] Step 3: Build Static Baseline & Benchmark (PERF.md)

Build the exact same page using static (hardcoded UI components).

Measure metrics on a release build: Time to Render (TTR), Time to Interactive (TTI), Full Page Render Time, JSON Parse vs View Build time, and Scroll FPS/Jank.

Document the exact overhead % and optimization attempts in PERF.md.

[ ] Step 4: Prepare Generalization Specs (COVERAGE.md)

List component coverage percentage (e.g., 85% JSON-only for future screens).

Detail schema extensibility rules and how new widgets can be registered.

[ ] Step 5: Record AI Collaboration Evidence (AI_WORKFLOW.md)

Document system prompts, AI iterations, rejected code blocks, and AI failure stories with root cause analyses.

6. Guidance & Guidelines for AI Assistant
Production-Grade Code: Avoid writing naive pseudo-code. Produce structured, performant native UI code with modular separation of concerns (Parser, Registry, Renderer, ViewModels).

Performance First: Optimize for fast view inflation and efficient JSON deserialization. Use lazy layout containers (LazyColumn, LazyRow, or UICollectionView/RecyclerView) to prevent dropping frames.

Honesty in Benchmarks: Report realistic performance numbers. A 5-15% overhead for SDUI vs Static is standard; highlight how client caching minimizes JSON fetch/parse costs.


---

### Key Highlights of this Context File:
1. **Accurate Screenshot Mapping:** Captures every single widget from the screenshots (Search Bar, Category Rails, Valuation Cards, Loans, 2x3 Check Grid, Car Listings with specs/EMI, Manage Vehicle status cards, and Location Showrooms)[cite: 1].
2. **Explicit Tech Lead Requirements:** Mandates structural registry design, action routing, fallback mechanisms, and performance benchmarking (`PERF.md`) as requested by the assignment brief[cite: 1].
3. **Claude-Ready Structure:** Fully optimized with Markdown headings, JSON blueprints, and checkable execution steps so Claude Code can systematically complete the assessment[cite: 1].