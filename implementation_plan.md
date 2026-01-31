# Implementation Plan - SS-SEO (Static Site SEO Automation)

## Project Overview
SS-SEO is a non-invasive SEO optimization system for static websites. It analyzes HTML artifacts, computes SEO scores, suggests improvements, and safely patches meta tags.

## Tech Stack
- **Backend**: Node.js, Express, Cheerio (HTML parsing), node-cron (scheduling).
- **Frontend**: Angular 17+, SCSS, Chart.js (for SEO trends).
- **AI/NLP**: Natural (Node.js NLP) or a lightweight Python/spaCy integration for keyword extraction.
- **Storage**: LowDB or SQLite for site registry and score history.

## Development Phases

### Phase 1: Foundation & Infrastructure
- [ ] Initialize Backend (Express, directory structure).
- [ ] Initialize Frontend (Angular, SCSS configuration).
- [ ] Set up shared types and configuration schemas.
- [ ] Implement File/URL Ingestion service.

### Phase 2: SEO Analysis Engine (Core)
- [ ] Implement HTML Parser using Cheerio.
- [ ] Develop Scoring Logic:
    - Meta Quality (Title, Description, Robots).
    - Structure (H1, Heading hierarchy).
    - Accessibility (Alt tags, ARIA).
    - Technical (Sitemap, Robots.txt, Links).
- [ ] Create a JSON Schema for SEO audit reports.

### Phase 3: AI Intelligence Layer
- [ ] Implement Keyword Extraction (TF-IDF/TextRank).
- [ ] Develop Title/Meta generator heuristics.
- [ ] Create "Recommendation Engine" to provide actionable tips.

### Phase 4: Meta Update Engine (The "Safe" Patcher)
- [ ] Build a safe HTML modification engine that only touches `<head>` meta tags.
- [ ] Implement "Snapshot & Diff" system for reversible changes.
- [ ] Create Approval Flow (Frontend UI to review/approve patches).

### Phase 5: Agency Dashboard (Premium UI)
- [ ] Design a high-end, glassmorphic dashboard for site management.
- [ ] Implement Score Visualization (Charts, health bars).
- [ ] Create Multi-site Management views.
- [ ] Add Exportable Reports (PDF/JSON).

### Phase 6: Scheduling & Automation
- [ ] Implement cron-based background analysis.
- [ ] Email/Notification system for SEO score drops.

## Design Goals
- **Premium Aesthetics**: Dark mode by default, high-contrast, modern typography (Inter/Outfit).
- **Responsive**: Mobile-friendly dashboard.
- **Explainability**: Every SEO score change must be justified with a "Why?" explanation.
