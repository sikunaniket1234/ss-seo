# SS-SEO Test Protocol & Use Cases

## 1. Product Context
SS-SEO is designed for digital agencies to maintain high SEO health for static sites (like portfolios, documentation, or landing pages) without manual code editing.

## 2. Use Cases

### Use Case 1: Site Onboarding & Initial Audit
- **Actor**: Agency User
- **Goal**: Register a local static site and get an initial SEO health report.
- **Flow**:
    1. User clicks "+ Add New Site".
    2. User provides name and the local absolute path (e.g., `C:\sites\myrepo`).
    3. User clicks "Audit".
    4. **Expected**: The system reads the `index.html`, computes scores for Meta, Structure, Accessibility, Technical, and Best Practices. A detailed report with actionable tips is shown.

### Use Case 2: AI-Powered Optimization (Safe Patching)
- **Actor**: Agency User
- **Goal**: Apply SEO improvements suggested by the AI engine.
- **Flow**:
    1. User reviews "AI Optimized Meta Tags" in the Audit Report.
    2. User clicks "Apply AI Suggestions".
    3. **Expected**: System creates a snapshot of the original file, parses the HTML, injects/updates meta tags, and saves the file. A success message confirms the update.

### Use Case 3: Automated Monitoring (Scheduler)
- **Actor**: System (Cron)
- **Goal**: Detect SEO score drops automatically.
- **Flow**:
    1. System runs daily at midnight.
    2. System re-scans all registered local paths.
    3. System updates the `db.json` with the latest scores.
    4. **Expected**: Dashboard reflect latest scores upon next login.

## 3. Test Cases (Manual Verification)

| ID | Test Case | Action | Expected Result |
|----|-----------|--------|-----------------|
| TC1| Add Site | Register `mock-site` folder | Site appears in dashboard list |
| TC2| Initial Audit | Click Audit on `mock-site` | Score > 0 and suggestions like "Missing viewport" appear |
| TC3| Patch Verification | Click "Apply AI Suggestions" | `index.html` in `mock-site` is modified with new meta tags |
| TC4| Snapshot Safety | Check `snapshots/` folder | A backup copy of the original `index.html` exists |
| TC5| Navigation | Click "Scheduler" and "Settings" | Correct pages load without JS errors |

## 4. Verification Check-list
- [ ] Backend is running on port 3000.
- [ ] Frontend is running on port 4200.
- [ ] `db.json` is generated upon first site registration.
- [ ] `/assets/snapshots` directory is created on first patch.
