# Strength Matrix

A **Next.js** web app that guides users through a business **SWOT-style questionnaire** (strengths, weaknesses, opportunities, threats). Answers are visualized with charts, summarized in results, and can be exported to **PDF**. Optional **GoHighLevel (Lead Connector)** API routes support contact upsert, file upload, and submit-with-PDF workflows.

## Overview

The app provides a multi-step assessment experience: users complete structured questions, view **Results** with category-level insights, and generate downloadable reports. Server routes under `/api/ghl/*` can integrate with GoHighLevel when environment variables are configured.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, [MUI](https://mui.com/), [Emotion](https://emotion.sh/) |
| Forms | [react-hook-form](https://react-hook-form.com/) |
| Charts | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF), [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable), [html2canvas](https://html2canvas.hertzen.com/) |
| HTTP | [axios](https://axios-http.com/) |
| Notifications | [react-hot-toast](https://react-hot-toast.com/) |

Dev server runs on **port 3001** (`npm run dev`).

## Project structure

```text
strengthmatrix/
├── next.config.js
├── package.json
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── app/                          # Next.js App Router
    │   ├── layout.jsx
    │   ├── page.jsx
    │   ├── HomeClient.jsx
    │   ├── ClientBodyClass.jsx
    │   ├── swot/
    │   │   ├── page.jsx
    │   │   └── SwotClient.jsx
    │   └── api/ghl/
    │       ├── upsert-contact/route.js
    │       ├── contact-file-upload/route.js
    │       └── submit-with-pdf/route.js
    ├── ui/                           # Questionnaire, results, PDF helpers
    │   ├── Questionnaire.jsx
    │   ├── Question.jsx
    │   ├── Results.jsx
    │   ├── ProgressBar.jsx
    │   ├── handleDownloadPdf.jsx
    │   ├── data.js
    │   ├── questions.json
    │   └── newSwot.css
    ├── views/                        # View-specific pages and PDF builders
    │   ├── SwotPage.js
    │   ├── NewSwotPage.js
    │   ├── DiscPage.js
    │   ├── newpdf.js
    │   ├── newpdfBW.js
    │   └── swot.json
    ├── Components/
    │   ├── Header.js
    │   ├── Footer.js
    │   └── Table.js
    ├── fonts/
    ├── App.js                        # Legacy React entry flow
    ├── index.js                      # Legacy React bootstrap
    ├── App.css
    ├── Swot.css
    └── index.css
```

## Getting started

### Prerequisites

- **Node.js** (LTS recommended)
- **npm**

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Production build

```bash
npm run build
npm run start
```

`start` also serves on port **3001**.

## Environment variables (GoHighLevel)

Create `.env` from `.env.example` in the project root:

```powershell
Copy-Item .env.example .env
```

These power the `/api/ghl/*` routes; UI flows can run without them unless those routes are called.

| Variable | Purpose |
|----------|---------|
| `GHL_PRIVATE_INTEGRATION_TOKEN` | Private integration token for Lead Connector API |
| `GHL_LOCATION_ID` | Sub-account / location ID |
| `GHL_API_BASE_URL` | Optional base URL (defaults to `https://services.leadconnectorhq.com`) |
| `GHL_FILE_UPLOAD_CUSTOM_FIELD_ID` | Custom field ID used while uploading/attaching file metadata |
| `GHL_WORKFLOW_WEBHOOK_URL` | Optional webhook URL used in submit-with-PDF flow |

Never commit real tokens or secrets.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server on port 3001 (`next dev -p 3001 --webpack`) |
| `npm run build` | Production build |
| `npm run start` | Production server on port 3001 |

## License and assets

Font files under `src/fonts/` include their own license files (for example OFL / SIL). Follow those license terms when redistributing assets.