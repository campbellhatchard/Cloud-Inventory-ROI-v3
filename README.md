# Cloud Inventory — ROI Business Case Builder

A standalone, no-dependency web application for Cloud Inventory sales reps and solutions engineers to build executive-ready ROI business cases for prospects.

---

## Deploy to Render (recommended)

### One-click from GitHub

1. Push this repo to GitHub (all files in the root — no subdirectory)
2. Go to [render.com](https://render.com) and sign in
3. Click **New → Static Site**
4. Connect your GitHub account and select this repository
5. Render auto-detects `render.yaml` — no manual settings needed
6. Click **Create Static Site**

Your app will be live at `https://cloud-inventory-roi.onrender.com` (or your custom domain) within about 60 seconds.

> **Auto-deploys:** Every push to the `main` branch triggers a new deploy automatically.

### Manual Render setup (if not using render.yaml)

| Setting | Value |
|---|---|
| Environment | Static Site |
| Branch | `main` |
| Build Command | *(leave blank)* |
| Publish Directory | `.` |

---

## Other deployment options

### GitHub Pages
1. Push to a GitHub repo
2. Go to **Settings → Pages → Source → main branch / root**
3. Live at `https://<your-org>.github.io/<repo-name>/`

### Netlify
Drag and drop the folder onto [netlify.com/drop](https://app.netlify.com/drop) — no account needed for a quick share link.

### Local (no server needed)
Double-click `index.html` — works directly in any browser.

---

## Features

- **5-metric ROI model** — labor/productivity, shrinkage, carrying costs, OTIF/order accuracy, IT displacement
- **One-time cost modeling** — professional services, hardware, and training as year-0 cash outflows
- **3-year and 5-year NPV** — configurable discount rate, full discounted cash flow table
- **Industry benchmarks** — pre-loaded defaults for 8 verticals
- **Executive presentation** — print-ready business case, exports to PDF via browser print
- **Discovery guide** — 17 structured questions that auto-sync to the calculator
- **Competitive displacement** — built-in narratives for SAP, Oracle, Legacy RF, Spreadsheets, ERP modules
- **Saved scenarios** — stored in browser localStorage; load, compare, delete anytime
- **Responsive** — sidebar collapses to a hamburger menu on mobile

---

## File structure

```
cloud-inventory-roi/
├── index.html      <- App shell and HTML structure
├── style.css       <- Main UI styles (sidebar, live bar, cards, buttons)
├── exec.css        <- Executive presentation and print styles
├── app.js          <- All logic: ROI engine, NPV, benchmarks, competitive data
├── ci-logo.png     <- Cloud Inventory logo
├── render.yaml     <- Render.com deployment config
└── README.md       <- This file
```

---

## Customization

All benchmark and competitive content lives at the top of `app.js`:

- **`IND` object** — industry-level default improvement percentages
- **`COMP` object** — competitive displacement narratives per competitor
- Default field values are in `clearForm()` and in the HTML `value=""` attributes

---

## Data and privacy

All scenario data is stored in the user's browser (localStorage) — nothing is sent to any server. Safe to use with prospect information on any device.

---

Cloud Inventory, a Nextworld Company · cloudinventory.com


## Next iteration included

This package adds the decision-engine layer while preserving the existing layout and branding:

- Hidden operational loss exposure panel
- Diagnostic hypothesis engine
- Cost-of-inaction projection
- Benchmark gap table
- Working capital release estimate
- Executive “aha” section in the printable brief
- Scenario sensitivity and model assurance

Deploy on Render as a Static Site with Publish Directory `.` and no build command.

## Validated rebuild notes

This build includes a value-driver audit panel and regression test coverage for every calculation lever:

- Labor productivity savings
- Shrinkage / write-off reduction
- Inventory carrying cost reduction
- OTIF / service leakage improvement
- IT displacement
- Working-capital release range
- Scenario sensitivity
- Hidden loss exposure
- Cost-of-inaction projection

Run validation locally with:

```bash
node tests/roi-engine.spec.js
```

Expected result:

```text
PASS: ROI engine validates all value fields and decision-engine components.
```

Render deployment remains unchanged: Static Site, publish directory `.`.
