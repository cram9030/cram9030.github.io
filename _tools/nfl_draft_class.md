---
layout: default
title: "NFL Draft Class Analyzer"
show_title: false
description: "Analyze an NFL team's draft class performance across 4 seasons using Approximate Value metrics"
thumbnail: "/assets/images/NFL_Draft_logo.svg"
---

<div id="draft-class-root">
  <noscript>You need to enable JavaScript to view this tool.</noscript>
  <div class="loading">Loading tool…</div>
</div>

<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- trade-utils.js is plain JS (no JSX) — load BEFORE the babel script -->
<script src="{{ site.baseurl }}/assets/js/trade-utils.js"></script>
<script type="text/babel" src="{{ site.baseurl }}/assets/js/draft-class.js"></script>

<style>
@keyframes spin { to { transform: rotate(360deg); } }
.draft-spinner {
  width: 40px; height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #007FBF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;
}
.site-content h2 { font-size: 1.875rem !important; font-weight: 600 !important; margin: 1.5rem 0 1rem 0 !important; }
.site-content h3 { font-size: 1.5rem !important; font-weight: 600 !important; margin: 1.25rem 0 0.75rem 0 !important; }
.site-content ul { margin: 1rem 0 !important; padding-left: 1.5rem !important; }
.site-content ul li { list-style-type: disc !important; margin: 0.25rem 0 !important; }
.site-content strong { font-weight: 700 !important; }
</style>

## Overview

The NFL Draft Class Analyzer evaluates every pick a team made in a given NFL Draft, scored by how much 4-year Approximate Value (AV) each player delivered relative to what was expected at that draft slot.

## Features

- **All 32 teams, 2010–2024** — select any team and year from the logo dropdown and year selector.
- **4-year AV breakdown** — individual season AV columns (observed or projected), plus total 4-year AV, AV above replacement, EAVAR, and surplus AV.
- **Projection models** — for recent drafts where 4 seasons aren't yet complete, choose between Parametric (default), KNN, or Ridge regression projections, or display all three side-by-side.
- **Color-coded surplus** — green shading for picks that out-performed expectations; red for underperformers, scaled by magnitude.
- **Draft class total** — aggregate surplus AV across the entire class shown in the totals row.
- **PNG export** — download a 1200 px-wide image of the full results table including team, GM, and draft year, suitable for sharing on social media.

## Usage

1. Select a team from the logo dropdown.
2. Choose the draft year from the year selector (defaults to 2024).
3. For recent, partially-observed draft classes (2023–2024), a **Projection Model** selector appears — pick **Parametric** (default), **KNN**, **Ridge**, or **All Models**.
4. Read the results table: green surplus cells indicate picks that exceeded the expected value for their slot; red cells indicate underperformance.
5. The **Draft Class Total** row at the bottom shows the cumulative surplus across all picks.
6. Click **Export PNG** to save the full table as an image.

## Metrics

| Column | Description |
|---|---|
| Rnd / Pick | Round and overall pick number |
| {Year} columns | Season AV for each of the 4 years; italic values marked *(p)* are projected |
| 4yr AV | Sum of all four season AV values |
| 4yr AV AR | Total AV minus replacement level × 4 seasons |
| EAVAR | Expected AV Above Replacement for that draft slot (position-based baseline) |
| Surplus AV | 4yr AV AR minus EAVAR — the core value-over-expectation metric |
