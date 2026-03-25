# Strength Matrix

A Next.js application for running behavioral and SWOT-style assessments, presenting interactive results, and generating downloadable PDF reports.  
It includes UI flows for questionnaire input, result visualization, and API endpoints for contact and PDF-related integrations.

## Project Overview

This project is built with the Next.js App Router and React. It combines:

- Assessment screens and question flows
- Result rendering with charts and progress UI
- PDF generation/export utilities.
- API routes for contact upsert, submission, and file upload workflows

## Tech Stack

- Next.js
- React
- Material UI (MUI)
- Chart.js + react-chartjs-2
- jsPDF + jspdf-autotable + html2canvas
- Axios

## Code Structure

```text
Strengthmatrix/
  src/
    app/
      layout.jsx                     # Root layout
      page.jsx                       # Main entry page
      HomeClient.jsx                 # Home client-side logic/UI
      ClientBodyClass.jsx            # Body class management
      swot/
        page.jsx                     # SWOT page route
        SwotClient.jsx               # SWOT route client logic
      api/
        ghl/
          upsert-contact/route.js    # Contact upsert endpoint
          submit-with-pdf/route.js   # Submit flow with PDF endpoint
          contact-file-upload/route.js # Contact file upload endpoint

    ui/
      Questionnaire.jsx              # Question flow UI
      Question.jsx                   # Individual question UI
      Results.jsx                    # Results rendering
      ProgressBar.jsx                # Progress indicator
      handleDownloadPdf.jsx          # PDF download helper
      data.js                        # UI data/config
      questions.json                 # Question dataset
      newSwot.css                    # SWOT-specific styles

    views/
      DiscPage.js                    # DISC view page
      SwotPage.js                    # SWOT view page
      NewSwotPage.js                 # New SWOT view
      newpdf.js                      # PDF generation logic
      newpdfBW.js                    # B/W PDF generation logic
      swot.json                      # SWOT source data

    Components/
      Header.js                      # Header component
      Footer.js                      # Footer component
      Table.js                       # Table component

    index.js                         # Legacy React entry (if used)
    App.js                           # Legacy app shell (if used)
    index.css / App.css / Swot.css   # Global and feature styles

  public/
    index.html
    manifest.json
    robots.txt

  next.config.js
  package.json
  .env.example
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended current LTS)
- npm

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

The app runs on [http://localhost:3001](http://localhost:3001).

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

## Environment Variables

Copy `.env.example` to `.env` and fill required values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Notes

- The repo currently includes both App Router (`src/app`) and legacy React-style files (`src/App.js`, `src/index.js`).  
  The active Next.js route system is under `src/app`.
- Keep secrets in `.env` only; do not commit sensitive values.