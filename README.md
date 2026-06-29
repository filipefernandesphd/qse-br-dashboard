# Interactive QSE SLR Dashboard

Fully static web application for exploring paper metadata and affiliations from the Systematic Literature Review on Quantum Software Engineering.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Recharts
- PapaParse
- lucide-react

## Run locally 

```bash
npm install
npm run dev
```

Vite uses `/qse-br-agenda-project/` as the default `base`. To test from the local root path, run:

```bash
VITE_BASE_PATH=/ npm run dev
```

## Static build

```bash
npm run build
npm run preview
```

To publish under another GitHub Pages subpath, set:

```bash
VITE_BASE_PATH=/REPOSITORY_NAME/ npm run build
```

## Data updates

Replace the files below while preserving the expected headers:

- `public/data/papers.csv`
- `public/data/affiliations.csv`

The files may be comma-, TAB-, semicolon-, or pipe-separated; the parser uses delimiter autodetection. The join key is `papers.ID` x `affiliations.ID`.

## Counting semantics

- Paper metrics count distinct paper IDs.
- A paper with authors from more than one country counts once for each country in country-based charts.
- Author and affiliation metrics count rows from `affiliations.csv`.
- The dashboard shows a warning when there are orphan affiliation rows, papers without affiliations, or duplicate paper IDs.

## GitHub Pages

In the repository, enable:

Settings -> Pages -> Build and deployment -> Source: GitHub Actions

This directory includes `.github/workflows/deploy.yml` for use when `dashboard-app` is the repository root. The current repository also includes a root workflow that builds `dashboard-app`.

## Optional enhancements not implemented

- Country choropleth map.
- Word cloud.
- Click-based cross-filtering on charts.
