# PitchLine — Panasonic LED Display Configurator

A web-based configuration tool built for Panasonic's Display Solutions Group (DSG) sales engineering team. PitchLine takes a desired screen footprint and a product model, and instantly returns an optimal cabinet layout, resolution, power draw, and data routing — replacing a manual Excel-based workflow with a real-time interactive tool.

---

## Overview

Sales engineers previously calculated LED display configurations using a static Excel sheet. PitchLine digitizes that logic into a guided, validated, real-time tool that:

- Selects a product and enters target width/height
- Calculates the nearest valid cabinet grid (rounded down to whole cabinets, matching the original Excel logic)
- Displays resolution, total power draw, data chain requirements, and physical dimensions
- Renders a live visual preview of the configured screen
- Exports a branded, client-ready PDF proposal
- Captures and stores submitted proposals as sales leads
- Includes an admin dashboard for managing the product catalog without touching code

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend / Database | Supabase (PostgreSQL) |
| PDF Generation | jsPDF, html2canvas |
| Routing | react-router-dom |
| Hosting | Vercel |

---

## Architecture

The codebase follows a layered architecture to keep calculation logic, data access, and UI strictly separated:

```
src/
├── types/            → TypeScript interfaces (Product, ConfigurationResult, ProposalInfo)
├── repositories/      → Raw Supabase queries — no business logic
├── services/          → Business logic layer, wraps repositories
├── mappers/            → DB row ↔ domain object transformation
├── lib/
│   ├── calculations/   → Pure functions for configuration math
│   └── pdf/             → jsPDF page builders for proposal export
├── components/
│   ├── configurator/    → Main configurator UI (form, results, preview, export)
│   └── admin/             → Admin dashboard UI (product CRUD, lead management)
└── pages/                → Top-level routed pages
```

This separation means calculation logic, data access, and rendering can each be modified independently without breaking the others.

---

## Core Features

### Configuration Engine
Given a product's cabinet dimensions and a requested screen size, the engine calculates the maximum number of whole cabinets that fit (matching the original Excel `ROUNDDOWN` behavior), then derives actual screen size, resolution, total power draw, and module count from that grid.

### Live Screen Preview
A real-time visual representation of the configured screen, including a cabinet grid overlay, used both on-screen and as the basis for the PDF export image.

### Viewing Distance Visualizer
A top-down SVG floor plan diagram showing the screen's optimal viewing distance (derived from pixel pitch), with a labeled distance marker — giving sales engineers a spatial, client-facing way to communicate "how close should viewers stand."

### PDF Proposal Export
Generates a multi-page branded PDF including cover page, configuration summary, technical specifications, and a captured image of the live preview — ready to send to a client.

### Admin Dashboard
A password-protected admin panel for managing the product catalog (add/edit/remove models) and reviewing proposal leads submitted through the configurator, with no code changes required for day-to-day catalog updates.

---

## Getting Started

```bash
# install dependencies
npm install

# set up environment variables
cp .env.example .env
# add your Supabase project URL and anon key

# run the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Project Status

Built during a summer internship with Panasonic's Display Solutions Group, in a short period of 3 weeks.This will be usefu Core configuration engine, screen preview, PDF export, and admin dashboard are complete. Advanced visual features (viewing distance visualization, spatial layout tools) are in active development.

---

## License

Internal Panasonic project — not licensed for external distribution.
