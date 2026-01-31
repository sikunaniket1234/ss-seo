# SS-SEO: Static Site SEO Automation System

SS-SEO is a powerful, local-first intelligence tool designed for SEO agencies and developers to audit, optimize, and manage static websites at scale. It combines multi-page crawling with AI-driven intelligence to produce professional, dashboard-style reports.

## 🚀 Key Features

- **Multi-Page Site Crawling**: Recursively scans local project directories for all `.html` files and provides a site-wide health summary.
- **AI-Driven Meta Tag Suggestions**: Automatically generates optimized SEO Titles, Descriptions, and Keywords based on content analysis.
- **Elite Dashboard Reports (PDF)**: Generates professional, A4-ready agency reports featuring:
    - Google Ranking & Visibility visualizations.
    - Circular progress rings for Performance, Accessibility, and Best Practices.
    - Page-by-page optimization blueprints.
- **Readability Analysis**: Computes Flesch-Kincaid readability scores to ensure content is human-friendly.
- **Broken Link Detection**: Scans internal and external links to identify 404s or suspicious anchors.
- **Technical File Generation**: One-click generation of `sitemap.xml` and `robots.txt` based on the actual site structure.
- **AI Image Alt Suggestions**: Suggests descriptive alt-tags for images missing accessibility attributes.

## 🛠️ Technology Stack

- **Frontend**: Angular 18+ (Standalone Components, Signals, SCSS)
- **Backend**: Node.js, Express, TypeScript
- **Database**: LowDB (Local JSON-based store)
- **Engines**: Cheerio (Parsing), Natural (Keyword extraction), Flesch (Readability)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm

### Quick Start (Windows)
We provide a one-click startup script:
1. Clone the repository.
2. Run `npm install` in both `frontend` and `backend` directories.
3. Double-click `start-seo.bat` in the root directory.

### Manual Start
**Backend:**
```bash
cd backend
npm install
npm run build
node dist/index.js
```

**Frontend:**
```bash
cd frontend
npm install
npx ng serve --port 5000
```

## 📄 Usage

1. Open `http://localhost:5000` in your browser.
2. **Add a Site**: Point the tool to your local project directory.
3. **Audit**: Click "Audit" to trigger a deep crawl and AI analysis.
4. **Optimize**: Review AI suggestions and click "Apply AI Suggestions" to patch your local files automatically.
5. **Report**: Click "Export PDF" to generate a professional agency report for your clients.

## 🛡️ Security & Privacy
SS-SEO is designed to be **local-first**. All analysis happens on your machine, and AI suggestions are processed via local keyword extraction methods. Your data never leaves your system unless you choose to push it to a remote Git repository.

---
Built with ❤️ for SEO Professionals.
