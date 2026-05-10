---
layout: default
title: "NFL Team Trade History Analyzer"
show_title: false
description: "Analyze an NFL team's draft pick trade history across multiple value charts"
thumbnail: "/assets/images/NFL_Draft_logo.svg"
---

<div id="trade-analysis-root">
  <noscript>You need to enable JavaScript to view this tool.</noscript>
  <div class="loading">Loading tool...</div>
</div>

<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- trade-utils.js is plain JS (no JSX) — load BEFORE the babel script -->
<script src="{{ site.baseurl }}/assets/js/trade-utils.js"></script>
<script type="text/babel" src="{{ site.baseurl }}/assets/js/trade-analysis.js"></script>

<style>
@keyframes spin { to { transform: rotate(360deg); } }
.trade-spinner {
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

The NFL Team Trade History Analyzer reviews every draft pick trade a team made in a given NFL Draft, scored across up to five independent value frameworks. Data spans 2010 to the present and is refreshed automatically each week.

## Features

- **All 32 teams, 2010–present** — select any team and year from the logo dropdown and year selector.
- **Multiple value charts** — choose from five frameworks: Rich Hill, Fitzgerald-Spielberger, Expected AV Above Replacement (EAVAR), Jimmy Johnson, and PFF WAR, or use a preset combination.
- **Trade-by-trade breakdown** — each row shows the trading partner (with logo), picks received, picks given, and net value under each selected chart.
- **Color-coded net values** — green shading for trades that favored the selected team; red for trades that cost them, with intensity scaled to the magnitude of the surplus or deficit.
- **Equivalent picks** — each net value is translated into the nearest draft pick or pick combination of equivalent worth on that chart.
- **Season totals row** — aggregate net value across all trades in the year, with equivalent picks for the combined surplus or deficit.
- **PNG export** — download a 1200 × 630 px image of the full results table, suitable for sharing on social media.

## Usage

1. Select a team from the logo dropdown.
2. Choose the draft year from the year selector (defaults to the most recent available year).
3. Pick a value chart preset — **Default** uses Rich Hill, Fitzgerald-Spielberger, and EAVAR; **All 5 Charts** adds Jimmy Johnson and PFF WAR.
4. Click **Analyze**.
5. Read the results table: green cells indicate trades where the team came out ahead on that chart; red cells indicate trades where the team gave away more value.
6. The **Total** row at the bottom of the table shows the cumulative net value across all trades for the season, along with the equivalent pick value of that total.
7. Click **Export PNG** to save the full results table as an image.
